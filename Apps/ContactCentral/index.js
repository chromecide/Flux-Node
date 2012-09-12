
var FluxNode = require('../../lib/FluxNode_0.0.1').FluxNode;

var hostName = '0.0.0.0';
var hostPort = 8080;

var basePath = process.env.PWD;
 
var AllSeeingEye = new FluxNode({
	mixins: [
		/*{
			name: basePath+'/Mixins/Sector',
			options:{
				host: hostName,
				port: hostPort,
				Grid:{
					width: 40
				}
			}
		},*/
		{
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
		},
		function(self){
			self.emit('Sector.Start', {});
			//console.log(self.SectorMap.grid);
		}
	]
});


