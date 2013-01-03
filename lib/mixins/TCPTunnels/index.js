var relayFunctions = {
	init: function(cfg, callback){
		var thisNode = this;
	
		if(!cfg){
			cfg = {};
		}
		
		if(!cfg.host){
			cfg.host = 'localhost';
		}
		
		if(!cfg.port){
			cfg.port = 9000;
		}
	
		
		thisNode.addSetting('TCPTunnels', {
			host: cfg.host,
			port: cfg.port
		});
	
		if(thisNode._environment=='nodejs'){
			var net = require('net');
			var tcpTunnel = thisNode.TunnelManager.factory('TCP').Tunnel;
			var server = net.createServer(function(socket) { //'connection' listener
			  var newTunnel = new tcpTunnel();
			  newTunnel.setSocket(socket);
			  thisNode.TunnelManager.registerTunnel(false, newTunnel);
			});

			server.listen(cfg.port, cfg.host, function(){
				if(callback){
					callback(false, {
						name: 'TCPTunnels',
						config: cfg
					});
				}
				
				thisNode.emit('Mixin.Ready', {
					name: 'TCPTunnels',
					config: cfg
				});
				
				thisNode.emit('TCPTunnels.Listening', thisNode);
			});
		}else{
			return false;
		}
	},
	TCPTunnels_Connect: function(cfg){
		var thisNode = this;
		var net = require('net');
		var tcpTunnel = thisNode.TunnelManager.factory('TCP').Tunnel;
		var newTunnel = new tcpTunnel();
		var socket = net.connect(cfg.port, cfg.host);
		newTunnel.setSocket(socket);
		
		thisNode.TunnelManager.registerTunnel(false, newTunnel)
	}
}

if (typeof define === 'function' && define.amd) {
	define(relayFunctions);
} else {
	module.exports = relayFunctions;
}
	