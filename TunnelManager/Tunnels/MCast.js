exports = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);
	
	var util = require('util'), 
	EventEmitter2 = require('eventemitter2').EventEmitter2,
	Tunnel = require('../Tunnel.js').Tunnel;
	
	var fnConstruct = mcastTunnelBuilder(util, EventEmitter2, Tunnel);
	exports.Tunnel = fnConstruct;


function mcastTunnelBuilder(util, EventEmitter2, Tunnel){
	function MCastTunnel(){
		var self = this;
		
		Tunnel.call(this, arguments);
		
		self.status = 'closed';
		self.setServer = setServer;
		self.send = send;
		self.recieve = recieve;
		self.close = close;
		self.init = init;
		self.initRecieve = initRecieve;
		self.recievedMessages = {};
	}
	
		util.inherits(MCastTunnel, Tunnel);
	
	function init(doInit){
		//send an init call and wait for an init_response
		var self = this;
		
		self.status = 'pending';
		if(doInit){
			self.server.once('message', function(data){
				self.initRecieve(data);
			});
			
			self.send({
				topic: 'init'
			});	
		}else{
			self.send({
				topic: 'init_response'
			});
			
			self.server.on('message', function(data, remote){
				
				self.recieve(data);
			});
			
			self.status = 'ready';
			self.emit('Tunnel.Ready', self);
		}
	}
	
	function initRecieve(data){
		var self = this;
		var message = JSON.parse(data.toString());
		if(message.topic==self.remoteId+'.'+self.localId+'.init_response'){ //we're waiting for an init_response
			
			self.server.on('message', function(data, remote){
				
				self.recieve(data);
			});
			self.status = 'ready';
			self.emit('Tunnel.Ready', self);
		}else{
			self.server.once('message', function(data){
				self.initRecieve(data);
			});
		}
	}
	
	function setServer(server, cb){
		var self = this;
		
		self.server = server;
		
		return true;
	}
	
	function send(message){
		var server = this.server;
		
		message.topic = this.localId+'.'+this.remoteId+'.'+message.topic;
		var buff = new Buffer(JSON.stringify(message));
		server.send(buff);
	}
	
	function recieve(data){
		var self = this;
		var message = JSON.parse(data);
		
		if(self.status=='ready'){
			if(message._message && message._message.id && !self.recievedMessages[message._message.id]){// already recieved this one
				if(message.sender==self.remoteID){
					self.recievedMessages[message._message.id] = true;
					var topicParts = message.topic.split('.');
					var peerId = topicParts[0];
					if(peerId!=this.localId){
						if(message.topic == peerId+'.'+this.localId+'.MCastTunnels.Announce' || message.topic == peerId+'.*.MCastTunnels.Announce'){
							//do nothing
							//this.peerId = peerId;
						}else{
							if(topicParts[1]=='*' || topicParts[1]==this.localId && topicParts[0]==self.remoteId){ //addressed to anyone, or to this tunnel directly
								
								message.topic = message.topic.replace(peerId+'.*.', '').replace(peerId+'.'+this.localId+'.', '');
								self.emit('message', self, message);	
							}
						}	
					}	
				}
			}	
		}else{
			console.log('TUNNEL NOT READY');
		}
	}
	
	function close(){
		var self = this;
		self.status = 'closed';
	}
	return MCastTunnel;
}
