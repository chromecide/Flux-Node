/**
 * Creates a Tunnel via a serial port
 */
exports = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);
	
if (typeof define === 'function' && define.amd) {
	define(['FluxNode/util', 'EventEmitter2', 'TunnelManager/Tunnel'], function(util, EventEmitter2, Tunnel) {
		return SerialNodeTunnelBuilder(util, EventEmitter2, Tunnel);
	});		
} else {
	var util = require('util'), 
	EventEmitter2 = require('EventEmitter2').EventEmitter2,
	Tunnel = require('../Tunnel.js').Tunnel;
	
	var fnConstruct = SerialNodeTunnelBuilder(util, EventEmitter2, Tunnel);
	exports.Tunnel = fnConstruct;
}

function SerialNodeTunnelBuilder(util, EventEmitter2, Tunnel){
	function SerialNodeTunnel(cfg){
		var self = this;
		
		self.send = send;
		self.recieve = recieve;
		self.close = function(){
			
		}
		
		if(cfg){
			if(cfg.Node1 && cfg.Node2){
				var parentNode = cfg.Node1;
				var childTunnel = self;
				
				return true;
			}
		}
	}
	
		util.inherits(SerialNodeTunnel, Tunnel);
	
	/*
	 * Write a message to the serial port
	 */
	function send(message){
		var self = this;
		self.emit('message', self, message);
	}
	
	/*
	 * Read a message from the serial port
	 * 
	 */
	function recieve(data){
			
	}
	
	return SerialNodeTunnel;
}
