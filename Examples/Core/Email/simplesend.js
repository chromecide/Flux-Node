var FluxNode = require('../../FluxNode').FluxNode;

new FluxNode({
	mixins: [
		{
			name: 'mailer',
			options:{
				accounts:[
					{
						email: 'user@from.host',
						type: 'SMTP',
						host: 'outbound.smtp.host',
						auth: {
							user: 'user@smtp.host',
							pass: 'userpass'
						}
					}
				]	
			}
		}
	]
}, function(myMailerNode){
	myMailerNode.on('Mailer.MailSent', function(){
		console.log('Mail Sent');
	});
	
	myMailerNode.on('Mailer.Error', function(){
		console.log('Mail not Sent: ');
		console.log(arguments);
	});
	
	myMailerNode.Mailer_SendMail({
		from: 'user@from.host',
		to: 'user@to.host',
		subject: 'Flux Singularity SMTP Test',
		text: 'Flux Singularity SMTP Test',
		html: 'Flux Singularity SMTP Test',
	});
});
