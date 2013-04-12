
var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs");

var webserverObject;
    
var mixinFunctions = {
	init: function(cfg, callback){
		var thisNode = this;
		var serverSettings = {
			host: 'localhost',
			port: 8080,
			webroot: process.cwd(),
			namedPaths:{
				'FluxNode': path.resolve(__dirname+'/../../../')
			}
		};
		
		if(cfg){
			if(cfg.host){
				serverSettings.host = cfg.host;	
			}
			
			if(cfg.port){
				serverSettings.port = cfg.port;	
			}
			
			if(cfg.webroot){
				serverSettings.webroot = cfg.webroot;	
			}
			
			if(cfg.namedPaths){
				for(var name in cfg.namedPaths){
					serverSettings[name] = cfg.namedPaths[name];
				}
			}
			
			if(cfg.autoStart){
				serverSettings.autoStart = cfg.autoStart;
			}
		}
		
		thisNode.setSetting('Webserver.config', serverSettings);
		
		var serverObject = http.createServer(function(request, response) {
			var uri = url.parse(request.url).pathname;
		  	
		  	if(uri.indexOf('/')==0){
		  		uri = uri.substr(1, uri.length-1);	
		  	}
		  	uriParts = uri.split('/');
		  
		  	//if the first part of the uri is a namedPath, use that instead
		  	var basePath = thisNode.getSetting('Webserver.config.webroot');
		  
		  	var namedPathCheck = uriParts[0];
		  	
		  	//check for named paths first
		  	var namedPath = thisNode.getSetting('Webserver.config.namedPaths.'+namedPathCheck); 
		  	if(namedPath){
		  		
		  		basePath = namedPath;
		  		uriParts.shift();
		  	}
		  
		  	if(uriParts[uriParts.length-1]=='.js'){ //quirk when using requirejs
		  		uriParts[uriParts.length-1]= 'index.js';
		  	}
		  
		  	filename = path.join(basePath, uriParts.join('/'));
		  	
		  	var serveResponse = function(sfilename){
		  		//console.log('SERVING: '+sfilename)
		  		
		  		var exists = fs.existsSync(sfilename);
		  		
		  		fs.exists(sfilename, function(exists) {
			    	if(!exists) {
			      		response.writeHead(404, {"Content-Type": "text/plain"});
			      		response.write("404 Not Found\n");
			      		response.end();
			      		return;
			    	}
			
					if (fs.statSync(sfilename).isDirectory()) sfilename += '/index.html';
			
					fs.readFile(sfilename, "binary", function(err, file) {
						
						if(err) {
							response.writeHead(500, {"Content-Type": "text/plain"});
							response.write(err + "\n");
							response.end();
							return;
						}
						var tFile = file;
				      	thisNode.processMiddleware('Webserver', 'Response.ProcessFile', [tFile, request, response], function(success){
				      		if(success){
				  				response.writeHead(200);
				  				response.write(tFile, "binary");
				  				response.end();
				      		}
				      	});
				      	
		  
		  				//TODO: provide meaningful event information about the response that was sent
		  				thisNode.emit('Webserver.ResponseSent', {
		      				path: sfilename
		      			});
	    			});
	  			});
		  	}
		  	
	      	//TODO: provide meaningful event information about the request that was recieved
	      	thisNode.emit('Webserver.RequestReceived', false, {
	      		path: uri,
	      		headers: request.headers,
	      		method: request.method
	      	});
	      	
	      	thisNode.processMiddleware('Webserver', 'Request.Received', [request, response], function(success){
	      		if(success){
	      			serveResponse(filename);
	      		}
	      	});
		});
		
		webserverObject = serverObject;
		
		if(cfg.autoStart!==false){
			thisNode.Webserver_startServer();
		}
		
		thisNode.on('Webserver.Start', function(){
			thisNode.Webserver_startServer();
		});
		
		thisNode.on('Webserver.Stop', function(){
			thisNode.Webserver_stopServer();
		});
		
		//register the events emitted by this mixin
		thisNode.addEventInfo('Webserver', 'Webserver.RequestReceived', 'Emitted when the Webserver has recieved a Request', {
			path:{
				name: 'Path',
				description: 'The Path to the resource requested',
				validators: {
					string:{}
				}
			},
			headers:{
				name: 'Headers',
				description: 'The header values for the Request'
			},
			method:{
				name: 'Method',
				description: 'The HTTP Method of the Request e.g.(GET, POST, PUT)'
			}
		});
		
		thisNode.addEventInfo('Webserver', 'Webserver.ResponseSent', 'Emitted when the Webserver has sent a Response', {
			path:{
				name: 'Path',
				description: 'The Path of the actual file sent.  This may not be the same path as the request path.',
				validators: {
					string:{}
				}
			}
		});
		
		thisNode.addEventInfo('Webserver', 'Webserver.Started', 'Emitted when the Webserver has been Started', {
			config:{
				name: 'config',
				description: 'The configuration of the Webserver that was Started',
				validators: {
					string:{}
				}
			},
			time: {
				name: 'time',
				description: 'The time at which the Webserver was Started',
				validators:{
					date: {}
				}
			}
		});
		
		thisNode.addEventInfo('Webserver', 'Webserver.Stopped', 'Emitted when the Webserver has been Stopped', {
			config:{
				name: 'config',
				description: 'The configuration of the Webserver that was Stopped',
				validators: {
					string:{}
				}
			},
			time: {
				name: 'time',
				description: 'The time at which the Webserver was Stopped',
				validators:{
					date: {}
				}
			}
		});
		
		//add the listener information for this mixin
		//TODO: add information about the start and stop server triggers
		var returnObject = {
			name: 'Webserver',
			meta: require(__dirname+'/package.json'),
			config: serverSettings
		};
		
		thisNode.emit('Mixin.Ready', returnObject);
		
		if(callback){
			callback(false, returnObject);
		}
	},
	Webserver_startServer: function(callback){
		var thisNode = this;
		var serverSettings = thisNode.getSetting('Webserver');
		webserverObject.listen(serverSettings.config.port);
		console.log(serverSettings.config);
		thisNode.emit('Webserver.Started', {
			config: serverSettings.config,
			time: new Date()
		});
	},
	Webserver_stopServer: function(callback){
		var thisNode = this;
		var serverSettings = thisNode.getSetting('Webserver');
		webserverObject.close();
		thisNode.emit('Webserver.Stopped', {
			config: serverSettings.config,
			time: new Date()
		});
		if(callback){
			callback(false);
		}
	},
	Webserver_restartServer: function(){
		var thisNode = this;
		thisNode.Webserver_stopServer(function(){
			thisNode.Webserver_startServer();
		});
	}
}

if (typeof define === 'function' && define.amd) {
	define(mixinFunctions);
} else {
	module.exports = mixinFunctions;
}