var relayFunctions = {
	init: function(cfg){
		var self = this;
		//add properties that are needed by this mixin
	
		//add Events that are emitted by this mixin
		var net = require('net');
		var tcpTunnel = self.TunnelManager.factory('TCP').Tunnel;
		var server = net.createServer(function(socket) { //'connection' listener
			console.log('connection');
		  	var newTunnel = new tcpTunnel();
		  	newTunnel.setSocket(socket);
		  	self.TunnelManager.registerTunnel(false, newTunnel);
		});

		server.listen(cfg.port, cfg.host, function(){
			console.log(cfg);
			console.log('TCP Server Listening');
			self.emit('tcp_serverstarted', self);
		});
	}
}

if (typeof define === 'function' && define.amd) {
	define(relayFunctions);
} else {
	module.exports = relayFunctions;
}
	