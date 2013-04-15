;!function(exports, undefined) {
	
	var channel = {
		name: 'mongodb',
		host: 'localhost',
		port: 27017,
		databaseName: 'Data',
		collectionName: 'Entities'
	};
	
	channel.init = function(callback){
		var self = this;
		//late load the required modules
		var mongo = self.mongo = require('mongodb');
		var Server = mongo.Server;
		var Db = mongo.Db;
		
		self.server = new Server(self.host, self.port, self.mongo_options, {safe: true});
		
		var db = self.db = new Db(self.databaseName, self.server, {safe: true});
		//try and open the db
		
		self.db.open(function(err, db){
			if(err){
				console.log(err);
			}else{
				self.db.collection(self.collectionName, function(err, coll){
					self.collection = coll;
					self.db.createCollection('_changes_'+self.collectionName, {capped:true, size:100000},function(err, changeColl){
						
						self.changes_collection = changeColl;
						//add a seed record, because the latest code doesn't like when there is no doc._id tom go from
						self.changes_collection.save({
							time_stamp: new Date(),
							action: 'started'
						}, function(){
							
							var latest = self.changes_collection.find({}).sort({ $natural: -1 }).limit(1);
	 
							latest.nextObject(function(err, doc) {
								if (err) throw err;
							 	var query = {};
							 	
							 	if(doc){
							 		query._id = { $gt: doc._id };	
							 	}
								
								var options = { tailable: true, awaitdata: true, numberOfRetries: -1 };
								
								self.changes_cursor = self.changes_collection.find(query, options).sort({ $natural: 1 });
							 
								(function next() {
									self.changes_cursor.nextObject(function(err, message) {
										if (err) throw err;
										self.findOne({'_id': message.document_id}, function(err, entity){
											self.emit(message.action, entity);	
										});
										next();
									});
								})();
							});
							
							if(callback){
								callback(self);
							}
						
						});
					});
				});
			}
		});
		
	}
	
	channel.publish = function(entity, callback){
		var self = this;
		
		if((entity instanceof self.Entity)==false){
			entity = new self.Entity(self.Models.Command, entity);
		}
		
		if(entity.getType() && entity.getType().name!='Command'){
			// a normal entity was supplied
			// if it's one of our allowed types, create a "save" command entity from it
			var oldEntity = entity;
			entity = new self.Entity(self.Models.Command, {
				action: 'save'
			});
			
			entity.set('entity', oldEntity);
		}
		console.log(entity.get('action'));
		switch(entity.get('action')){
			case 'save':
				saveEntity.call(self, entity.get('entity'), function(err, entity){
					if(callback){
						callback(err, entity);
					}
				});
				break;
			case 'remove':
			
				break;
			default:
				throw new Error('Command "'+entity.get('action')+'" not supported');
				break;
		}
	}
	
	function saveEntity(entity, callback){
		var self = this;
		
		var update = false;
		
		if(entity.get('_id')){
			update = true;
		}
		var saveData = entity.toObject();
		
		if(self.model){
			console.log('saving 1');
			if(self.model.validate(entity)){
				self.collection.save(saveData, function(){
					entity.set('id',saveData._id.toString());
					
					self.changes_collection.save({
						time_stamp: new Date(),
						document_id: saveData._id,
						action: update?'update':'insert'
					}, function(){
						if(callback){
							callback(false, entity);
						}	
					});
				});
			}else{
				console.log('NOT VALID');
				callback(new Error('INVALID ENTITY FOR THIS CHANNEL', entity), entity);
			}
		}else{
			console.log('saving 2');
			self.collection.save(saveData, function(){
				entity.set('id',saveData._id.toString());
				
				self.changes_collection.save({
					time_stamp: new Date(),
					document_id: saveData._id,
					action: update?'update':'insert'
				}, function(){
					callback(false, entity);
				});
			});
		}
	}
	
	channel.subscribe = function(eventNames, query, fn, scope, callback){
		var self = this;
		
		if((typeof eventNames)=='object'){
			callback = eventNames.cb;
			scope: eventNames.scope?eventNames.scope:self;
			fn: eventNames.fn;
			query: eventNames.query;
			eventNames:eventNames.eventNames;
		}
		
		if(!Array.isArray(eventNames)){
			eventNames = [eventNames];
		}
		
		function delegate(qry, fnc, fncScope){
			return function(){
				//if the input entity matches the query
				console.log('TODO: VALIDATE QUERY - mogodb subscribe');
				fnc.apply(fncScope, arguments);
			}	
		}
		
		for(var i=0;i<eventNames.length;i++){
			self.on(eventNames[i], delegate(query, fn, scope));
		}
		
		if(callback){
			callback();
		}
	}
	
	channel.save = function(entity, callback){
		var self = this;
		
		var saveData = entity.toObject();
		
		if(self.model){
			if(self.model.validate(entity)){
				self.collection.save(saveData, function(){
					entity.set('id',saveData._id.toString());
					callback(false, entity);
				});		
			}else{
				callback(new Error('INVALID ENTITY FOR THIS CHANNEL', entity), entity);
			}
		}else{
			self.collection.save(saveData, function(err){
				if(err){
					throw(err);
				}
				entity.set('id',saveData._id.toString());
				if(callback){
					callback(false, entity);	
				}
				
			});	
		}
	}
	
	channel.find = function(query, fields, callback){
		var self = this;
		
		if((typeof query)=='function'){
			callback = query;
			query = {};
			fields = {};
		}
		
		if((typeof fields)=='function'){
			callback = fields;
			fields = {};
		}
		
		self.collection.find(query, fields).toArray(function(err, items){
			if(err){
				if(callback){
					callback(err, items);
				}
			}else{
				if(self.model){
					for(var i=0;i<items.length;i++){
						items[i] = self.instance(items[i]);
					}
					
					if(callback){
						callback(err, items);
					}
				}else{
					if(callback){
						callback(err, items);
					}
				}
			}
		});
	}
	
	channel.findOne = function(query, fields, callback){
		var self = this;
		if((typeof query)=='function'){
			callback = query;
			query = {};
			fields = {};
		}
		
		if((typeof fields)=='function'){
			callback = fields;
			fields = {};
		}
		
		self.collection.findOne(query, fields, function(err, item){
			if(err){
				if(callback){
					callback(err, item);
				}
			}else{
				if(self.model){
					if(item){
						item = self.instance(item);
					}
					if(callback){
						callback(err, item);
					}
				}else{
					if(callback){
						callback(err, item);
					}
				}
			}
		});
	}
	
	if (typeof define === 'function' && define.amd) {
		define(function() {
			return channel;
		});
	} else {
		exports.Channel = channel;
	}

}(typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);