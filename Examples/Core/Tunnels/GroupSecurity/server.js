var FluxNode = require('../../../../FluxNode.js').FluxNode;

new FluxNode({
	stores:[
		{
			type:'Memory',
			id: 'default',
			name: 'default',
			options:{
				
			}
		}
	],
	mixins:[
		{
			name: 'SessionManager',
			options:{
				databaseName: 'default',
				buildStructure: true
			}
		},
		{
			name: 'TCPTunnels',
			options:{
				
			}
		},
		{
			name: 'GroupSecurity',
			options:{
				loginTimeout: 90,
				method: 'permission',
				/*store: {
					databaseName: 'tunnel_auth_test'
				},*/
				protectedTopics:{
					
				},
				unprotectedTopics: {
					'hello': true
				}
			}
		}
	]	
},
function(thisNode){
	console.log(thisNode);
});
