var FluxNode = require('../../FluxNode').FluxNode;

var SecureNode = new FluxNode({
	mixins:[
		{
			name: 'FNMGroupSecurity',
			options:{
				loginTimeout: 10,
				method: 'simple',
				protectedTopics:{
					
				},
				unprotectedTopics: {
					'hello': true
				}
			}
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
			//Add Some Permissions
			thisNode.FNMGroupSecurity_SetUserPermission({
				topic: 'hello',
				user: userRec.id,
				allowed: true
			}, function(err, topic,userid, value){
				console.log('Permission Saved')
			});
		});
	});
	
	//Add some Groups
	thisNode.FNMGroupSecurity_AddGroup({
		name: 'Guests'
	}, function(err, groupRec){
		console.log('Guest Group Saved');
		thisNode.FNMGroupSecurity_AddUser({
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
});
