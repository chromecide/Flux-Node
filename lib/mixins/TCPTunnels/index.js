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
		}else{
			if(cfg.port=='auto'){
				//need to find an available port
				cfg.port = 0;
			}
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
			  newTunnel.localId = thisNode.id;
			  newTunnel.once('Tunnel.Ready', function(tunnelObj){
			  	console.log(newTunnel);
			  	console.log('registering tunnnel');
			  	thisNode.TunnelManager.registerTunnel(newTunnel.remoteId, newTunnel);	
			  });
			  newTunnel.setSocket(socket);
			});

			server.listen(cfg.port, cfg.host, function(){
				if(cfg.port==0){
					thisNode.setSetting('TCPTunnels.port', server.address().port);
				}
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
				
				thisNode.on('TCPTunnels.Connect', function(message, rawMessage){
					thisNode.TCPTunnels_Connect(message);
				});
				
				//register the events and listeners
				thisNode.addListenerInfo('TCPTunnels', 'TCPTunnels.Connect', 'Connects to an FluxNode running a TCPTunnels Server', {
					host: {
						name: 'Host',
						description: 'The hostname of the FluxNode to Connect to'
					},
					port: {
						name: 'Port',
						description: 'The port of the FluxNode to Connect to'
					}
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
		newTunnel.localId = thisNode.id;
		
		try{
			console.log('here');
			var socket = net.connect(cfg.port, cfg.host);
			newTunnel.setSocket(socket);
			
			newTunnel.once('Tunnel.Ready', function(tunnelObj){
		  		console.log('registering tunnnel');
		  		thisNode.TunnelManager.registerTunnel(newTunnel.remoteId, newTunnel);	
		  	});	
		}catch(e){
			console.log(e);
		}
	}
}

if (typeof define === 'function' && define.amd) {
	define(relayFunctions);
} else {
	module.exports = relayFunctions;
}
	