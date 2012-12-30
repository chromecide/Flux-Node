exports = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);
	
if (typeof define === 'function' && define.amd) {
	define(['util', 'EventEmitter2', 'Tunnel'], function(util, EventEmitter2, Tunnel) {
		return false;
	});		
} else {
	var util = require('util'), 
	
	EventEmitter2 = require('eventemitter2').EventEmitter2,
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
				self.emit('Tunnel.Ready', self);	
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
		//create a buffer to send the object with
		
		var bufferedMessage = new Buffer(JSON.stringify(message)+'\0');
		sck.write(bufferedMessage);
	}
	
	function recieve(dataBuffer, internal){
		var self = this;
		
		var dataString = dataBuffer.toString();
		var messages = dataString.split('\0');
		if(messages.length==0){
			self.emit('message', self, JSON.parse(dataBuffer.toString().replace('\0', '')));	
		}else{
			for(var i=0;i<messages.length;i++){
				try{
					var msg=JSON.parse(messages[i]);
					self.emit('message', self, msg);
				}catch(e){
					if(messages[i]){
						console.log("TOO MANY MESAGES");
						console.log(messages[i]);	
					}
				}
				
			}
		}
		
		return true;
	}
	
	return TCPTunnel;
}
