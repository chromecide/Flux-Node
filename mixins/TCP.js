var relayFunctions = {
	init: function(cfg){
		var self = this;
		//add properties that are needed by this mixin
	
		//add Events that are emitted by this mixin
		if(self._environment=='nodejs'){
			var net = require('net');
			var tcpTunnel = self.TunnelManager.factory('TCP').Tunnel;
			var server = net.createServer(function(socket) { //'connection' listener
			  var newTunnel = new tcpTunnel();
			  newTunnel.setSocket(socket);
			  self.TunnelManager.registerTunnel(false, newTunnel);
			});

			server.listen(cfg.port, cfg.host, function(){
				console.log('TCP Server Listening');
				self.emit('tcp_serverstarted', self);
			});
		}else{
			self.FluxNodeUI_alert('Cannot mixin TCP in the browser.  To communicate with this node via TCP, you have to be connected to a TCP compatible NodeJS Node via Websockets');
			return false;
		}
	},
	tcpConnect: function(cfg){
		var self = this;
		var net = require('net');
		var tcpTunnel = self.TunnelManager.factory('TCP').Tunnel;
		var newTunnel = new tcpTunnel();
		var socket = net.connect(cfg.port, cfg.host);
		newTunnel.setSocket(socket);
		
		self.TunnelManager.registerTunnel(false, newTunnel)
	}
}

if (typeof define === 'function' && define.amd) {
	define(relayFunctions);
} else {
	module.exports = relayFunctions;
}
	