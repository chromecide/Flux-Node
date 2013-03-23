var httpProxy = require('http-proxy');
 
var mixinFunctions = {
	init: function(cfg, callback){
		var thisNode = this;
		
		if(!cfg){
			cfg = {};
		}
		
		thisNode.setSetting('HTTPProxy', {
			Servers: {},
			Ports: {}
		})
		
		if(cfg.hosts){
			for(var i=0;i<cfg.hosts.length;i++){
				var host = cfg.hosts[i];
				thisNode.HTTPProxy_addRoute(host.name?host.name:host.inHost, host.inHost, host.inPort, host.outHost, host.outPort);
			}	
		}
		
		//should be called when the mixin is actually ready, not simp;y at the end of the init function
		if(callback){
			callback({
				name: 'HTTPProxy',
				config: cfg
			});
		}
		
		thisNode.emit('Mixin.Ready', {
			name: 'HTTPProxy',
			config: cfg
		});
	},
	HTTPProxy_createServer: function(name, options, callback){
		var thisNode = this;
		
		var proxyServer = new httpProxy.createServer(options).listen(options.port);
		
		proxyServer.on('request', function(request, response){
			thisNode.emit('HTTPProxy.Request', {
				request: request,
				response: response
			});
		});
		thisNode.setSetting('HTTPProxy.Servers.'+name, proxyServer);
		thisNode.setSetting('HTTPProxy.Ports.port_'+options.port, name);
	},
	HTTPProxy_stopServer: function(name, callback){
		var server = thisNode.getSetting('HTTPProxy.Servers.'+name);
		server.close();
		if(callback){
			callback(false);
		}
	},
	HTTPProxy_removeServer: function(name, callback){
		thisNode.HTTPProxy_stopServer(name, function(){
			thisNode.removeSetting('HTTPProxy.Servers.'+name);
			if(callbck){
				callback(false);
			}
		});
	},
	HTTPProxy_addRoute: function(name, inHost, inPort, outHost, outPort, callback){
		var thisNode = this;
		
		var serverName = thisNode.getSetting('HTTPProxy.Ports.port_'+inPort);
		if(serverName){
			var server = thisNode.getSetting('HTTPProxy.Servers.'+serverName);
			
			var router = server.proxy.proxyTable.router;
			if(!router[inHost]){
				router[inHost] = outHost+':'+outPort
			}
			
			server.proxy.proxyTable.setRoutes(router);
			
			if(callback){
				callback(false);
			}
			
		}else{
			//create a new server
			console.log('creating new server');
			var routerTable = {};
			routerTable[inHost] = outHost+':'+outPort; 
			thisNode.HTTPProxy_createServer('port_'+inPort, {
				hostnameOnly: true, 
				port: inPort,
				router: routerTable
			}, function(err){
				if(callback){
					callback(err);
				}
			});
		}
	},
	HTTPProxy_removeRoute: function(name, callback){
		
	}
}

if (typeof define === 'function' && define.amd) {
	define(mixinFunctions);
} else {
	module.exports = mixinFunctions;
}