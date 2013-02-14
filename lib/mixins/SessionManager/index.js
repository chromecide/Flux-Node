var mixinFunctions = {
	Session_Settings:{
		session_database: false,
		session_channel: 'sessions'
	},
	init: function(cfg, callback){
		var thisNode = this;
		//add properties that are needed by this mixin
	
		//add Events that are emitted by this mixin
		if(!cfg){
			cfg = {};
		}
		
		if((typeof cfg)=='function'){
			callback = cfg;
			cfg = {};
		}
		
		if(cfg.databaseName){
			thisNode.Session_Settings.session_database = cfg.databaseName;
		}
		
		if(cfg.channelName){
			thisNode.Session_Settings.session_channel = cfg.channelName;
		}
		
		
		thisNode.on('Tunnel.Ready', function(destinationId, tunnel){
			thisNode.Session_Start(destinationId);
		});
		
		thisNode.on('Tunnel.Closed', function(destinationId, tunnel){
			console.log(arguments);
			thisNode.Session_End(destinationId);
		});
		
		//should be called when the mixin is actually ready, not simp;y at the end of the init function
		if(cfg.buildStructure){
			new thisNode.StorageManager.Model({
				name: 'session',
				fields:{
					id: {
						validators:{
							string:{}
						}
					},
					tunnel:{
						validators:{
							string:{}
						}
					},
					started: {
						validators:{
							date: {}
						}
					},
					lastAccessed: {
						validators:{
							date: {}
						}
					}
				}
			}, function(modelErr, sessionModel){
				new thisNode.StorageManager.Channel(
					{
						name: 'sessions',
						model: sessionModel.model
					}, 
					function(channErr, sessionChannel){
						thisNode.StorageManager.getStore(thisNode.Session_Settings.session_database, function(err, sessionStore){
							sessionStore.addChannel(sessionChannel);
							if(callback){
								callback(thisNode);
							}
							thisNode.emit('Mixin.Ready', {
								name: 'SessionManager'
							});	
						});
					}
				);
			});
		}else{
			if(callback){
				callback(thisNode);
			}
			
			thisNode.emit('Mixin.Ready', {
				name: 'SessionManager'
			});	
		}
	},
	Session_Start: function(destinationId, callback){
		var thisNode = this;
		thisNode.StorageManager.find({tunnel: destinationId}, {}, thisNode.Session_Settings.session_database, thisNode.Session_Settings.session_channel, function(err, recs){
			if(!err){
				if(recs.length>0){
					var error = {message: 'Session already started for tunnel: '+destinationId};
					if(callback){
						callback(error, recs[0].record);
					}
					thisNode.emit('SessionManager.Error', error);
					//cleanup
					error = null;
				}else{
					//starting a new session
					var now = new Date();
					var session = {
						tunnel: destinationId,
						started: now,
						lastAccessed: now
					}
					
					thisNode.StorageManager.save(session, thisNode.Session_Settings.session_database, thisNode.Session_Settings.session_channel, function(err, recs){
						if(!err){
							session = recs[0];
							if(callback){
								callback(false, session);
							}
							thisNode.emit('Session.Started', session);	
							//cleanup
							session = null;
							now = null;
						}
					});
				}
			}else{
				if(callback){
					callback(err, false);	
				}
				thisNode.emit('SessionManager.Error', {});
			}
		});
		
		return;
	},
	Session_End: function(destinationId, callback){
		console.log('ENDING SESSION');
		var thisNode = this;
		var session = null;
		
		thisNode.StorageManager.find({tunnel: destinationId}, {}, thisNode.Session_Settings.session_database, thisNode.Session_Settings.session_channel, function(err, recs){
			console.log('FOUND SESSION TO REMOVE');
			
			if(!err){
				if(recs.length>0){
					var session = recs[0].record;
					
					thisNode.StorageManager.remove(session, thisNode.Session_Settings.session_database, thisNode.Session_Settings.session_channel, function(err, recs){
						if(!err){
							session = recs[0];
							if(callback){
								callback(false, session);
							}
							thisNode.emit('Session.Ended', session);
							//cleanup
							session = null;
						}
					});
				}else{
					var error = {
						message: 'Session not Found'
					};
					if(callback){
						callback(error, false);	
					}
					thisNode.emit('SessionManager.Error', error);
				}
			}else{
				if(callback){
					callback(err, false);	
				}
				thisNode.emit('SessionManager.Error', {});
			}
		});
	},
	Session_Set: function(destinationId, key, value, callback){
		var thisNode = this;
		thisNode.StorageManager.find({tunnel: destinationId}, {}, thisNode.Session_Settings.session_database, thisNode.Session_Settings.session_channel, function(err, recs){
			if(!err){
				if(recs.length>0){
					var record = recs[0].record;
					console.log(record);
					//record[key] = value;
					//thisNode.setDataValueByString(record, key, value);
					//thisNode.setDataValueByString(record, 'lastAccessed', (new Date()).getTime());
					record.set('lastAccessed', new Date());
					thisNode.StorageManager.save(record, thisNode.Session_Settings.session_database, thisNode.Session_Settings.session_channel, function(er, recs){
						if(callback){
							callback(er, recs);
						}
					});
				}
			}else{
				
			}
		});
	},
	Session_Get: function(destinationId, key, callback){
		console.log('GETTING SESSION');
		var thisNode = this;
		thisNode.StorageManager.find({tunnel: destinationId}, {}, thisNode.Session_Settings.session_database, thisNode.Session_Settings.session_channel, function(err, recs){
			if(!err){
				if(recs.length>0){
					console.log(recs[0].record);
					var retVal = thisNode.getDataValueByString(recs[0].record, key);
					if(callback){
						callback(false, retVal);
					}
				}
			}else{
				
			}
		});
	},
	Session_Remove: function(){
		
	}
}

if (typeof define === 'function' && define.amd) {
	define(mixinFunctions);
} else {
	module.exports = mixinFunctions;
}
	