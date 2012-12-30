/*
 * CFG SETTINGS
 * 
 * 		- autonomous: [true|false] - determines whether the module should do everything autonomously, or whether the developer would rather handle the retrieval themselves
 * 		- pollInterval: number		the number of minutes between checking accounts. 0= continuous: continuosly polls accounts by starting at the top of the list and working it's way through to the end and then starting again immediately(use with caution)
 * 		- Accounts: object			JSON representation of a list of named user accounts
 */
var POP3Client = require('poplib');
var MailParser = require("mailparser").MailParser;
    
var util = require('util');
var mixinFunctions = {
	init: function(cfg, callback){
		var self = this;
		
		//add properties that are needed by this mixin
		
		//init the needed settings using config if applicable
		self.pop3_Settings = {
			autonomous: cfg.autonomous?cfg.autonomous:true,
			pollInterval: cfg.pollInterval?cfg.pollInterval:15,//default poll every 15 minutes
			debug: cfg.debug===true?true:false
		}
		self.pop3_Accounts = {};
		//load any account configurations supplied
		if(cfg.Accounts && typeof cfg.Accounts=='object'){
			for(var name in cfg.Accounts){
				var account = cfg.Accounts[name];
				self.pop3_addAccount(name, account);
			}	
		}
		
		if(self.pop3_Settings.autonomous===true){
			self.pop3_doPoll();
		}
		
		self.on('POP3.AddAccount', function(message, rawMessage){
			self.addAccount(message.name, message.config);
		});
		
		self.on('POP3.RemoveAccount', function(message, rawMessage){
			self.removeAccount(message.name);
		});
		
		self.on('POP3.CheckAccounts', function(message, rawMessage){
			self.pop3_doPoll();
		});
		
		self.on('POP3.StartPolling', function(message, rawMessage){
			self.pop3_Settings.pollInterval = message.interval?message.interval:15;//default poll every 15 minutes
			self.pop3_doPoll();
		});
		
		self.on('POP3.StopPolling', function(message, rawMessage){
			self.pop3_Settings.pollInterval = false;
		});

		self.on('POP3.DeleteMessage', function(message, rawMessage){
			//TODO: Add Support for deleting messages by unique id
			if(message.UIDL){
				self.pop3_DeleteMessageByUIDL(message.account, message.UIDL);
			}else{
				console.log('no UIDL Supplied');
				die;
			}
			
		});
		
		
		if(callback){
			callback({
				name: 'pop3'
			});
		}
		
		self.emit('Mixin.Ready', {
			name: 'pop3'
		});
		
		if(self.pop3_Settings.autonomous===true){
			//self.on('FluxNode.Ready', function(){
				self.pop3_doPoll();	
			//});
		}
		
		if(self.pop3_Settings.pollInterval>0){
			console.log('SETTING INTERVAL');
			setInterval(function(){
				self.pop3_doPoll();
			}, self.pop3_Settings.pollInterval);
		}

	},
	pop3_addAccount: function(name, host, port, username, password, poll){
		var self = this;
		//TODO: Input Validation
		if(typeof host=='object'){ //if the user supplied a JSON representation as the second argument
			var cfg = host; //just to make the code below make sense
			
			//transfer the settings from the cfg to the variables for use later
			host = cfg.host;
			port = cfg.port;
			username = cfg.username;
			password = cfg.password;
			poll = cfg.poll;
		}
		var itemMailParser = new MailParser();
		
		self.pop3_Accounts[name] = {
			host: host,
			port: port,
			username: username,
			password: password,
			status: 'idle',
			poll: poll,
			mailparser: itemMailParser
		};
		
		self.emit('POP3.AccountAdded', {
			name: name,
			host: host,
			port: port,
			username: username,
			status: 'idle'
		});
		if(self.pop3_Settings.debug) console.log('account added');
	},
	pop3_removeAccount: function(name){
		if(self.pop3_Accounts[name]){
			var account = self.pop3_Accounts[name];
			if(account.status=='idle'){
				delete self.pop3_Accounts[name];
			}
		}
		self.emit('POP3.AccountRemoved', {
			name: account.name,
			host: account.host,
			port: account.port,
			username: account.username
		});
	},
	pop3_doPoll: function(){ //TODO: Need to move the poll count checks out to the main object, we are getting a conflict when trying to create multiple POP3Clients
		var self = this;
		if(self.pop3_Accounts){
			if(self.pop3_Settings.debug) console.log('STARTING');
			for(var accountName in self.pop3_Accounts){
				var account = self.pop3_Accounts[accountName];
				if(self.pop3_Settings.debug) console.log(account);
				if(account.poll===true){
					if(self.pop3_Settings.debug) console.log('Processing: '+accountName);
					account.polling = true;
					var client = new POP3Client(account.port, account.host, {
						enabletls: true //TODO: move this to configuration to support not tls connections
					});
					
					account.status = 'starting'; //not sure if this is a ref yet so just to be sure
					
					self.pop3_Accounts[accountName].status = 'starting';
					self.pop3_Accounts[accountName].polling = true;
					self.pop3_Accounts[accountName].client = client;
					
					client.on("error", function(err) {
						if(self.pop3_Settings.debug) console.log('error');
						self.pop3_onError(account, err);
					});
					
					client.on("connect", function() {
						if(self.pop3_Settings.debug) console.log('connected');
						account.status = 'connected'; //not sure if this is a ref yet so just to be sure
						self.pop3_Accounts[accountName].status = 'connected';
						self.pop3_onConnect(account, client);
					});
					
					client.on("invalid-state", function(cmd) {
						if(self.pop3_Settings.debug) console.log('invalid state');
						account.status = 'starting'; //not sure if this is a ref yet so just to be sure
						self.pop3_Accounts[accountName].status = 'invalid-state';
						self.pop3_onInvalidState(account, cmd);
					});
					
					client.on("locked", function(cmd) {
						if(self.pop3_Settings.debug) console.log('locked');
						self.pop3_onLocked(account, cmd);
					});
					
					client.on("login", function(status, rawdata) {
						if(self.pop3_Settings.debug) console.log('logged in');
						account.status = 'Logged In'; //not sure if this is a ref yet so just to be sure
						self.pop3_Accounts[accountName].status = 'Logged In';
						self.pop3_onLogin(account, status, rawdata);
					});
					
					client.on("capa", function(status, data, rawdata) {
						self.pop3_onCapa(account, status, data, rawdata);
					});
					
					
					client.on("noop", function(status, rawdata) {
						self.pop3_onNoop(account, status, rawdata);
					});
					
					client.on("stat", function(status, data, rawdata) {
						self.pop3_onStat(account, status, data, rawdata);
					});
					// Data is a 1-based index of messages, if there are any messages
					client.on("list", function(status, msgcount, msgnumber, data, rawdata) {
						self.pop3_onList(account, status, msgcount, msgnumber, data, rawdata);
					});
					
					client.on("uidl", function(status, msgnumber, data, rawdata){
						self.pop3_onUIDL(account, status, msgnumber, data, rawdata);	
					});
					
					client.on("retr", function(status, msgnumber, data, rawdata) {
						self.pop3_onRetrieve(account, status, msgnumber, data, rawdata);
					});
					
					client.on("dele", function(status, msgnumber, data, rawdata) {
						self.pop3_onDelete(account, status, msgnumber, data, rawdata);
					});
					
					client.on("quit", function(status, rawdata) {
						account.status = 'starting'; //not sure if this is a ref yet so just to be sure
						self.pop3_Accounts[accountName].status = 'idle';
						self.pop3_onQuit(account, status, rawdata);
					});
				}
			}
		}
	},
	pop3_DeleteMessageByUIDL: function(account, UIDL){
		//UPDATE the UIDL for the selected account
		
		//MATCH the UIDL to a msgnumber
		
		//call dele on the msgnumber
		console.log(arguments);
		die;
	},
	pop3_UpdateUIDLTable: function(account){
		console.log('RUNNING UIDL');
		account.client.uidl();
	},
	pop3_onError: function(account, err){
		var self = this;
		
        if (err.errno === 111) if(self.pop3_Settings.debug) console.log("Unable to connect to server");
        else if(self.pop3_Settings.debug) console.log("Server error occurred");
        if(self.pop3_Settings.debug) console.log(err);
        
		self.emit('POP3.Error', {
			account: account.client.data,
			err: err,
			message: err.errno===111?'Unable to connect to Server':'Server Error'
		});
	},
	pop3_onConnect: function(account, client){
		var self = this;
		if(self.pop3_Settings.debug) console.log("CONNECT success");
		self.emit('POP3.Connected', account);
        if(account.polling===true){
        	if(self.pop3_Settings.debug) console.log('Authorising: '+account.username+':'+account.password);
        	account.client.login(account.username, account.password);
        }
	},
	pop3_onInvalidState: function(account, cmd){
		var self = this;
		if(self.pop3_Settings.debug) console.log("Invalid state. You tried calling " + cmd);
		self.emit('POP3.InvalidState', {
			account: account.client.data,
			cmd: cmd
		});
	},
	pop3_onLocked: function(account, cmd){
		var self = this;
		if(self.pop3_Settings.debug) console.log("Current command has not finished yet. You tried calling " + cmd);
		self.emit('POP3.InvalidState', {
			account: account.client.data,
			cmd: cmd
		});  
	},
	pop3_onLogin: function(account, status, rawData){
		var self = this;
		if (status) {
			if(self.pop3_Settings.debug) console.log("LOGIN/PASS success");
			self.emit('POP3.LoginSuccess', {
				account: account.client.data,
				status: status,
				rawData: rawData,
				data: rawData, //TODO: figure out what data comes back and create something useful out of it
			});
			
			if(account.polling){
				account.client.capa();
				//account.client.list();	
			}
			
		} else {
			if(self.pop3_Settings.debug) console.log("LOGIN/PASS failed");
			self.emit('POP3.LoginFailed', {
				account: account.client.data,
				status: status,
				rawData: rawData,
				data: rawData, //TODO: figure out what data comes back and create something useful out of it
			});
			client.quit();//we don't need that particlaur client any more
		}
	},
	pop3_onCapa: function(account, status, data, rawdata){
		var self = this;
		if (status) {
			if(self.pop3_Settings.debug) console.log("CAPA success");
			if(self.pop3_Settings.debug) console.log("	Parsed data: " + util.inspect(data));
			if(account.polling===true){
				account.client.noop();	
			}
		} else {
			if(self.pop3_Settings.debug) console.log("CAPA failed");
			account.client.quit();
		}
	},
	pop3_onNoop: function(account, status, rawdata) {
		var self = this;
		if (status) {
			if(self.pop3_Settings.debug) console.log("NOOP success");
			if(account.polling===true){
				account.client.stat();	
			}
		} else {
			if(self.pop3_Settings.debug) console.log("NOOP failed");
			account.client.quit();
		}
	
	},
	pop3_onStat: function(account, status, data, rawdata) {
		var self = this;
		if (status === true) {
			if(self.pop3_Settings.debug) console.log("STAT success");
			if(self.pop3_Settings.debug) console.log("	Parsed data: " + util.inspect(data));
			if(account.polling){
				account.client.list();	
			}
		} else {
			if(self.pop3_Settings.debug) console.log("STAT failed");
			account.client.quit();
		}
	},
	pop3_onList: function(account, status, msgcount, msgnumber, data, rawdata) {
		
		var self = this;
		if (status === false) {
			if(self.pop3_Settings.debug) console.log("LIST failed");
			self.emit('POP3.ListFailed', {
				//TODO: Supply more meaningful information
				account: account.client.data,
				status: status,
				messages: msgcount,
				msgnumber: msgnumber,
				data: data,
				rawdata: rawdata
			});
			//TODO: do we need to quit the client here, or was that just part of the original demo
			//client.quit(); 
		} else {
			if(self.pop3_Settings.debug) console.log("LIST success with " + msgcount + " element(s)");
			self.emit('POP3.ListSuccessful', {
				account: account.client.data,
				status: status,
				messages: msgcount,
				msgnumber: msgnumber,
				data: data,
				rawdata: rawdata	
			});
			
			if (msgcount > 0){
				//TODO: Call UIDL if applicapable and build a reference table to allow deleting by UIDL
				self.pop3_UpdateUIDLTable(account);
				
			}else{
				//account.client.quit();
			}
		}
	},
	pop3_onUIDL: function(account, status, msgnumber, data, rawdata){
		var self = this;
		
		if(!self.pop3_UIDLTable){
			self.pop3_UIDLTable = [];
		}
		
		if(data && data.length>0){
			self.pop3_UIDLTable = data;
		}else{
			self.pop3_UIDLTable = [];
		}
		if(account.polling){
			account.poll_msgcount = self.pop3_UIDLTable.length;
			account.poll_currentmsg = 1;
			if(self.pop3_Settings.debug) console.log('Retrieving '+account.poll_currentmsg+' of '+account.poll_msgcount);
			account.client.retr(account.poll_currentmsg);
		}
	},
	pop3_onRetrieve: function(account, status, msgnumber, data, rawdata) {
		var self = this;
		if (status === true) {
			if(self.pop3_Settings.debug) console.log("RETR success for msgnumber " + msgnumber);
			account.poll_currentmsg++;
			console.log('emitting');
			self.emit('POP3.MessageRecieved', {
				account: account,
				status: status,
				msgnumber: msgnumber, 
				data: data,
				rawdata: rawdata
			});
			delete account.mailparser;
			account.mailparser = new MailParser();
			
			account.mailparser.on('end', function(mailObj){
				mailObj.UIDL = self.pop3_UIDLTable[msgnumber];
				self.pop3_onMessageParsed(account, mailObj);
			});
			
			account.mailparser.write(rawdata);
			account.mailparser.end();
			
			if(account.polling && account.poll_currentmsg<=account.poll_msgcount){
				if(self.pop3_Settings.debug) console.log('Retrieving '+account.poll_currentmsg+' of '+account.poll_msgcount);
				account.client.retr(account.poll_currentmsg);
			}else{
				account.polling = false;
				delete account.poll_msgcount;
				delete account.poll_currentmsg;
				account.client.quit();//we're done with this account
			}
		} else {
			if(self.pop3_Settings.debug) console.log("RETR failed for msgnumber " + msgnumber);
			self.emit('POP3.MessageRecieveFailed', {
				account: account.client.data,
				status: status,
				msgnumber: msgnumber, 
				data: data,
				rawdata: rawdata
			});
		}
	},
	pop3_onDelete: function(account, status, msgnumber, data, rawdata) {
		var self = this;
		if (status === true) {
			if(self.pop3_Settings.debug) console.log("DELE success for msgnumber " + msgnumber);
			self.emit('POP3.MessageDeleted', {
				account: account.client.data,
				status: status,
				msgnumber: msgnumber,
				data:data,
				data: rawdata
			});
		} else {
			if(self.pop3_Settings.debug) console.log("DELE failed for msgnumber " + msgnumber);
			self.emit('POP3.MessageDeleteFailed', {
				account: account.client.data,	
				status: status,
				msgnumber: msgnumber,
				data:data,
				data: rawdata
			});
		}
	},
	pop3_onQuit: function(account, status, rawdata){
		var self = this;
		if (status === true){
			if(self.pop3_Settings.debug) console.log("QUIT success");
			self.emit('POP3.Disconnected', {
				account:account.client.data,
				status: status,
				rawdata:rawdata
			});
		}else{
			self.emit('POP3.DisconnectFailed', {
				account:account.client.data,
				status: status,
				rawdata:rawdata
			});
		}	
	},
	pop3_onMessageParsed: function(account, message){
		var self = this;
		var accountObject = self.deleteDataFields(self.copyDataFields(account), ['client', 'mailparser', 'password']); //remove a few fields that cause issues when trying to convert to json(and aren't need by anything but this mixin anyway)
		self.emit('POP3.MessageReady', {
			account: accountObject, 
			message: message
		});
	}
}

if (typeof define === 'function' && define.amd) {
	//define(mixinFunctions);
	if(self.pop3_Settings.debug) console.log('Browser Support is not supplied for the POP3 Mixin.');
} else {
	module.exports = mixinFunctions;
}
