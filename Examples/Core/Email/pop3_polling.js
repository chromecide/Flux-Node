var FluxNode = require('../../../FluxNode').FluxNode;

var mailHost = 'pop3.host.here';
var mailPort = 995;
var mailUsername = 'username@host.here';
var mailPassword = 'userpass';

new FluxNode({
	listeners:{
		'POP3.MessageReady': function(message){
			console.log(message.message.subject);
		}
	},
	mixins: [
		{
			name: 'pop3',
			options:{
				//debug: true,
				pollInterval: 1, //poll Interval in minutes
				Accounts: {
					'Pop3AccountName': {
						host: mailHost,
						port: mailPort,
						username: mailUsername,
						password: mailPassword,
						poll: true
					}
				}
			}
		}
	]
}, function(myMailerNode){
	console.log('POLLING STARTED');
});
