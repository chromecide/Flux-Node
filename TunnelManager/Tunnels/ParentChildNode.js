exports = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);
	
if (typeof define === 'function' && define.amd) {
	define(['FluxNode/util', 'EventEmitter2', 'TunnelManager/Tunnel'], function(util, EventEmitter2, Tunnel) {
		return ParentChildNodeTunnelBuilder(util, EventEmitter2, Tunnel);
	});		
} else {
	var util = require('util'), 
	EventEmitter2 = require('EventEmitter2').EventEmitter2,
	Tunnel = require('../Tunnel.js').Tunnel;
	
	var fnConstruct = ParentChildNodeTunnelBuilder(util, EventEmitter2, Tunnel);
	exports.Tunnel = fnConstruct;
}

function ParentChildNodeTunnelBuilder(util, EventEmitter2, Tunnel){
	function ParentChildNodeTunnel(){
		var self = this;
		
		self.setChildNode = setChildNode;
		self.setParentNode = setParentNode;
		self.send = send;
		self.recieve = recieve;
		self.close = function(){}
	}
	
		util.inherits(ParentChildNodeTunnel, Tunnel);
	
	function setChildNode(nd, cb){
		
		var self = this;
		self.Node = nd;
	}
	
	function setParentNode(nd, cb){
		var self = this;
		self.ParentNode = nd;
	}
	
	function send(message){
		var self = this;
		self.emit('message', message);
	}
	
	function recieve(data){
			
	}
	
	return ParentChildNodeTunnel;
}
