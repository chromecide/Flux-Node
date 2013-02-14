var FluxNode = require('../../../../FluxNode.js').FluxNode;

new FluxNode({
	mixins:[
		{
			name: 'SessionManager'
		},
		{
			name: 'TCPTunnels',
			options:{
				port: 9092
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
	//connect to the server
	thisNode.TCPTunnels_Connect({
		host: '127.0.0.1',
		port: 9000
	});
});
