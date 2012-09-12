exports = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);
	
if (typeof define === 'function' && define.amd) {
	define(['util', 'EventEmitter2', 'TunnelManager/Tunnel'], function(util, EventEmitter2, Tunnel) {
		return TunnelManagerBuilder(util, EventEmitter2, Tunnel);
	});		
} else {
	var util = require('util'), 
	EventEmitter2 = require('EventEmitter2').EventEmitter2,
	Tunnel = require('./Tunnel.js').Tunnel;
	//svar fnConstruct = TunnelManager;
	exports.TunnelManager = TunnelManagerBuilder(util, EventEmitter2, Tunnel);
}

var debug = true;
var allowRelay = false;
var tunnels = {};
var rulesTable = [
	
];

//this wrapper allows us to deal with the differnce in requireing modules between browser async and NodeJS
function TunnelManagerBuilder(util, EventEmitter2, Tunnel){
	var TunnelManager = function(){
		var self = this;
		self.senderID = false;
		self.unsentQueue = [];
		self._environment = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? 'nodejs' : 'browser');
		EventEmitter2.call({
			delimiter: '.',
			wildcard: true
		});
	}
	
		util.inherits(TunnelManager, EventEmitter2);
		
		TunnelManager.prototype.configureManager = configure;
		TunnelManager.prototype.send = send;
		TunnelManager.prototype.recieve = recieve;
		TunnelManager.prototype.registerTunnel = registerTunnel;
		TunnelManager.prototype.deregisterTunnel = deregisterTunnel;
		TunnelManager.prototype.factory = function(type, callback){
			var self = this;
			if(self._environment=='nodejs'){
				var tunnelDef = require('./Tunnels/'+type);
				return tunnelDef;
			}else{
				require(['./Tunnels/'+type], callback);
			}
		}
	return TunnelManager;
}



function configure(cfg){
	var self = this;
	if(cfg.rulesTable!='undefined'){
		rulesTable = cfg.rulesTable;
	}
	
	if(cfg.debug===false){
		debug = cfg.debug;
	}
	
	if(cfg.allowRelay===true){
		allowRelay = cfg.allowRelay;
	}
	
	if(cfg.sender){
		self.senderID = cfg.sender;
	}
}

function send(destination, topic, message, callback){
	
	var self = this;
	var payload = {
		topic: topic,
		message: message
	}
	
	if(typeof destination == 'object'){ //it's a tunnel, so we already know where we are sending it
		payload._message = {
			id: generateID(),
			sender: self.senderID,
			topic: topic
		}
	}else{
		payload._message = {
			id: generateID(),
			sender: self.senderID,
			destination: destination,
			topic: topic
		}
		
		if(tunnels[destination]){
			destination = tunnels[destination];
		}
	}
	
	if(destination && (typeof destination=='object')){
		destination.send(payload);
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
}

function recieve(tunnelObj, message){
	var self = this;
	
	if(!message._message){
		console.log(arguments);
		return false;
	}
	if(debug){
		console.log(message._message.sender+'\t\t'+message._message.destination+'\t\t'+message.topic+'\t\t');
	}
	
	if(message._message.sender!=self.senderID){
		if(!message._message.destination || message._message.destination==self.senderID){ //addressed to me
			
			switch(message.topic){
				case 'init': //introductions
					var remoteID = message._message.sender;
					tunnelObj.initiated = true;
					if(message.message.allowRelay===true){
						allowRelay = true;
						tunnelObj.allowRelay = true;
					}
					tunnelObj.remoteId = remoteID;
					if(!tunnels[remoteID]){
						tunnels[remoteID] = tunnelObj;
					}
					self.emit('tunnelready', remoteID, tunnelObj);
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

function registerTunnel(remoteID, tunnelObj){
	var self = this;
	if(tunnels[remoteID]){
		deregisterTunnel(remoteID);
	}
	
	if(!remoteID){//we need to do some comms with the other end to introduce ourselves
		tunnelObj.on('message', function(tunnelObj, message){
			self.recieve(tunnelObj, message);
		});
		
		tunnelObj.on('disconnect', function(tunnel){
			self.deregisterTunnel(tunnel.remoteId);
		});
		
		self.send(tunnelObj, 'init', {
			allowRelay: allowRelay
		});
	}else{
		tunnelObj.remoteId = remoteID;
		tunnelObj.on('message', function(tunnelObj, message){
			self.recieve(tunnelObj, message);
		});
		
		tunnelObj.on('disconnect', function(){
			self.deregisterTunnel(tunnelObj.remoteId);
		});
		
		self.send(tunnelObj, 'init', {
			allowRelay: allowRelay
		});
		
		tunnels[tunnelObj.remoteID] = tunnelObj;
	}
}

function deregisterTunnel(remoteID){
	var self = this;
	if(tunnels[remoteID]){
		tunnels[remoteID].close();
		delete tunnels[remoteID];
	}
	self.emit('tunnelclosed', remoteID);
}


function generateID(){
	var newID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
	    return v.toString(16);
	});
	return newID;
}