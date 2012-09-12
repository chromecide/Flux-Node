
var FluxNode = require('../../lib/FluxNode_0.0.1').FluxNode;

var hostName = '0.0.0.0';
var hostPort = 8080;

var basePath = process.env.PWD;
 
var ContactCentral = new FluxNode({
	mixins: [
		/*{
			name: 'emailclient',
			options:{
				Accounts:[
					{
						Name: 'chromecide@chromecide.com',
						type: 'pop3',
						host: 'mail.chromecide.com',
						username: 'chromecide@chromecide.com',
						password: 'aedyn1'
					}
				]
			}
		},
		{
			name: 'twitterclient',
			AuthKey: '',
			AuthSecret: ''
		},
		{
			name: 'facebookclient',
			AuthKey: '',
			AuthSecret: ''
		},
		{
			name: 'googleplusclient',
			AuthKey: '',
			AuthSecret: ''
		},*/
		{
			name: 'UserProfile',
			options:{
				DisplayName: 'Justin Pradier',
				Avatar: '',
				Email: []
			}
		},
		function(self){
			self.emit('Clients.Ready', {});
			//console.log(self.SectorMap.grid);
		}
	]
});


