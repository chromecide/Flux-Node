exports = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);
	
if (typeof define === 'function' && define.amd) {
	define(['util', 'EventEmitter2', 'Tunnel'], function(util, EventEmitter2, Tunnel) {
		return false;
	});		
} else {
	var util = require('util'), 
	
	EventEmitter2 = require('eventemitter2').EventEmitter2,
	Tunnel = require('../Tunnel.js').Tunnel;
	var Redis = require("redis");
	var fnConstruct = redisTunnelBuilder(util, EventEmitter2, Tunnel, Redis);
	exports.Tunnel = fnConstruct;
}

function redisTunnelBuilder(util, EventEmitter2, Tunnel, redis){
	function redisTunnel(cfg){
		var self = this;
		
		self.send = send;
		self.recieve = recieve;
		self.remoteId = false;
		self.close = function(){}
		
 		createConnection.call(this, cfg);
	}
	
		util.inherits(redisTunnel, Tunnel);
		
	function createConnection(cfg, cb){
		console.log(cfg);
		var self = this;
		self.subscribeClient = redis.createClient();
		self.localId = cfg.localId;
		self.subscribeClient.subscribe(self.localId);
		
		self.publishClient = redis.createClient();
		
		self.subscribeClient.on('message', function(channel, message){
			self.recieve(message);
		});
		
		self.subscribeClient.on('ready', function(){
			self.emit('Tunnel.Ready', self);
		});
	}
	
	function createClient(cfg, cb){
		var self = this;
		
		self.redisClient = redis.createClient();
		console.log(self.redisClient);
		self.redisClient.on('ready', function(){
			self.redisClient.subscribe(self.id);
			
			
			
				
		});
	}
	
	function send(message){
		var self = this;
		console.log(message);
		self.publishClient.publish(self.remoteId, JSON.stringify(message));
	}
	
	function recieve(message){
		var self = this;
		console.log(message);
		self.emit('message', self, JSON.parse(message));
		return true;
	}
	
	return redisTunnel;
}
