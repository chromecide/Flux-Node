var FluxNode = require('../../FluxNode').FluxNode;

var SecureNode = new FluxNode({
	mixins:[
		{
			name: 'FNMAuthenticatedTunnels'
		},
		{
			name: 'FluxNode-Websockets',
			options:{
				port:8081
			}
		}
	]
}, function(nd){
	var thisNode = nd;
	
	//Add some Groups
	thisNode.FNMGroupSecurity_AddGroup({
		name: 'Administrators'
	}, function(err, groupRec){
		console.log('Administrators Group Saved');
		thisNode.FNMGroupSecurity_AddUser({
			name: 'Administrator',
			username: 'admin',
			password: 'abc123',
			groups: [
				groupRec
			]
		}, function(err, userRec){
			console.log('Admin User Saved');
		});
	});
});
