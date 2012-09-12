exports = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);
	
if (typeof define === 'function' && define.amd) {
	define(['util', 'EventEmitter2', 'Tunnel'], function(util, EventEmitter2, Tunnel) {
		return tcpTunnelBuilder(util, EventEmitter2, Tunnel);
	});		
} else {
	var util = require('util'), 
	EventEmitter2 = require('EventEmitter2').EventEmitter2,
	Tunnel = require('../Tunnel.js').Tunnel;
	
	var fnConstruct = tcpTunnelBuilder(util, EventEmitter2, Tunnel);
	exports.Tunnel = fnConstruct;
}

function tcpTunnelBuilder(util, EventEmitter2, Tunnel){
	function TCPTunnel(cfg){
		var self = this;
		
		self.setSocket = setSocket;
		self.send = send;
		self.recieve = recieve;
		self.close = function(){}
		if(cfg){
			var net = require('net');
			var socket = net.connect(cfg.port, cfg.host, function(){	
			});
			self.setSocket(socket);
		}
	}
	
		util.inherits(TCPTunnel, Tunnel);
	
	function setSocket(socket, cb){
		var self = this;
		self.socket = socket;
		self.socket.on('data', function(data){
			self.recieve(data);
		});
		
		self.socket.on('end', function(){
			self.socket.end();
			self.emit('disconnect', self);
		});
		
		if(cb){
			cb(self, socket);
		}
		return true;
	}
	
	function send(message){
		var sck = this.socket;
		sck.write(JSON.stringify(message)+'\0\0');
	}
	
	function recieve(dataBuffer){
		var self = this;
		var self = this;
		
		if(!self.messageQueue){
			self.messageQueue = [];
			self.lastMessageFinished = true;
		}
		
		var newMessageArr = dataBuffer.toString().split('');
		for(var cIdx=0;cIdx<newMessageArr.length-1;cIdx++){
			var curChar = newMessageArr[cIdx];
			if(self.lastMessageFinished){//new message
				self.messageQueue.push('');
				if(curChar!='\0'){
					self.lastMessageFinished = false;
					self.messageQueue[self.messageQueue.length-1]+= curChar;
				}else{
					self.lastMessageFinished = true;
				}
			}else{//continue last message
				if(curChar!='\0'){
					self.messageQueue[self.messageQueue.length-1]+= curChar;	
				}else{
					self.lastMessageFinished = true;
				}
			}
			
		}
		
		if(self.messageQueue.length>0){
			if(self.messageQueue.length==1){
				if(self.lastMessageFinished){
					var newMessage = self.messageQueue.shift();
					self.emit('message', self, JSON.parse(newMessage));
				}
			}else{
				var lastCompleteIdx = self.messageQueue.length;
				if(!self.lastMessageFinished){
					lastCompleteIdx--;
				}
				
				for(var mIdx=0;mIdx<lastCompleteIdx;mIdx++){
					var newMessage = self.messageQueue.shift();
					self.emit('message', self, JSON.parse(newMessage));
				}
			}
		}
	}
	
	return TCPTunnel;
}
