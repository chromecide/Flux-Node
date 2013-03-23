;!function(){
	var mixinFunctions = {
		init: function(cfg, callback){
			var thisNode = this;
			//add properties that are needed by this mixin
			thisNode.addSetting('BasicSecurity', {
				users:[
					{
						username: 'admin',
						password: 'admin'
					}
				]
			}, {
				object:{
					fields:{
						users:{
							name: 'Users',
							validators:{
								hasMany:{
									object: {
										fields:{
											username: {
												name: 'User Name',
												validators:{
													required:{},
													string:{}
												}
											},
											password: {
												name: 'Password',
												validators:{
													required:{},
													string:{}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			});
			//add Events that are emitted by this mixin
			
			//add listeners
			
			thisNode.on('BasicSecurity.DoLogin', function(message, rawMessage){
				var userList = thisNode.getSetting('BasicSecurity.users');
				
				for(var i=0;i<userList.length;i++){
					var userItem = userList[i];
					if(userItem.username==message.username && userItem.password == message.password){
						thisNode.emit('BasicSecurity.UserLoggedIn', {
							user: userItem,
							tunnel: rawMessage._message.sender
						});
						
						thisNode.doCallback('BasicSecurity.DoLogin', {
							success:true
						}, rawMessage);
						return;
					}
				}
				thisNode.doCallback('BasicSecurity.DoLogin', {
					success: false
				}, rawMessage);
				return;
			});
			
			thisNode.on('BasicSecurity.DoLogout', function(message, rawMessage){
				var userList = thisNode.getSetting('BasicSecurity.users');
				
				thisNode.emit('BasicSecurity.UserLoggedOut', {
					tunnel: rawMessage._message.sender
				});
				
				thisNode.doCallback('BasicSecurity.DoLogout', {
					success: true
				}, rawMessage);
				return;
			});
			
			//should be called when the mixin is actually ready, not simp;y at the end of the init function
			var mixinReturn = {
				name: 'myMixinName',
				config: cfg
			}
			
			if(callback){
				callback(mixinReturn);
			}
			
			thisNode.emit('Mixin.Ready', mixinReturn);
		},
		BasicSecurity_ValidateLogin: function(){
			var thisNode = this;
			
			return true;
		}
	}
	
	if (typeof define === 'function' && define.amd) {
		define(mixinFunctions);
	} else {
		module.exports = mixinFunctions;
	}
}();