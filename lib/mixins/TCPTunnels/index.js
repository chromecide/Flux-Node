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
		}, {
			object:{
				fields: {
					'host': {
						name: 'Host',
						description: 'The Host Name to Listent on',
						validators: {
							string:{}
						}
					},
					'port':{
						name: 'Port',
						description: 'The port to listen on',
						validators: {
							number:{}
						}
					}
				}
			}
		});
	
		if(thisNode._environment=='nodejs'){
			if(cfg.noServer!==true){
				var net = require('net');
				var tcpTunnel = thisNode.TunnelManager.factory('TCP').Tunnel;
				var server = net.createServer(function(socket) { //'connection' listener
				  var newTunnel = new tcpTunnel();
				  newTunnel.localId = thisNode.id;
				  newTunnel.once('Tunnel.Ready', function(tunnelObj){
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
			}
		
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
		
			if(cfg.tunnels){
				for(var i=0;i<cfg.tunnels.length;i++){
					thisNode.TCPTunnels_Connect(cfg.tunnels[i]);
				}
			}
		}else{
			return false;
		}
	},
	TCPTunnels_Connect: function(cfg, callback){
		var thisNode = this;
		var net = require('net');
		var tcpTunnel = thisNode.TunnelManager.factory('TCP').Tunnel;
		var newTunnel = new tcpTunnel();
		newTunnel.localId = thisNode.id;
		
		try{
			console.log('connecting socket');
			var socket = net.connect(cfg.port, cfg.host).on('error', function(e){
				if(callback){
					callback(e);	
				}
			}).on('connect', function(){
				newTunnel.setSocket(socket);
			
				newTunnel.once('Tunnel.Ready', function(tunnelObj){
			  		thisNode.TunnelManager.registerTunnel(newTunnel.remoteId, newTunnel);	
			  	});	
			}).on('close', function(){
				console.log('CLOSED');
				if(cfg.reconnect){
					if(cfg.reconnect===true){
						cfg.reconnect = 5000;
					}
					
					setTimeout(function(){
						thisNode.TCPTunnels_Connect(cfg);
					}, cfg.reconnect);
				}
			});/*.once('error', function(err){
				console.log('ERR');
				if(err.code=='ECONNREFUSED'){
					if(cfg.reconnect){
						if(cfg.reconnect===true){
							cfg.reconnect = 5000;
						}
						
						setTimeout(function(){
							thisNode.TCPTunnels_Connect(cfg);
						}, cfg.reconnect);
					}	
				}
			});*/
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
	