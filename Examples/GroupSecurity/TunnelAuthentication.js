var FluxNode = require('../../FluxNode').FluxNode;

var SecureNode = new FluxNode({
	mixins:[
		{
			name: 'FNMGroupSecurity',
			options:{
				
			}
		},
		{
			name: 'FNM-WebServer'
		}
	]
}, function(nd){
	var thisNode = nd;
	thisNode.FNMWebserver_startServer();
	//Add some Groups
	/*thisNode.FNMGroupSecurity_doAddGroup({
		name: 'Administrators'
	});
	
	thisNode.FNMGroupSecurity_doAddGroup({
		name: 'Guests'
	});
	
	//Add some Users
	thisNode.FNMGroupSecurity_doAddUser({
		name: 'Administrator',
		groups: [
			'Administrators'
		]
	});

	thisNode.FNMGroupSecurity_doAddUser({
		name: 'Guest',
		groups: [
			'Guests'
		]
	});*/
});
