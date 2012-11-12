var mixinFunctions = {
	init: function(){
		var thisNode = this;
		//add properties that are needed by this mixin
		
		//first let's see if the data has already been installed
		console.log('INSTALLING DATA');
		thisNode.StorageManager.findOne(
			{
				username: 'admin'
			},
			thisNode.GroupSecurity_Settings.store,
			thisNode.GroupSecurity_Settings.userChannel,
			function(err, rec){
				console.log(arguments);
				if(!rec){
					console.log('Adding Group');
					//Add some Groups
					thisNode.GroupSecurity_AddGroup({
						name: 'Administrators'
					}, function(err, groupRec){
						console.log('Administrators Group Saved');
						thisNode.GroupSecurity_AddUser({
							name: 'Administrator',
							username: 'admin',
							password: 'abc123',
							groups: [
								groupRec.id
							]
						}, function(err, userRec){
							console.log('Admin User Saved');
							//Add Some Permissions
							var perm = {
								topic: 'hello',
								user: userRec.record.id,
								allowed: true
							};
							
							thisNode.GroupSecurity_SetUserPermission(perm, function(err, topic, userid, value){
								console.log('Permission Saved');
								thisNode.emit('Mixin.Ready',{
									name: 'installDataMixins'	
								});
							});
						});
					});
				}else{
					thisNode.emit('Mixin.Ready',{
						name: 'installDataMixins'	
					});
				}
			}
		)
		
		//add Events that are emitted by this mixin
			
	}
}

if (typeof define === 'function' && define.amd) {
	define(mixinFunctions);
} else {
	module.exports = mixinFunctions;
}
	