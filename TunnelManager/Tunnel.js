exports = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);
	
if (typeof define === 'function' && define.amd) {
	define(['util', 'EventEmitter2'], function(util, EventEmitter2) {
		var fnConstruct = TunnelBuilder(util, EventEmitter2);
		return fnConstruct;
	});		
} else {
	var util = require('util'), 
	EventEmitter2 = require('eventemitter2').EventEmitter2;
	var fnConstruct = TunnelBuilder(util, EventEmitter2);
	exports.Tunnel = fnConstruct;
}

function TunnelBuilder(util, EventEmitter2){

	function Tunnel(){
		var self = this;
		self.initiated = false;
		self.status = 'connected';
		self._environment = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? 'nodejs' : 'browser');
	}
	
		util.inherits(Tunnel, EventEmitter2);
		
		Tunnel.prototype.initTunnel = function(params){
			
			this.send('init', params);
		}
		
		Tunnel.prototype.connect = function(){
			return false;
		}
		
		Tunnel.prototype.disconnect = function(){
			return false;
		}
	
		Tunnel.prototype.isConnected = function(){
			return false;
		}
	
		Tunnel.prototype.send = function(topic, payload){
			return false;
		}
		
		Tunnel.prototype.getHost = function(){
			return false;
		}
		
		Tunnel.prototype.getPort = function(){
			return false;
		}
	
		Tunnel.prototype.recieve = function(){
			return false;
		}
	return Tunnel;
}
