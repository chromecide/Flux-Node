
if (typeof define === 'function' && define.amd) {
	var browserMixinFunctions = {
		GroupSecurity_Settings:{
			dialog: false
		},
		init: function(cfg, callback){
			var thisNode = this;
			
			
			thisNode.on('GroupSecurity.MustLogin', function(message, rawMessage){
				thisNode.GroupSecurity_onMustLogin(message, rawMessage);
			});
			
			thisNode.on('GroupSecurity.LoginWindow.Login', function(creds, rawMessage){
				console.log(thisNode.serverID);
				thisNode.sendEvent(thisNode.serverID, 'GroupSecurity.Login', creds, function(){
					console.log(arguments);
				});
			});
			
			thisNode.on('GroupSecurity.LoginWindow.Show', function(opts, rawMessage){
				thisNode.GroupSecurity_ShowLoginWindow(opts, rawMessage);
			});
			
			thisNode.FluxUI_getWorkspace(false, function(activeWorkspace){
				activeWorkspace.getDefaultLaunchbar(function(lb){
					lb.addLauncher({
						text:'Login',
						clickEvent: 'GroupSecurity.LoginWindow.Show'
					});
					lb.refresh();
				});
			});
			
			if(callback){
				callback(thisNode, cfg);	
			}
			
			thisNode.emit('Mixin.Ready', cfg);
		},
		GroupSecurity_onMustLogin: function(message, rawMessage){
			var thisNode = this;
			thisNode.GroupSecurity_ShowLoginWindow();
		},
		GroupSecurity_ShowLoginWindow: function(callback){
			var thisNode = this;
			
			if(thisNode.GroupSecurity_Settings.dialog){
				thisNode.GroupSecurity_Settings.dialog.show();
				thisNode.emit('GroupSecurity.LoginWindow.Shown', {});	
			}else{
				var loginDialog = new FluxUI.Dialog({
					name: 'LoginWindow',
					title: 'Login',
					size:{
						height: 150,
						width:400
					},
					dashlets: [
						{
							type: 'form',
							name: 'loginWindowForm',
							options: {
								fields: [
									{
										type: 'form/inputfield',
										name: 'username',
										options:{
											type: 'text',
											label: 'Username'
										}
									},
									{
										type: 'form/inputfield',
										name: 'password',
										options:{
											type: 'password',
											label: 'Password'
										}
									}
								]
							}
						}
					],
					buttons:[
						{
							name: 'LoginWindow_LoginButton',
							options:{
								display: 'Login',
								clickEvent:{
									name: 'GroupSecurity.LoginWindow.LoginButton.Click'
								}
							}
						},
						{
							name: 'LoginWindow_CancelButton',
							options:{
								display: 'Cancel',
								clickEvent:{
									name: 'GroupSecurity.LoginWindow.Hide'
								}
							}
						}
					]
				}, function(dlg){	
					thisNode.GroupSecurity_Settings.dialog = dlg;
					thisNode.on('GroupSecurity.LoginWindow.Show', function(message, rawMessage){
						thisNode.GroupSecurity_ShowLoginWindow();
					});
					
					thisNode.on('GroupSecurity.LoginWindow.Hide', function(message, rawMessage){
						thisNode.GroupSecurity_HideLoginWindow();
					});
					
					thisNode.on('GroupSecurity.LoginWindow.LoginButton.Click', function(message, rawMessage){
						thisNode.GroupSecurity_ProcessLogin();
					});
					
					thisNode.GroupSecurity_Settings.dialog.show();
					thisNode.emit('GroupSecurity.LoginWindow.Shown', {});	
					
					if(callback){
						callback({
							name: 'loginWindow'
						});
					}
					
					thisNode.emit('Mixin.Ready', {
						name: 'loginWindow'
					});
				});
			}
		},
		GroupSecurity_HideLoginWindow: function(){
			var thisNode = this;
			
			thisNode.GroupSecurity_Settings.dialog.hide();
			thisNode.emit('GroupSecurity.LoginWindow.Hidden', {});
		},
		GroupSecurity_ProcessLogin: function(){
			var thisNode = this;
			
			thisNode.GroupSecurity_Settings.dialog.hide();
			var formDashlet = thisNode.GroupSecurity_Settings.dialog.dashlets[0];
			formDashlet.getValues(function(valObject){
				thisNode.emit('GroupSecurity.LoginWindow.Login', valObject);
			});
		}
	};
	
	define(browserMixinFunctions);
} else {
	var nodeMixinFunctions = {
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
				'GroupSecurity.Logout.Response': true,
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
					'SetUserPermission':{}
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
					if((typeof tunnel)=='string'){
						tunnel = thisNode.TunnelManager.getTunnel(tunnel);
					}
					if(!tunnel){
						console.log(arguments);
					}
					thisNode.GroupSecurity_GetUserPermission({
						user: (tunnel && tunnel.authUser)?tunnel.authUser.id:false,
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
				//TODO: re-implement session code
				if(thisNode.GroupSecurity_Settings.loginTimeout>0){
					thisNode.sendEvent(destination, 'GroupSecurity.MustLogin', {
						timeout: thisNode.GroupSecurity_Settings.loginTimeout
					});
					
					function timeoutBuilder(tunnelToCheck, detinationToCheck){
						setTimeout(function(){
							if(!tunnelToCheck.isLoggedIn){
								thisNode.sendEvent(detinationToCheck, 'GroupSecurity.LoginTimeoutReached', {});
								thisNode.TunnelManager.deregisterTunnel(detinationToCheck);	
							}
						}, thisNode.GroupSecurity_Settings.loginTimeout*1000); //inout supploied in seconds	
					}
					timeoutBuilder(tunnel, destination);	
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
			
			
			thisNode.on('GroupSecurity.GetUserDetails', function(message, rawMessage){
				thisNode.GroupSecurity_GetUserDetails(message, rawMessage);
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
			
	
			thisNode.emit('Mixin.Ready', {
				name: 'GroupSecurity'
			});
			
			if(callback){
				callback(thisNode);
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
				console.log('GROUPS FIND');
				console.log(records);
				if(!err){
					if(rawMessage && rawMessage._message){
						thisNode.sendEvent(rawMessage._message.sender, 'GroupSecurity.FindGroups.Response', {
							err: err, 
							records: records
						}, rawMessage._message.id);
					}
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
			console.log('UPDATING USER');
			console.log(message);
			if(!message.id){
				if(rawMessage && rawMessage._message){
					thisNode.sendEvent(rawMessage._message.sender, 'GroupSecurity.UpdateUser.Response', {
						err: {
							message: 'NO ID Supplied'
						},
						group: message
					}, rawMessage._message.id);
				}
				
				thisNode.emit('GroupSecurity.UpdateUserError', {
					err: {
						message: 'NO ID Supplied'
					},
					group: message
				});
				
				if((typeof (originalArgs[originalArgs.length-1]))=='function'){ 
					var callback = originalArgs[originalArgs.length-1];
					callback(err, records[0]);
				}
				return false;
			}else{
				console.log('LOADING USER RECORD');
				
				thisNode.StorageManager.findOne({id: message.id}, {}, thisNode.GroupSecurity_Settings.store, thisNode.GroupSecurity_Settings.userChannel, function(err, record){
					console.log(arguments);
					if(!err){
						console.log(record);
						var userRecord = record[0].record;
						console.log(userRecord);
						for(var keyIdx in message){
							if(keyIdx!='id'){
								userRecord[keyIdx] = message[keyIdx];
							}
						}
						thisNode.StorageManager.save(userRecord, thisNode.GroupSecurity_Settings.store, thisNode.GroupSecurity_Settings.userChannel, function(err, records){
							if(!err){
								if(rawMessage && rawMessage._message){
									thisNode.sendEvent(rawMessage._message.sender, 'GroupSecurity.UpdateUser.Response', {
										err: false,
										record: records[0]
									}, rawMessage._message.id);
								}
								thisNode.emit('GroupSecurity.UserSaved', records[0]);
							}else{
								if(rawMessage && rawMessage._message){
									thisNode.sendEvent(rawMessage._message.sender, 'GroupSecurity.UpdateUser.Response', {
										err: err,
										record: message
									}, rawMessage._message.id);
								}
								thisNode.emit('GroupSecurity.UpdateUserError', {
									error: err,
									group: message
								});
							}
							
							if((typeof (originalArgs[originalArgs.length-1]))=='function'){ 
								var callback = originalArgs[originalArgs.length-1];
								callback(err, records[0]);
							}
						});
					}else{
						thisNode.emit('GroupSecurity.UpdateUser.Response', {
							err: err,
							group: message
						});
						thisNode.emit('GroupSecurity.UpdateUserError', {
							error: err,
							group: message
						});
					}
				});
			}
		},
		GroupSecurity_DeleteUser: function(){
			
		},
		GroupSecurity_Login: function(message, rawMessage){
			var thisNode = this;
			var originalArgs = arguments;
			
			thisNode.StorageManager.find(message, {}, thisNode.GroupSecurity_Settings.store, thisNode.GroupSecurity_Settings.userChannel, function(err, recs){
				
				if(!err){
					if(recs.length>0){
						console.log('Setting Tunnel Auth');
						var tunnel = thisNode.TunnelManager.getTunnel(rawMessage._message.sender);
						
						tunnel.isLoggedIn = true;
						tunnel.authUser = recs[0].record;
						thisNode.emit('GroupSecurity.UserLoggedIn', recs[0]);
						
						thisNode.sendEvent(rawMessage._message.sender, 'GroupSecurity.LoginSuccessful', recs[0], rawMessage._message.id);
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
			thisNode.sendEvent(rawMessage._message.sender, 'GroupSecurity.Logout.Response', {}, rawMessage._message.id);
			
			setTimeout(function(){
				thisNode.TunnelManager.deregisterTunnel(rawMessage._message.sender, function(err){
					if(!err){
						
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
			}, 1000);
		},
		GroupSecurity_FindUsers: function(message, rawMessage){
			var thisNode = this;
			var originalArgs = arguments;
			thisNode.StorageManager.find(message.query, {}, thisNode.GroupSecurity_Settings.store, thisNode.GroupSecurity_Settings.userChannel, function(err, records){
				if(!err){
					if(rawMessage && rawMessage._message){
						thisNode.sendEvent(rawMessage._message.sender, 'GroupSecurity.FindUsers.Response', {
							err:err,
							records: records
						}, rawMessage._message.id);
					}
					thisNode.emit('GroupSecurity.FindUsersResponse', {
						err:err,
						records: records
					});
				}else{
					if(rawMessage && rawMessage._message){
						thisNode.sendEvent(rawMessage._message.sender, 'GroupSecurity.FindUsers.Response', {
							err:err,
							records: false
						}, rawMessage._message.id);
					}
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
		GroupSecurity_GetUserDetails: function(message, rawMessage){
			var thisNode = this;
			var originalArgs = arguments;
			thisNode.StorageManager.findOne(message.query, {}, thisNode.GroupSecurity_Settings.store, thisNode.GroupSecurity_Settings.userChannel, function(err, records){
				if(!err){
					var record = records[0].record;
					
					var groupsQuery = [];
					
					thisNode.GroupSecurity_GetUserPermission({user: record.id}, function(groupErr, permissionRecords){
						console.log('PERMISSION');
						console.log(permissionRecords);
						if(permissionRecords && permissionRecords.length>0){
							record.permissions = permissionRecords;
						}else{
							record.permissions = [];
						}
						
						if(record.groups.length>0){
							for(var i=0;i<record.groups.length;i++){
								groupsQuery.push({
									id: record.groups[i]
								});
							}
							
							thisNode.GroupSecurity_FindGroups({query: groupsQuery}, function(groupErr, groupRecords){
								record.groups = groupRecords;
								
								if(rawMessage && rawMessage._message){
									thisNode.sendEvent(rawMessage._message.sender, 'GroupSecurity.GetUserDetails.Response', {
										err:err,
										record: record
									}, rawMessage._message.id);
								}
								thisNode.emit('GroupSecurity.GetUserDetailsResponse', {
									err:err,
									record: record
								});
							});
						}else{
							if(rawMessage && rawMessage._message){
								thisNode.sendEvent(rawMessage._message.sender, 'GroupSecurity.GetUserDetails.Response', {
									err:err,
									record: record
								}, rawMessage._message.id);
							}
							thisNode.emit('GroupSecurity.GetUserDetailsResponse', {
								err:err,
								record: record
							});	
						}
					});
				}else{
					if(rawMessage && rawMessage._message){
						thisNode.sendEvent(rawMessage._message.sender, 'GroupSecurity.GetUserDetails.Response', {
							err:err,
							records: false
						}, rawMessage._message.id);
					}
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
							recipient: message.user
						};
						
						if(message.topic){
							query.topic = message.topic;
						}
						
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
			thisNode.StorageManager.findOne(query, {}, thisNode.GroupSecurity_Settings.store, thisNode.GroupSecurity_Settings.permissionChannel, function(err, records){
				
				var record = records?records[0]:false;
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
							
							
							
							var query = [];
							
							if(message.topic){
								console.log(message.topic);
								var queryItem = {
									recipient: message.user,
									topic: message.topic
								}
								query.push(queryItem);
								var topicParts = message.topic.split('.');
								while(topicParts.length>0){
									var queryItem = {
										recipient: message.user,
										topic: topicParts.join('.')+'.*'
									}
									query.push(queryItem);
									topicParts.pop();
								}
							}else{
								query.push({
									recipient: message.recipient
								});
							}
	
							thisNode.StorageManager.find(query, {}, thisNode.GroupSecurity_Settings.store, thisNode.GroupSecurity_Settings.permissionChannel, function(err, records){
								if(message.topic){
									var record = records?records[0]:false;
									if((typeof (originalArgs[originalArgs.length-1]))=='function'){
										var callback = originalArgs[originalArgs.length-1];
										callback(err, record);
									}	
								}else{
									if((typeof (originalArgs[originalArgs.length-1]))=='function'){
										var callback = originalArgs[originalArgs.length-1];
										callback(err, records);
									}
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
	
	module.exports = nodeMixinFunctions;
}
	