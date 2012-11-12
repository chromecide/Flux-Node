var mixinFunctions = {
	GroupSecurity_Settings:{
		store: false,
		groupChannel: false,
		userChannel: false,
		permissionChannel: false,
		method: 'inorout',
		loginTimeout: 0,
		unprotectedTopics: {
			'init': true,
			'GroupSecurity.Login': true,
			'GroupSecurity.Logout': true,
			'GroupSecurity.MustLogin': true,
			'GroupSecurity.LoginTimeoutReached': true,
			'GroupSecurity.LoginFailed': true,
			'GroupSecurity.LoginSuccessful': true
		},
		protectedTopics:{
			'GroupSecurity':{
				'AddGroup':{},
				'UpdateGroup':{},
				'DeleteGroup':{},
				'FindGroups':{},
				'AddUser':{},
				'UpdateUser':{},
				'DeleteUser':{},
				'AddUserToGroup':{},
				'RemoveUserFromGroup':{},
				'SetGroupPermission':{},
				'SetUserPermission':{},
			}
		}
	},
	init: function(cfg, callback){
		var thisNode = this;
		//add properties that are needed by this mixin
	
		thisNode.TunnelManager.configureManager({
			allowed: function(action, tunnel, topic, message, callback){
				
				if(!tunnel.isLoggedIn){
					tunnel.isLoggedIn = false;
				}
				
				thisNode.GroupSecurity_GetUserPermission({
					user: tunnel.authUser?tunnel.authUser.id:false,
					topic: topic,
					message: message
				}, function(err, hasPermission, permission){
					if(callback){
						callback(err, hasPermission);
					}
				});
				
				return false;
			}
		});
		
		thisNode.on('Tunnel.Ready', function(destination, tunnel){
			
			if(thisNode.GroupSecurity_Settings.loginTimeout>0){
				thisNode.sendEvent(destination, 'GroupSecurity.MustLogin', {
					timeout: thisNode.GroupSecurity_Settings.loginTimeout
				});
				
				setTimeout(function(){
					if(!tunnel.isLoggedIn){
						thisNode.sendEvent(destination, 'GroupSecurity.LoginTimeoutReached', {});
						thisNode.TunnelManager.deregisterTunnel(destination);	
					}
				}, thisNode.GroupSecurity_Settings.loginTimeout*1000); //inout supploied in seconds	
			}
			
		});
		
		//add Events that are Tracked by this mixin
		thisNode.on('FNMGroupGroupSecurity.AddGroup', function(message, rawMessage){
			thisNode.GroupSecurity_AddGroup(message, rawMessage);
		});
		
		thisNode.on('GroupSecurity.UpdateGroup', function(message, rawMessage){
			thisNode.GroupSecurity_UpdateGroup(message, rawMessage);
		});
		
		thisNode.on('GroupSecurity.DeleteGroup', function(message, rawMessage){
			thisNode.GroupSecurity_DeleteGroup(message, rawMessage);
		});
		
		thisNode.on('GroupSecurity.FindGroups', function(message, rawMessage){
			thisNode.GroupSecurity_FindGroups(message, rawMessage);
		});
		
		thisNode.on('GroupSecurity.AddUser', function(message, rawMessage){
			thisNode.GroupSecurity_AddUser(message, rawMessage);
		});
		
		thisNode.on('GroupSecurity.UpdateUser', function(message, rawMessage){
			thisNode.GroupSecurity_UpdateUser(message, rawMessage);
		});
		
		thisNode.on('GroupSecurity.RemoveUser', function(message, rawMessage){
			thisNode.GroupSecurity_RemoveUser(message, rawMessage);
		});
		
		thisNode.on('GroupSecurity.Login', function(message, rawMessage){
			thisNode.GroupSecurity_Login(message, rawMessage);
		});
		
		thisNode.on('GroupSecurity.Logout', function(message, rawMessage){
			thisNode.GroupSecurity_Logout(message, rawMessage);
		});
		
		thisNode.on('GroupSecurity.FindUsers', function(message, rawMessage){
			thisNode.GroupSecurity_FindUsers(message, rawMessage);
		});
		
		thisNode.on('GroupSecurity.AddUserToGroup', function(message, rawMessage){
			thisNode.GroupSecurity_AddUserToGroup(message, rawMessage);
		});
		
		thisNode.on('GroupSecurity.RemoveUserFromGroup', function(message, rawMessage){
			thisNode.GroupSecurity_RemoveUserFromGroup(message, rawMessage);
		});
		
		thisNode.on('GroupSecurity.SetGroupPermission', function(message, rawMessage){
			thisNode.GroupSecurity_SetGroupPermission(message, rawMessage);
		});
		
		thisNode.on('GroupSecurity.SetUserPermission', function(message, rawMessage){
			thisNode.GroupSecurity_SetUserPermission(message, rawMessage);
		});
		
		//Process any supplied configuration options
		if(cfg){
			if(cfg.store){
				thisNode.GroupSecurity_Settings.store = cfg.store;
			}else{
				thisNode.GroupSecurity_Settings.store = false;
			}
			
			if(cfg.groupChannel){
				thisNode.GroupSecurity_Settings.groupChannel = cfg.groupChannel;
			}else{
				thisNode.GroupSecurity_Settings.groupChannel = 'groups';
			}
			
			if(cfg.userChannel){
				thisNode.GroupSecurity_Settings.userChannel = cfg.groupChannel;
			}else{
				thisNode.GroupSecurity_Settings.userChannel = 'users';
			}
			
			
			if(cfg.permissionChannel){
				thisNode.GroupSecurity_Settings.permissionChannel = cfg.permissionChannel;
			}else{
				thisNode.GroupSecurity_Settings.permissionChannel = 'permissions';
			}
			
			if(cfg.method){
				thisNode.GroupSecurity_Settings.method = cfg.method;
			}
			
			if(cfg.loginTimeout>0){
				thisNode.GroupSecurity_Settings.loginTimeout = cfg.loginTimeout;
			}
		}else{
			var defaultStore = thisNode.StorageManage.getDefaultStore();
			if(!defaultStore){
				thisNode.once('Store.Ready', function(err, store){
					
				});
			}else{
				thisNode.GroupSecurity_Settings.store = thisNode.StorageManager.getDefaultStore();	
			}
			
			thisNode.GroupSecurity_Settings.groupChannel = 'groups';
			thisNode.GroupSecurity_Settings.userChannel = 'users';
		}
		
		thisNode.emit('Mixin.Ready', thisNode);
		if(callback){
			callback(this);
		}
	},
	GroupSecurity_Allowed: function(message, rawMessage){
		return true;
	},
	GroupSecurity_AddGroup: function(message, rawMessage){
		var thisNode = this;
		var originalArgs = arguments;
		
		
		thisNode.StorageManager.save(message, thisNode.GroupSecurity_Settings.store, thisNode.GroupSecurity_Settings.groupChannel, function(err, records){
			if(!err){
				thisNode.emit('GroupSecurity.GroupSaved', records[0]);
			}else{
				thisNode.emit('GroupSecurity.GroupSaveError', {
					error: err,
					group: message
				});
			}
			
			if((typeof (originalArgs[originalArgs.length-1]))=='function'){ 
				var callback = originalArgs[originalArgs.length-1];
				
				callback(err, records[0]);
			}
		});
	},
	GroupSecurity_UpdateGroup: function(){
		var thisNode = this;
		var originalArgs = arguments;
		thisNode.StorageManager.save(message, thisNode.GroupSecurity_Settings.store, thisNode.GroupSecurity_Settings.groupChannel, function(err, records){
			if(!err){
				thisNode.emit('GroupSecurity.GroupSaved', records[0]);
			}else{
				thisNode.emit('GroupSecurity.GroupSaveError', {
					error: err,
					group: message
				});
			}
			
			if((typeof (originalArgs[originalArgs.length-1]))=='function'){ 
				var callback = originalArgs[originalArgs.length-1];
				callback(err, records[0]);
			}
		});
	},
	GroupSecurity_DeleteGroup: function(){
		
	},
	GroupSecurity_FindGroups: function(message, rawMessage){
		var thisNode = this;
		var originalArgs = arguments;
		thisNode.StorageManager.find(message.query, {}, thisNode.GroupSecurity_Settings.store, thisNode.GroupSecurity_Settings.groupChannel, function(err, records){
			if(!err){
				thisNode.emit('GroupSecurity.FindGroupsResponse', {
					err:err,
					records: records
				});
			}else{
				thisNode.emit('GroupSecurity.FindGroupsError', {
					error: err,
					group: message
				});
			}
			
			if((typeof (originalArgs[originalArgs.length-1]))=='function'){ 
				var callback = originalArgs[originalArgs.length-1];
				callback(err, records);
			}
		});
	},
	GroupSecurity_AddUser: function(message, rawMessage){
		var thisNode = this;
		var originalArgs = arguments;
		thisNode.StorageManager.save(message, thisNode.GroupSecurity_Settings.store, thisNode.GroupSecurity_Settings.userChannel, function(err, records){
			if(!err){
				thisNode.emit('GroupSecurity.UserSaved', records[0]);
			}else{
				thisNode.emit('GroupSecurity.UserSaveError', {
					error: err,
					group: message
				});
			}
			
			if((typeof (originalArgs[originalArgs.length-1]))=='function'){ 
				var callback = originalArgs[originalArgs.length-1];
				callback(err, records[0]);
			}
		});
	},
	GroupSecurity_UpdateUser: function(message, rawMessage){
		var thisNode = this;
		var originalArgs = arguments;
		
		thisNode.StorageManager.save(message, thisNode.GroupSecurity_Settings.store, thisNode.GroupSecurity_Settings.userChannel, function(err, records){
			if(!err){
				thisNode.emit('GroupSecurity.UserSaved', records[0]);
			}else{
				thisNode.emit('GroupSecurity.UserSaveError', {
					error: err,
					group: message
				});
			}
			
			if((typeof (originalArgs[originalArgs.length-1]))=='function'){ 
				var callback = originalArgs[originalArgs.length-1];
				callback(err, records[0]);
			}
		});
	},
	GroupSecurity_DeleteUser: function(){
		
	},
	GroupSecurity_Login: function(message, rawMessage){
		var thisNode = this;
		var originalArgs = arguments;
		
		thisNode.StorageManager.find(message, {}, thisNode.GroupSecurity_Settings.store, thisNode.GroupSecurity_Settings.userChannel, function(err, recs){
			if(!err){
				if(recs.length>0){
					var tunnel = thisNode.TunnelManager.getTunnel(rawMessage._message.sender);
					
					tunnel.isLoggedIn = true;
					tunnel.authUser = recs[0].record;
					thisNode.emit('GroupSecurity.UserLoggedIn', recs[0]);
					thisNode.sendEvent(rawMessage._message.sender, 'GroupSecurity.LoginSuccessful', recs[0]);
				}else{
					thisNode.emit( 'GroupSecurity.UserLoginFailed', message, rawMessage);
					thisNode.sendEvent(rawMessage._message.sender, 'GroupSecurity.LoginFailed', {message: 'Invalid Username or Password'});
				}
			}else{
				
				thisNode.emit('GroupSecurity.UserLoginError', message, rawMessage);
				thisNode.sendEvent(rawMessage._message.sender, 'GroupSecurity.LoginFailed', err);
			}
			
			if((typeof (originalArgs[originalArgs.length-1]))=='function'){ 
				var callback = originalArgs[originalArgs.length-1];
				callback(err, records[0]);
			}
		});
	},
	GroupSecurity_Logout: function(message, rawMessage){
		var thisNode = this;
		var originalArgs = arguments;
		
		var user = thisNode.TunnelManager.getTunnel(rawMessage._message.sender).authUser;
		thisNode.TunnelManager.deregisterTunnel(rawMessage._message.sender, function(err){
			if(!err){
				//TODO: load user information
				thisNode.emit('GroupSecurity.UserLoggedOut', {
					user: user
				});
			}else{
				thisNode.sendEvent(rawMessage._message.sender, 'GroupSecurity.UserLogoutError', {});
			}
			
			if((typeof (originalArgs[originalArgs.length-1]))=='function'){ 
				var callback = originalArgs[originalArgs.length-1];
				callback(err, records[0]);
			}
		});
	},
	GroupSecurity_FindUsers: function(message, rawMessage){
		var thisNode = this;
		var originalArgs = arguments;
		thisNode.StorageManager.find(message.query, {}, thisNode.GroupSecurity_Settings.store, thisNode.GroupSecurity_Settings.usersChannel, function(err, records){
			if(!err){
				thisNode.emit('GroupSecurity.FindUsersResponse', {
					err:err,
					records: records
				});
			}else{
				thisNode.emit('GroupSecurity.FindUsersError', {
					error: err,
					group: message
				});
			}
			
			if((typeof (originalArgs[originalArgs.length-1]))=='function'){ 
				var callback = originalArgs[originalArgs.length-1];
				callback(err, records);
			}
		});
	},
	GroupSecurity_AddUserToGroup: function(message, rawMessage){
		
	},
	GroupSecurity_RemoveUserFromGroup: function(message, rawMessage){
		
	},
	GroupSecurity_SetGroupPermission: function(message, rawMessage){
		var thisNode = this;
		
		var originalArgs = arguments;
		
		var query = {
			recipient: message.group,
			topic: message.topic
		};
		
		thisNode.StorageManager.findOne(query, {}, thisNode.GroupSecurity_Settings.store, thisNode.GroupSecurity_Settings.permissionChannel, function(err, record){
			if(record){
				record.allowed = message.allowed;
			}else{
				record.recipient = message.group;
				record.topic = message.topic;
				record.allowed = message.allowed;
			}
			
			thisNode.StorageManager.save(record, thisNode.GroupSecurity_Settings.store, thisNode.GroupSecurity_Settings.permissionChannel, function(err, records){
				thisNode.emit('GroupSecurity.GroupPermissionSet', record);
				thisNode.emit('GroupSecurity.PermissionSet', {
					type: 'group',
					record: record
				});
				
				if((typeof (originalArgs[originalArgs.length-1]))=='function'){ 
					var callback = originalArgs[originalArgs.length-1];
					callback(err, records);
				}	
			});
		});
	},
	GroupSecurity_GetGroupPermission: function(message, rawMessage){
		var thisNode = this;
		var err = false;
		var groupId = message.group;
		var topic = message.topic;
		var allowed = false;
		var permission = false; //used mainly by the more advanced security types
		
		if(!userId){ //only hope is if the event is in the unprotected list
			if(thisNode.GroupSecurity_Settings.unprotectedTopics){
				allowed = true;
				permission = true;
			}
		}else{
			switch(thisNode.GroupSecurity_Settings.method){
				case 'inorout': // you can do anything if you're logged in, nothing if you're not
					if(groupId){
						allowed = true;
						permission = true;
					}
					
					if((typeof (arguments[arguments.length-1]))=='function'){ 
						var callback = arguments[arguments.length-1];
						callback(err, allowed, permission);
					}
					break;
				case 'simple': // a group or user can be assigned a true or false as to whether they are allowed to access certain functions
					console.log('checking permission tree for: '+topic);
					var topicParts = topic.split('.');
					function checkForKey(object, keyParts){
						var keyPart = keyParts.shift();
						console.log('checking for: '+keyPart);
						console.log(object);
						if(object[keyPart]){
							if(keyParts.length==0){
								return true;
							}else{
								return checkForKey(object[keyPart], keyParts);
							}
						}else{
							return false;	
						}
					}
					//add the user id on the end because that's how the tree is setup i.e. mixin.topic.user1id, mixin.topic.user2id
					console.log('USER:'+userId);
					topicParts.push(userId);
					allowed = checkForKey(thisNode.GroupSecurity_Settings.protectedTopics, topicParts);
					permission = allowed;
					
					if((typeof (arguments[arguments.length-1]))=='function'){ 
						var callback = arguments[arguments.length-1];
						callback(err, allowed, permission);
					}
					break;
				case 'permission':
					var originalArgs = arguments;
					
					var query = {
						recipient: message.user,
						topic: message.topic
					};
					
					thisNode.StorageManager.findOne(query, {}, thisNode.GroupSecurity_Settings.store, thisNode.GroupSecurity_Settings.permissionChannel, function(err, record){
						if(record){
							record.allowed = message.allowed;
						}else{
							record.recipient = message.user;
							record.topic = message.topic;
							record.allowed = message.allowed;
						}
						
						if((typeof (originalArgs[originalArgs.length-1]))=='function'){ 
							var callback = originalArgs[originalArgs.length-1];
							callback(err, records);
						}
					});
					break;
				default: 
				
					break;
			}
		}
	},
	GroupSecurity_SetUserPermission: function(message, rawMessage){
		var thisNode = this;
		
		var originalArgs = arguments;
		
		var query = {
			recipient: message.user,
			topic: message.topic
		};
		thisNode.StorageManager.findOne(query, {}, thisNode.GroupSecurity_Settings.store, thisNode.GroupSecurity_Settings.permissionChannel, function(err, record){
			
			if(record && record.topic){
				record.allowed = message.allowed;
			}else{
				record = {
					recipient: query.recipient,
					topic: message.topic,
					allowed: message.allowed
				};
			}
			thisNode.StorageManager.save(record, thisNode.GroupSecurity_Settings.store, thisNode.GroupSecurity_Settings.permissionChannel, function(err, records){
				thisNode.emit('GroupSecurity.UserPermissionSet', record);
				thisNode.emit('GroupSecurity.PermissionSet', {
					type: 'user',
					record: record
				});
				
				if((typeof (originalArgs[originalArgs.length-1]))=='function'){ 
					var callback = originalArgs[originalArgs.length-1];
					callback(err, records[0]);
				}	
			});
		});
	},
	GroupSecurity_GetUserPermission: function(message, rawMessage){
		console.log(message);
		var thisNode = this;
		var err = false;
		var userId = message.user;
		var topic = message.topic;
		var allowed = false;
		var permission = false; //used mainly by the more advanced security types
		
		if(topic=='init'){ //init MUST be allowed
			allowed = true;
			permission = true;
			if((typeof (arguments[arguments.length-1]))=='function'){
				var callback = arguments[arguments.length-1];
				callback(err, allowed, permission);
			}
			return true;
		}else{
			console.log('CHECKING PERMS');
			if(!userId){ //only hope is if the event is in the unprotected list
				console.log('checking unprotected');
				console.log(topic);
				if(thisNode.GroupSecurity_Settings.unprotectedTopics[topic]){
					allowed = true;
					permission = true;
				}
				console.log(allowed);
				if((typeof (arguments[arguments.length-1]))=='function'){ 
					var callback = arguments[arguments.length-1];
					callback(err, allowed, permission);
				}
			}else{
				console.log(thisNode.GroupSecurity_Settings.method);
				switch(thisNode.GroupSecurity_Settings.method){
					case 'inorout': // you can do anything if you're logged in, nothing if you're not
						if(userId){
							allowed = true;
							permission = true;
						}
			
						if((typeof (arguments[arguments.length-1]))=='function'){ 
							var callback = arguments[arguments.length-1];
							callback(err, allowed, permission);
						}
						break;
					case 'simple': // a group or user can be assigned a true or false as to whether they are allowed to access certain functions
						console.log('checking permission tree for: '+topic);
						var topicParts = topic.split('.');
						function checkForKey(object, keyParts){
							var keyPart = keyParts.shift();
							console.log('checking for: '+keyPart);
							console.log(object);
							if(object[keyPart]){
								if(keyParts.length==0){
									return true;
								}else{
									return checkForKey(object[keyPart], keyParts);
								}
							}else{
								return false;	
							}
						}
						//add the user id on the end because that's how the tree is setup i.e. mixin.topic.user1id, mixin.topic.user2id
						console.log('USER:'+userId);
						topicParts.push(userId);
						allowed = checkForKey(thisNode.GroupSecurity_Settings.protectedTopics, topicParts);
						permission = allowed;
						
						if((typeof (arguments[arguments.length-1]))=='function'){ 
							var callback = arguments[arguments.length-1];
							callback(err, allowed, permission);
						}
						break;
					case 'permission':
						//TODO: find permission information for the supplied user/topic combination
					
						var originalArgs = arguments;
						
						var query = {
							recipient: message.user,
							topic: message.topic
						};
						console.log(query);
						thisNode.StorageManager.findOne(query, {}, thisNode.GroupSecurity_Settings.store, thisNode.GroupSecurity_Settings.permissionChannel, function(err, record){
							console.log('here');
							if(record){
								record.allowed = message.allowed;
							}else{
								record.recipient = message.user;
								record.topic = message.topic;
								record.allowed = message.allowed;
							}
							
							if((typeof (originalArgs[originalArgs.length-1]))=='function'){ 
								var callback = originalArgs[originalArgs.length-1];
								callback(err, record);
							}
						});
						break;
					default: 
					
						break;
				}
			}	
		}
	}
}

if (typeof define === 'function' && define.amd) {
	define(mixinFunctions);
} else {
	module.exports = mixinFunctions;
}
	