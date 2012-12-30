var relayFunctions = {
	init: function(cfg, callback){
		var thisNode = this;
		var self = this;
		if(!cfg || (cfg && (!cfg.port || !cfg.host))){
			if(!cfg){
				cfg = {};
			}
			
			if(!cfg.port){
				cfg.port = 9000;	
			}
			
			if(!cfg.host){
				cfg.host = '0.0.0.0';
			}
		}
		//add properties that are needed by this mixin
		thisNode.addSetting('TCPServer', {
			host: cfg.host,
			port: cfg.port
		});
		//add Events that are emitted by this mixin
		var net = require('net');
		var tcpTunnel = self.TunnelManager.factory('TCP').Tunnel;
		var server = net.createServer(function(socket) { //'connection' listener
		  	var newTunnel = new tcpTunnel();
		  	newTunnel.setSocket(socket);
		  	self.TunnelManager.registerTunnel(false, newTunnel);
		});
		
		server.listen(cfg.port, cfg.host, function(){
			if(self.getSetting('FluxNode.Debug')){
				console.log('TCP Server Listening: '+cfg.host+':'+cfg.port);
			}
			
			if(callback){
				callback(false, cfg);
			}
			
			self.emit('Mixin.Ready', {
				name: 'TCPServer'
			});
			
			self.emit('TCPServer.Started', cfg);
		});
	}
}

if (typeof define === 'function' && define.amd) {
	define(relayFunctions);
} else {
	module.exports = relayFunctions;
}
	