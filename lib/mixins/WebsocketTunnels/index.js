
var relayFunctions = {
	init: function(cfg, callback){
		
		var self = this;
		var thisNode = this;
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
				newTunnel.localId = thisNode.id;
				
				newTunnel.on('Tunnel.Ready', function(){
					self.TunnelManager.registerTunnel(newTunnel.remoteId, newTunnel);	
				});
				
				newTunnel.setSocket(socket);
			});
			
			var returnObject = {
				name: 'WebsocketTunnels',
				meta: self._environment=='nodejs'?require(__dirname+'/package.json'):{},
				config: cfg
			};
			
			if(callback){
				callback(false, returnObject);
			}
			
			self.emit('Mixin.Ready', returnObject);
			
		}else{
			require(['http://'+cfg.host+':'+cfg.port+'/socket.io/socket.io.js', 'TunnelManager/Tunnels/Websocket'], function(io, Tunnel){
				var socket = window.io.connect(cfg.host, {
					port: cfg.port
				});
				
				var wsTunnel = new Tunnel();
				wsTunnel.localId = thisNode.id;
				wsTunnel.once('Tunnel.Ready', function(){
					self.ServerID = wsTunnel.RemoteId;
					self.TunnelManager.registerTunnel(wsTunnel.id, wsTunnel, function(){
						var returnObject = {
							name: 'WebsocketTunnels',
							meta: self._environment=='nodejs'?require(__dirname+'/package.json'):{},
							config: cfg
						};
						
						if(callback){
							callback(false, returnObject);
						}
						
						self.emit('Mixin.Ready', returnObject);
					});
				});
				wsTunnel.setSocket(socket);
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
	