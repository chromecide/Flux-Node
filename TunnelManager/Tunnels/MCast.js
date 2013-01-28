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
		
		self.setServer = setServer;
		self.send = send;
		self.recieve = recieve;
		self.close = close;
	}
	
		util.inherits(MCastTunnel, Tunnel);
	
	function setServer(server, cb){
		var self = this;
		
		self.server = server;
		
		server.on('message', function(data){
			self.recieve(data);
		});
		
		return true;
	}
	
	function send(message){
		var server = this.server;
		
		message.topic = this.localId+'.'+this.peerId+'.'+message.topic;
		
		var buff = new Buffer(JSON.stringify(message));
		server.send(buff);
	}
	
	function recieve(data){
		var self = this;
		var message = JSON.parse(data);
		
		var topicParts = message.topic.split('.');
		var peerId = topicParts[0];
		if(message.topic == peerId+'.'+this.localId+'.MCastTunnels.Announce' || message.topic == peerId+'.*.MCastTunnels.Announce'){
			//do nothing
			this.peerId = peerId;
		}else{
			if(topicParts[1]=='*' || topicParts[1]==this.localId){ //addressed to anyone, or to this tunnel directly
				
				message.topic = message.topic.replace(peerId+'.*.', '').replace(peerId+'.'+this.localId+'.', '');
				self.emit('message', self, message);	
			}
		}
	}
	
	function close(){
		
	}
	return MCastTunnel;
}
