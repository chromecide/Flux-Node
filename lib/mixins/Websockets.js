var relayFunctions = {
	init: function(cfg){
		var self = this;
		//add properties that are needed by this mixin
	
		//add Events that are emitted by this mixin
		if(self._environment=='nodejs'){
			var io = require('socket.io').listen(cfg.port);
			
			io.sockets.on('connection', function (socket) {
				//register a tunnel with the tunnel manager
				var wsTunnel = self.TunnelManager.factory('Websocket').Tunnel;
				var newTunnel = new wsTunnel();
				newTunnel.setSocket(socket);
				self.TunnelManager.registerTunnel(false, newTunnel);
			});
		}else{
			require(['http://'+cfg.host+':'+cfg.port+'/socket.io/socket.io.js', 'TunnelManager/Tunnels/Websocket'], function(io, Tunnel){
				var socket = window.io.connect(cfg.host, {
					port: 8080
				});
				
				var wsTunnel = new Tunnel();
				wsTunnel.setSocket(socket, function(){
					self.TunnelManager.registerTunnel(false, wsTunnel);
				});
			}, function(err){
				var failedId = err.requireModules && err.requireModules[0]
				if(failedId){
					self.FluxNodeUI_alert('Require Failed for: '+failedId);
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
	