var sockets = {};

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
			cfg.port = 8800;
		}else{
			if(cfg.port=='auto'){
				//need to find an available port
				cfg.port = 0;
			}
		}
	
		if(!cfg.WelcomeMessage){
			cfg.WelcomeMessage = 'Welcome to the Telnet Server!'
		}
	
		thisNode.addSetting('Telnet', {
			host: cfg.host,
			port: cfg.port,
			welcome_message: cfg.WelcomeMessage,
			Prompt: cfg.Prompt
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
					},
					'welcome_message':{
						name: 'Welcome Message',
						description: 'The Welcome Message for your Telnet Server',
						validators:{
							string:{}
						}
					}
				}
			}
		});
		
		thisNode.on('Telnet.Disconnect', function(message, rawMessage){
			var socket = sockets[message.socket];
			thisNode.Telnet_closeSocket(socket, function(err, closedID, result){
				socket.end();
				if(rawMessage && rawMessage._message.sender){
					thisNode.sendEvent(rawMessage._message.sender, 'Telnet.Disconnect.Response', result);
				}
			});
		});
		
		thisNode.on('Telnet.Send', function(message, rawMessage){
			var socket = sockets[message.socket];
			thisNode.Telnet_send(socket, message.message, message.preventNL, function(err, msg){
				if(rawMessage && rawMessage._message.sender){
					thisNode.sendEvent(rawMessage._message.sender, 'Telnet.Send.Response', msg);
				}
			});
		});
		
		thisNode.on('Telnet.Prompt', function(message, rawMessage){
			var socket = sockets[message.socket];
			thisNode.Telnet_sendPrompt(socket, message.message, message.preventNL, message.prompt?message.prompt:thisNode.getSetting('Telnet.Prompt'), function(err, msg){
				if(rawMessage && rawMessage._message.sender){
					thisNode.sendEvent(rawMessage._message.sender, 'Telnet.Send.Response', msg);
				}
			});
		});
		
		if(thisNode._environment=='nodejs'){
			var net = require('net');
			
			var server = net.createServer(function(socket) { //'connection' listener
				socket.FluxID = thisNode.generateID();
				
				sockets[socket.FluxID] = socket;
				
				socket.write(thisNode.getSetting('Telnet.welcome_message'));
				socket.on('data', function(data) {
					thisNode.Telnet_receiveData(socket, data);
				});
				socket.on('end', function() {
					thisNode.Telnet_closeSocket(socket);
				});
				
				thisNode.emit('Telnet.SocketOpened', {
					socket: socket.FluxID
				});
			});

			server.listen(cfg.port, cfg.host, function(){
				if(cfg.port==0){
					thisNode.setSetting('Telnet.port', server.address().port);
				}
				
				if(callback){
					callback(false, {
						name: 'Telnet',
						config: cfg
					});
				}
				
				thisNode.emit('Mixin.Ready', {
					name: 'Telnet',
					config: cfg
				});
				
				thisNode.emit('Telnet.Listening', thisNode);
			});
		}else{
			return false;
		}
	},
	Telnet_receiveData: function(socket, data) {
		var thisNode = this;
		if(!socket.currentMessage){
			socket.currentMessage = '';
		}
		socket.currentMessage+=data;
		if(socket.currentMessage.indexOf("\r")>-1 || socket.currentMessage.indexOf("\n")>-1){
			var cleanData = thisNode.Telnet_cleanInput(socket.currentMessage);
			socket.currentMessage = '';
			if(cleanData === "@quit") {
				thisNode.Telnet_closeSocket(function(){
					socket.end('Goodbye!\r\n');
				});
			}else {
				
				thisNode.emit('Telnet.Data', {
					socket: socket,
					data: cleanData
				});
			}	
		}
	},
	Telnet_cleanInput: function(data) {
		return data.toString().replace(/(\r\n|\r|\n)/gm,"");
	},
	Telnet_closeSocket: function(socket, callback){
		var thisNode = this;
		delete sockets[socket.FluxID];
		if(callback){
			callback(false, socket.FluxID);
		}
		
		thisNode.emit('Telnet.SocketClosed', {
			socket: socket.FluxID
		});
	},
	Telnet_send: function(socket, message, preventNL, callback){
		
		socket.write(message+(preventNL==true?'':'\r\n'));
		if(callback){
			callback(false, socket, message);
		}
	},
	Telnet_sendPrompt: function(socket, message, preventNL, prompt, callback){
		var thisNode = this;
		socket.write((message?message:'')+prompt);
		if(callback){
			callback(false, socket, message);
		}
	},
	Telnet_setSetting: function(socket, settingName, settingVal, callback){
		var thisNode = this;
		var socketObject = sockets[socket];
		if(socketObject){
			
			thisNode.setDataValueByString(socketObject, settingName, settingVal);
			if(callback){
				callback(false);
			}
		}else{
			if(callback){
				callback(true);
			}
		}
	},
	Telnet_getSetting: function(socket, settingName, callback){
		var thisNode = this;
		var returnValue;
		
		var socketObject = sockets[socket];
		
		if(socketObject){
			returnValue = thisNode.getDataValueByString(socketObject, settingName);
			if(callback){
				
				callback(false, returnValue);
			}
		}else{
			if(callback){
				callback(true);
			}
		}
	}
}

if (typeof define === 'function' && define.amd) {
	define(relayFunctions);
} else {
	module.exports = relayFunctions;
}
	