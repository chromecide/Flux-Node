var FluxNode = require('../../../FluxNode').FluxNode;

var SecureNode = new FluxNode({
	debug:true,
	stores:[
		{
			type: 'mongodb',
			options:{
				host: 'localhost',
				port: 27017,
				databaseName: 'tunnel_auth_test'
			},
			isDefault: true
		}
	],
	mixins:[
		{
			name: 'GroupSecurity',
			options:{
				loginTimeout: 10,
				method: 'permission',
				store: {
					databaseName: 'tunnel_auth_test'
				},
				protectedTopics:{
					
				},
				unprotectedTopics: {
					'hello': true
				}
			}
		},
		{
			name: 'websockets',
			options:{
				port:8081
			}
		},
		{
			name: __dirname+'/installDataMixin.js'
		}
	]
}, function(nd){
	var thisNode = nd;
	
	//Add some Groups
	/*
	 thisNode.GroupSecurity_AddGroup({
		name: 'Guests'
	}, function(err, groupRec){
		console.log('Guest Group Saved');
		thisNode.GroupSecurity_AddUser({
			name: 'Guest',
			username: 'guest',
			password: 'guestpass',
			groups: [
				groupRec
			]
		}, function(err, userRec){
			console.log('Guest User Saved');
		});
	});
	*/
	
});
