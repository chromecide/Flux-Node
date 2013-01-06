
var relayFunctions = {
	init: function(cfg, callback){
		
		var self = this;
		
		if(!cfg){
			cfg = {};
		}
		
		if(!cfg.host){
			cfg.host = 'localhost';
		}
		
		if(!cfg.port){
			cfg.port = 8080;
		}
		
		//add properties that are needed by this mixin
	
		//add Events that are emitted by this mixin
		if(self._environment=='nodejs'){
			var io = require('socket.io').listen(cfg.port);
			io.set('log level', 1);
			io.sockets.on('connection', function (socket) {
				//register a tunnel with the tunnel manager
				var wsTunnel = self.TunnelManager.factory('Websocket').Tunnel;
				var newTunnel = new wsTunnel();
				newTunnel.setSocket(socket);
				self.TunnelManager.registerTunnel(false, newTunnel);
			});
			
			self.emit('Mixin.Ready', {
				name: 'Websockets'
			});
			
			if(callback){
				callback();
			}
		}else{
			require(['http://'+cfg.host+':'+cfg.port+'/socket.io/socket.io.js', 'TunnelManager/Tunnels/Websocket'], function(io, Tunnel){
				alert('here');
				var socket = window.io.connect(cfg.host, {
					port: cfg.port
				});
				
				var wsTunnel = new Tunnel();
				wsTunnel.setSocket(socket, function(){
					self.TunnelManager.registerTunnel(false, wsTunnel, function(){
						if(callback){
							callback();
						}
						
						self.emit('Mixin.Ready', {
							name: 'Websockets'
						});
					});
				});
			}, function(err){
				var failedId = err.requireModules && err.requireModules[0];
				if(failedId){
					self.emit('Require.Error', {
						id: failedId,
						msg: 'Could not load '+failedId
					}, self);
				}
			});
		}
	},
	relay_onConnect: function(){
		var self = this;
	},
	relay_onDisconnect: function(){
		var self = this;
	},
	relay_onMessage: function(){
		var self = this;
	},
	relay_send: function(){
		var self = this;
	}
}

if (typeof define === 'function' && define.amd) {
	define(relayFunctions);
} else {
	module.exports = relayFunctions;
}
	