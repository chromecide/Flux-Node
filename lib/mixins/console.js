var io = require('socket.io');
var http = require('http');
var fs = require('fs');
var node_static = require('node-static');
var _ = require('underscore');
var mixinFunctions = {
	init: function(cfg){
		var self = this;
		
		self.Console = {
			UserName: cfg.username,
			UserPass: cfg.userpass
		};
		
		//add properties that are needed by this mixin
		self.fileServer = new node_static.Server(__dirname+'/console/ui');
		//add Events that are emitted by this mixin
		self.httpServer = http.createServer(function(req, res){
			self.onRequest(req, res);
		});
		
		self.socketIOServer = io.listen(self.httpServer);
		self.socketIOServer.sockets.on('connection', function(socket){
			self.onWebSocketConnection(socket);
		});
		
		self.httpServer.listen(cfg.port);
	},
	onRequest: function(req, res){
		var self = this;
		self.fileServer.serve(req, res);
	},
	onWebSocketConnection: function(socket){
		var self = this;
		var clientAddress = socket.handshake.address;
		
		
		if(clientAddress.address=='127.0.0.1'){//auto login
			self.send(socket, 'stdout', 'Local Login Successful');
			self.onWebSocketLogin(socket, {
				UserName: self.Console.UserName,
				UserPass: self.Console.UserPass
			});
		}else{
			socket.on('login', function(loginData){
				self.onWebSocketLogin(socket, loginData);
			});
			socket.authorised = false;
			self.send(socket, 'stdout', 'Enter Username');
			//self.send(socket, 'LoginFailed', {});
		}
		
		self.send(socket, 'Ready', {});
	},
	onWebSocketLogin: function(socket, loginData){
		var self = this;
		if(self.Console.UserName && (loginData.UserName==self.Console.UserName)){
			if(self.Console.UserPass==loginData.UserPass){
				socket.on('stdin', function(cmdData){
					self.onConsoleCommand(socket, cmdData);
				});
				self.send(socket, 'LoginSuccessful', {});
				var returnData = {
					Data:{},
					Mixins: self.mixins,
					Transports: self.transports
				};
				
				var data = self.getData();
				for(var x in data){
					returnData.Data[x] = data[x];
				}
				
				socket.emit('update_data', returnData);
			}else{
				socket.emit('LoginFailed', {});
			}
		}else{
			socket.emit('LoginFailed', {});
		}
	},
	send: function(socket, topic, payload){
		 var self = this;
		 
		 var message = {
		 	topic: topic,
		 	payload: payload
		 };
		 
		 socket.send(JSON.stringify(message));
	},
	onConsoleCommand: function(socket, command){
		var self = this;
		var commandParts = command.split(' ');
		if(!socket.consoleRelay){
			socket.consoleRelay = function(data){
				self.send(socket, self.event, data);
			}	
		}
		
		if(!socket.authorised){
			switch(commandParts[0]){
				case 'ping':
					self.send(socket, 'stdout', 'pong');
					break;
				case 'sclear':
					self.send(socket, 'stdout', 'clear');
					break;
				case 'subscribe':
					self.on(commandParts[1], socket.consoleRelay);
					self.send(socket, 'stdout', 'Subscribed: '+commandParts[1]);
					break;
				case 'unsubscribe':
					self.off(commandParts[1], socket.consoleRelay);
					self.send(socket, 'stdout', 'Unsubscribed: '+commandParts[1]);
					break;
				default:
					self.send(socket, 'stdout', 'COMMAND NOT FOUND: '+commandParts[0]);
					break;
			}	
		}else{
			
		}
		
	}
}

	module.exports = mixinFunctions;