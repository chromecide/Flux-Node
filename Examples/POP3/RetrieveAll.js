
var FluxNode;
var POP3Node = null;

var mailHost = '';
var mailPort = 110;
var mailUsername = '';
var mailPassword = '';

FluxNode = require('../../lib/FluxNode').FluxNode;

POP3Node = new FluxNode({
	delimiter:'.',
	wildcard:true,
	mixins: [
		{
			name: 'pop3',
			options:{
				debug:true,
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
});

POP3Node.on('POP3.MessageReady', function(data){
	var isSpam = false;
	if(data.message.subject.indexOf('Ciails')>-1 || data.message.subject.indexOf('Viarga')>-1 || data.message.subject.indexOf('Viagra')>-1){
		isSpam = true;
	}
	console.log(data.account.username+' Recieved: '+(isSpam?'SPAM': data.message.subject));
});

POP3Node.pop3_doPoll();
