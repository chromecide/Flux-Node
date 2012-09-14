exports = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);
	
if (typeof define === 'function' && define.amd) {
	define(['util', 'EventEmitter2', 'Tunnel'], function(util, EventEmitter2, Tunnel) {
		return IntraProcessNodeTunnelBuilder(util, EventEmitter2, Tunnel);
	});		
} else {
	var util = require('util'), 
	EventEmitter2 = require('EventEmitter2').EventEmitter2,
	Tunnel = require('../Tunnel.js').Tunnel;
	
	var fnConstruct = IntraProcessNodeTunnelBuilder(util, EventEmitter2, Tunnel);
	exports.Tunnel = fnConstruct;
}

function IntraProcessNodeTunnelBuilder(util, EventEmitter2, Tunnel){
	function IntraProcessNodeTunnel(cfg){
		var self = this;
		
		self.setChildNode = setChildNode;
		self.setParentNode = setParentNode;
		self.send = send;
		self.recieve = recieve;
		self.close = function(){}
		if(cfg){
			if(cfg.Node1 && cfg.Node2){
				var parentNode = cfg.Node1;
				var childTunnel = self;
				childTunnel.setChildNode(cfg.Node1);
				childTunnel.setParentNode(cfg.Node2);
				cfg.Node1.TunnelManager.registerTunnel(cfg.Node1.id, childTunnel);
				cfg.Node2.TunnelManager.registerTunnel(cfg.Node2.id, childTunnel);
				return true;
			}
		}
	}
	
		util.inherits(IntraProcessNodeTunnel, Tunnel);
	
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
		self.emit('message', self, message);
	}
	
	function recieve(data){
			
	}
	
	return IntraProcessNodeTunnel;
}
