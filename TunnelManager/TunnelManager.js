	exports = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);
	
if (typeof define === 'function' && define.amd) {
	define(['../util', 'EventEmitter2', 'Tunnel'], function(util, EventEmitter2, Tunnel) {
		return TunnelManagerBuilder(util, EventEmitter2, Tunnel);
	});	
	
} else {
	var util = require('util'), 
	EventEmitter2 = require('eventemitter2').EventEmitter2,
	Tunnel = require('./Tunnel.js').Tunnel;
	//svar fnConstruct = TunnelManager;
	exports.TunnelManager = TunnelManagerBuilder(util, EventEmitter2, Tunnel);
}

var debug = false;
var allowRelay = false;
var tunnels = {};
var rulesTable = [
	
];

//this wrapper allows us to deal with the differnce in requireing modules between browser async and NodeJS
function TunnelManagerBuilder(util, EventEmitter2, Tunnel){
	var TunnelManager = function(cfg){
		var self = this;
		self.senderID = false;
		self.unsentQueue = [];
		self._environment = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? 'nodejs' : 'browser');
		EventEmitter2.call({
			delimiter: '.',
			wildcard: true
		});
		
		if(cfg){
			configure.call(this, cfg);
		}else{
			self.emit('TunnelManager.Ready', self);
		}
		
	}
	
		util.inherits(TunnelManager, EventEmitter2);
		
		TunnelManager.prototype.configureManager = configure;
		TunnelManager.prototype.send = send;
		TunnelManager.prototype.recieve = recieve;
		TunnelManager.prototype.getTunnel = getTunnel;
		TunnelManager.prototype.registerTunnel = registerTunnel;
		TunnelManager.prototype.deregisterTunnel = deregisterTunnel;
		TunnelManager.prototype.allowed = allowed;
		TunnelManager.prototype.processData = processData;
		TunnelManager.prototype.factory = function(type, callback){
			var self = this;
			if(self._environment=='nodejs'){
				//first try and include from the standard paths
				var tunnelDef= false;
				try{
					tunnelDef = require(type);
				}catch(e){
					//nothing to see here, move along
				}
				
				//fallback to the tunnels directory
				if(!tunnelDef){
					//console.log(__dirname+'/Tunnels/'+type);
					tunnelDef = require(__dirname+'/Tunnels/'+type);	
				}
				
				if(callback){
					callback(tunnelDef);
				}
				return tunnelDef;
			}else{
				require(['./Tunnels/'+type], callback);
			}
		}
	return TunnelManager;
}

function configure(cfg, callback){
	
	if(!cfg){
		cfg = {};
	}
	
	var self = this;
	
	
	self._config = cfg;
	
	if(cfg.rulesTable!='undefined'){
		rulesTable = cfg.rulesTable;
	}
	
	if(cfg.debug===true){
		debug = cfg.debug;
	}
	
	if(cfg.allowRelay===true){
		allowRelay = cfg.allowRelay;
	}
	
	if(cfg.sender){
		self.senderID = cfg.sender;
	}
	
	if(cfg.senderName){
		self.name = cfg.senderName;
	}
	
	if(cfg.allowed){
		self.allowed = cfg.allowed;
	}
	
	if(cfg.tunnels){
		function tunnelLoop(){
			if(cfg.tunnels.length==0){
				if(callback){
					callback(self._config);
				}
				self.emit('TunnelManager.Ready', self, self._config);
				return;
			}
			
			var tunnel = cfg.tunnels.shift();
			self.factory(tunnel.type, function(tunnelDefinition){
				
				tunnelDef = tunnelDefinition.Tunnel;
				var newTunnel = new tunnelDef(tunnel.options);
				newTunnel.remoteID = tunnel.destination;
				newTunnel.on('Tunnel.Ready', function(){
					//console.log('registering tunnel');
					self.registerTunnel(tunnel.destination, newTunnel, tunnelLoop);
				});
				
			});
		}
		
		tunnelLoop();
	}else{
		if(callback){
			callback(self._config);
		}
		self.emit('TunnelManager.Ready', self, self._config);	
	}
	
	
}

function processData(action, destination, topic, message, callback){
	callback(destination, topic, message);
	return true;
}

function allowed(action, destination, topic, message, callback){
	if(callback){
		callback(false, true);
	}
	return false;//by default, everyone is allowed to do anything
}


function send(destination, topic, message, inReplyTo, callback){
	
	var self = this;
	
	if((typeof inReplyTo)=='function'){
		callback = inReplyTo;
		inReplyTo = false;
	}
	
	var messageId = generateID();
	
	self.allowed('send', destination, topic, message, function(err, result){
		if(err || !result){
			if(callback){
				callback(false, destination, topic, message);	
			}
			return false;	
		}else{
			self.processData('send', destination, topic, message, function(clnDestination, clnTopic, clnMessage){
			
			var payload = {
				topic: clnTopic,
				message: clnMessage
			}
			
			if(typeof destination == 'object'){ //it's a tunnel, so we already know where we are sending it
				payload._message = {
					id: messageId,
					sender: self.senderID,
					destination: destination.remoteId,
					topic: clnTopic,
				}
			}else{
				payload._message = {
					id: messageId,
					sender: self.senderID,
					destination: destination,
					topic: clnTopic
				}
				
				if(tunnels[destination]){
					destination = tunnels[destination];
				}else{
					console.log('DEST TUNNEL NOT FOUND');
				}
			}
			
			if(inReplyTo){
				payload._message.inReplyTo = inReplyTo;
			}
			
			if(destination && (typeof destination=='object')){
				destination.send(payload);
				return messageId;
			}else{
				switch(destination){
					case '*':
						for(var tunnelDest in tunnels){
							var thisTunnel = tunnels[tunnelDest];
							thisTunnel.send(payload);
						}
						break;
					default:
						if(allowRelay===true){
							for(var tunnelDest in tunnels){
								var thisTunnel = tunnels[tunnelDest];
								if(thisTunnel.allowRelay===true){
									thisTunnel.send(payload);
								}else{
									console.log('No Relaying allowed for: '+tunnelDest);
								}
							}
						}else{
							console.log('Relay not allowed');
						}	
						break;
				}
				
				return false;
			}	
		});		
		}
	});
	return messageId;
}

function recieve(tunnelObj, message){
	var self = this;
	if(!message._message){//not a valid FluxNode message
		//console.log(arguments);
		return false;
	}
	self.allowed('recieve', tunnelObj, message.topic, message, function(err, result){
		if(err ||!result){
			if(debug){
				console.log('RECV: \t\t'+message._message.sender+'\t\t'+message._message.destination+'\t\t'+message.topic+'\t\tNOT ALLOWED');
			}
			return false;	
		}else{
			if(debug){
				console.log('RECV: \t\t'+message._message.sender+'\t\t'+message._message.destination+'\t\t'+message.topic+'\t\tALLOWED');
			}
			if(message._message.sender!=self.senderID){
				if(!message._message.destination || message._message.destination==self.senderID){ //addressed to me, or there is no destination(i.e. everyone)
					switch(message.topic){
						case 'init': //introductions
							var remoteID = message._message.sender;
							tunnelObj.initiated = true;
							
							if(message.message.allowRelay===true){
								allowRelay = true;
								tunnelObj.allowRelay = true;
							}
							
							if(message.message.name){
								tunnelObj.name = message.message.name;
							}
							
							tunnelObj.remoteId = remoteID;
							if(!tunnels[remoteID]){
								tunnels[remoteID] = tunnelObj;
								
							}
							self.send(remoteID, 'init_response', {
								name: self.name,
								allowRelay: allowRelay
							});
						
							self.emit('Tunnel.Ready', remoteID, tunnelObj);
							break;
						case 'init_response':
							console.log('INIT RESPONSE');
							var remoteID = message._message.sender;
							tunnelObj.initiated = true;
							
							if(message.message.allowRelay===true){
								allowRelay = true;
								tunnelObj.allowRelay = true;
							}
							
							if(message.message.name){
								tunnelObj.name = message.message.name;
							}
							
							tunnelObj.remoteId = remoteID;
							if(!tunnels[remoteID]){
								tunnels[remoteID] = tunnelObj;
							}
							self.emit('Tunnel.Ready', remoteID, tunnelObj);
							break;
						default:
							self.emit('message', message);
							break;
					}	
				}else{
					
					if(allowRelay===true){
						for(var tunnelDest in tunnels){
							if(message._message.destination==tunnelDest){
								tunnels[tunnelDest].send(message);
							}		
						}	
					}else{
						console.log('relay not allowed');
					}	
				
				}
			}
		}
	});
}

function getTunnel(destination){
	return tunnels[destination];
}

function registerTunnel(remoteID, tunnelObj, callback){
	var self = this;
	
	if(tunnels[remoteID]){
		//console.log('disconnecting');
		self.deregisterTunnel(remoteID);
	}
	
	if(!remoteID){//we need to do some comms with the other end to introduce ourselves
		tunnelObj.localId = self.senderID;
		if(tunnelObj.status=='ready'){
			
			tunnels[tunnelObj.remoteId] = tunnelObj;
			self.emit('Tunnel.Ready', tunnelObj.remoteId, tunnelObj);
		}else{
			tunnelObj.on('Tunnel.Ready', function(tunnelObj){
				tunnels[tunnelObj.remoteId] = tunnelObj;
				self.emit('Tunnel.Ready', tunnelObj.remoteId, tunnelObj);
			});	
		}
		
		
		tunnelObj.on('message', function(tunnelObj, message){
			self.recieve(tunnelObj, message);
		});
		
		tunnelObj.on('disconnect', function(tunnel){
			self.deregisterTunnel(tunnel.remoteId);
		});
		
	}else{
		tunnelObj.localId = self.senderID;
		tunnelObj.remoteId = remoteID;
		
		tunnelObj.on('message', function(tunnelObj, message){
			self.recieve(tunnelObj, message);
		});
		
		tunnelObj.on('disconnect', function(){
			self.deregisterTunnel(remoteID);
		});
		
		tunnels[remoteID] = tunnelObj;
		
		
		if(tunnelObj.status=='ready'){
			self.emit('Tunnel.Ready', remoteID, tunnelObj);
		}else{
			tunnelObj.on('Tunnel.Ready', function(tunnelObj){
				self.emit('Tunnel.Ready', remoteID, tunnelObj);	
			});	
		}
	}
	
	if(callback){
		callback(remoteID, tunnelObj);
	}
}

function deregisterTunnel(remoteID){
	var self = this;
	if(tunnels[remoteID]){
		tunnels[remoteID].close();
		
		delete tunnels[remoteID];
	}
	console.log('deregistering tunnel');
	self.emit('Tunnel.Closed', remoteID);
}


function generateID(){
	var newID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
	    return v.toString(16);
	});
	return newID;
}