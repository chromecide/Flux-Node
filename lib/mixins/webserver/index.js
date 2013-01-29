
var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs");
    
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
						
		  				response.writeHead(200);
		  				response.write(file, "binary");
		  				response.end();
		  
		  				//TODO: provide meaningful event information about the response that was sent
		  				thisNode.emit('Webserver.ResponseSent', {
		      				
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
	      
	      	serveResponse(filename);
		});
		
		thisNode.setSetting('Webserver.object', serverObject);
		
		if(cfg.autoStart===true){
			thisNode.Webserver_startServer();
		}
		
		thisNode.on('Webserver.Start', function(){
			thisNode.Webserver_startServer();
		});
		
		thisNode.on('Webserver.Stop', function(){
			thisNode.Webserver_stopServer();
		});
		
		thisNode.emit('Mixin.Ready', {
			name: 'Webserver',
			config: serverSettings
		});
		
		if(callback){
			callback();
		}
	},
	Webserver_startServer: function(){
		var thisNode = this;
		var serverSettings = thisNode.getSetting('Webserver');
		serverSettings.object.listen(serverSettings.config.port);
		thisNode.emit('Webserver.Started', serverSettings.config);
	},
	Webserver_stopServer: function(){
		var thisNode = this;
		var serverSettings = thisNode.getSetting('Webserver');
		serverSettings.object.close();
		thisNode.emit('Webserver.Stopped', {
			host: serverSettings.config.host,
			port: serverSettings.config.port
		});
	},
	Webserver_restartServer: function(){
		
	}
}

if (typeof define === 'function' && define.amd) {
	define(mixinFunctions);
} else {
	module.exports = mixinFunctions;
}