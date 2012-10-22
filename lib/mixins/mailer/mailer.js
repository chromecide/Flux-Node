var nodemailer = require('nodemailer');

var mixinFunctions = {
	init: function(cfg, callback){
		var thisNode = this;
		//add properties that are needed by this mixin
	
		//add Events that are emitted by this mixin
		thisNode.Mailer_Settings = {
			accounts: []
		}
		
		if(cfg){
			if(cfg.accounts){
				thisNode.Mailer_Settings.accounts = cfg.accounts;
			}
		}
		
		thisNode.emit('Mixin.Ready', {
			name: 'Mailer'
		});
		
		if(callback){
			callback(thisNode);
		}
	},
	Mailer_AddAccount: function(message, rawMessage){
		var thisNode = this;
		
		thisNode.Mailer_Settings.accounts.push(message);
	},
	Mailer_RemoveAccount: function(message, rawMessage){
		
	},
	Mailer_SendMail: function(message, rawMessage, callback){
		var thisNode = this;
		var from = message.from;
		var account = false;
		
		if(typeof rawMessage=='function'){
			callback = rawMessage;
			rawMessage = false;
		}
		
		for(var i=0;i<thisNode.Mailer_Settings.accounts.length;i++){
			if(thisNode.Mailer_Settings.accounts[i].email==from){
				console.log('we have an account');
				account = thisNode.Mailer_Settings.accounts[i];
			}
		}
		console.log(account);
		if(account){
			//build the transport
			var transport = nodemailer.createTransport(account.type, account);
			
			console.log('Sending Mail');
			transport.sendMail(message, function(error){
				console.log('BACK');
			    if(error){
			        console.log('Error occured');
			        console.log(error.message);
			        thisNode.emit('Mailer.Error', error);
			        return;
			    }
			    console.log('Message sent successfully!');
			    thisNode.emit('Mailer.MailSent', message);
			    if(callback){
			    	callback(error, message);
			    }
			    // if you don't want to use this transport object anymore, uncomment following line
			    transport.close(); // close the connection pool
			});
		}else{
			thisNode.emit('Mailer.Error', {
				message: 'Invalid account supplied'
			});
		}
	}
}

if (typeof define === 'function' && define.amd) {
	define(mixinFunctions);
} else {
	module.exports = mixinFunctions;
}