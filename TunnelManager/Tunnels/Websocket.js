exports = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);
	
if (typeof define === 'function' && define.amd) {
	define(['FluxNode/util', 'EventEmitter2', 'TunnelManager/Tunnel'], function(util, EventEmitter2, Tunnel) {
		return wsTunnelBuilder(util, EventEmitter2, Tunnel);
	});		
} else {
	var util = require('util'), 
	EventEmitter2 = require('EventEmitter2').EventEmitter2,
	Tunnel = require('../Tunnel.js').Tunnel;
	
	var fnConstruct = wsTunnelBuilder(util, EventEmitter2, Tunnel);
	exports.Tunnel = fnConstruct;
}

function wsTunnelBuilder(util, EventEmitter2, Tunnel){
	function WebsocketTunnel(){
		var self = this;
		
		self.setSocket = setSocket;
		self.send = send;
		self.recieve = recieve;
		self.close = function(){}
	}
	
		util.inherits(WebsocketTunnel, Tunnel);
	
	function setSocket(socket, cb){
		var self = this;
		self.socket = socket;
		self.socket.on('message', function(data){
			self.recieve(data);
		});
		
		self.socket.on('disconnect', function(){
			self.emit('disconnect', self);
		});
		
		if(cb){
			cb(self, socket);
		}
		return true;
	}
	
	function send(message){
		var sck = this.socket;
		sck.send(JSON.stringify(message));
	}
	
	function recieve(data){
		var self = this;
		var message = JSON.parse(data);
		self.emit('message', self, message);
	}
	
	return WebsocketTunnel;
}
