exports = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);
	
if (typeof define === 'function' && define.amd) {
	define(['FluxNode/util', 'EventEmitter2', 'StorageManager/Store'], function(util, EventEmitter2, Store) {
		var fnConstruct = StoreBuilder(util, EventEmitter2, Store);
		return fnConstruct;
	});		
} else {
	var util = require('util'), 
	EventEmitter2 = require('EventEmitter2').EventEmitter2,
	StoreCtr = require('../Store').Store,
	channelCtr = require('../Channel.js').Channel,
	modelCtr = require('../Model.js').Model,
	recordCtr = require('../Record.js').Record,
	Mongo = require('mongodb')
	;
	
	var fnConstruct = StoreBuilder(util, EventEmitter2, StoreCtr, channelCtr, modelCtr, recordCtr, Mongo);
	
	exports.Store = fnConstruct;
}

function StoreBuilder(util, EventEmitter2, Store, Channel, Model, Record, mongo){

	function MongoDBStore(cfg, callback){
		var self = this;
		self._environment = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? 'nodejs' : 'browser');
		
		self.configureStore = configureStore;
		self.getChannel = getChannel;
		self.addChannel = addChannel;
		self.removeChannel = removeChannel;
		
		self.save = save;
		self.find = find;
		self.findOne = findOne;
		self.remove = remove;
		
		
		self.saveRecord = saveRecord;
		
		if(cfg){
			self.configureStore(cfg);
			if(cfg.channels){
				self.once('Store.Ready', function(){
					for(var channelName in cfg.channels){
						channelCfg = cfg.channels[channelName];
						console.log(channelCfg);
						self.addChannel(channelCfg);
					}
				});
			}
		}
		
		
		var Server = mongo.Server;
		var Db = mongo.Db;
		
		self.server = new Server(self.host, self.port, self.mongo_options, {safe: true});
		
		var db = self.db = new Db(self.databaseName, self.server, {safe: true});
		
		try{
			self.db.open(function(err, db) {
				
				if(!err) {
					//make sure the database has the required built-in tables
					db.collection('_models', function(err, coll){
						coll.find({name:'_model'}).toArray(function(err, items){
							if(items.length==0){
								coll.insert({name: '_model'}, {w:1}, function(err, savedItems){
									self.status = 'ready';
									self.emit('Store.Ready', err, self);
									if(callback){
										callback(cfg, self);
									}	
								});
							}else{
								self.status = 'ready';
								self.emit('Store.Ready', err, self);
								if(callback){
									callback(cfg, self);
								}		
							}
						});
					});
				}else{
					console.log(err);
				}
			});	
		}catch(e){
			console.log(e);
		}
	}
	
		util.inherits(MongoDBStore, Store);
	
	function configureStore(cfg){
		var self = this;
		
		if(cfg.defaultChannel){
			self.defaultChannel = cfg.defaultChannel;
		}else{
			self.defaultChannel = 'master';
		}
		
		if(cfg.databaseName){
			self.databaseName = cfg.databaseName;
		}else{
			self.databaseName = 'fluxsingularity';
		}
		
		if(cfg.host){
			self.host = cfg.host;
		}else{
			self.host = 'localhost';
		}
		
		if(cfg.port){
			self.port = cfg.port;
		}else{
			self.port = 27017;
		}
		
	}
	
	function getChannel(name, callback){
		var db = this.db;
		var self = this;
		
		var collection = db.collection(name);
		
		db.collection('_models').find({channel: name}).toArray(function(err, items){
			var chanCfg = {
				name: collection.collectionName,
				store: self
			};
			 
			if(items.length>0){
				
				chanCfg.model = new Model(items[0]);	
			}
			
			var chan = new Channel(chanCfg);
			if(callback){
				callback(false, chan);
			}
		});
		
	}
	
	function addChannel(name, callback){
		var self = this;
		var db = self.db;
		var channelObj = name;
		if((name instanceof Channel)==false){
			if((typeof name)=='string'){
				name = {
					name: name
				}
			}
			channelObj = new Channel(name);
		}
		
		db.createCollection(channelObj.name, function(err, chan){
			var model = channelObj.getModel(); 
			if(model){
				db.collection('_models').find({
					name: model.name,
					channel: channelObj.name
				}).toArray(function(err, modelDefs){
					if(modelDefs.length==0){
						db.collection('_models').insert({
							name: model.name,
							channel: channelObj.name,
							fields: model.getFields()
						}, function(err, recs){
							if(callback){
								callback(err, channelObj);
							}
						});
					}else{
						if(callback){
							callback(err, channelObj);
						}
					}
				});
			}else{
				if(callback){
					callback(err, channelObj);
				}	
			}
			
		});
	}
	
	function removeChannel(){
		
	}
	
	function save(records, channels, callback){
		var self = this;
		if(!Array.isArray(records)){
			records = [records];
		}
		
		if(!channels){
			channels = [
				self.defaultChannel
			];
		}else{
			
			if((typeof channels)!='function'){
				if(!Array.isArray(channels)){
					channels = [channels];
				}	
			}else{
				callback = channels;
				channels = [
					self.defaultChannel
				];
			}
		}
		var didErr = false;
		var savedRecs = [];
		function processRecord(){
			
			if(records.length==0){
				if(callback){
					callback(didErr, savedRecs);
				}
			}
			
			var record = records.shift();
			if(record){
				self.saveRecord(record, channels, function(err, record){
					if(err){
						didErr = true;
					}else{
						savedRecs.push({
							err: err,
							record: record
						});
					}
					processRecord();
				});	
			}
			
		}
		
		processRecord();
	}
	
	function saveRecord(record, channels, callback){
		
		var self = this;
		
		var db = self.db;
		
		if(!channels){
			channels = [
				self.defaultChannel
			];
		}else{
			if((typeof channels)!='function'){
				if(!Array.isArray(channels)){
					channels = [channels];
				}	
			}
			
		}
		
		if(!record.id){
			record.id = self.generateID();
		}
		
		//TODO: if we're saving to more than one channel, then we need to save to the first channel, then save an object reference to the other channels
		for(var chanIdx in channels){
			var channelName = channels[chanIdx];
			
			db.collection(channelName, function(err, collection){	
				try{
					
					collection.findOne({id: record.id}, function(err, item) {
						if(!err){
							if(item){
								// need to update
								// we assume that the keys supplied for the object (except for id), are supplied because thye need to be updated
								collection.update({id: record.id}, {$set: record}, {safe: true}, function(err, result){
									if(callback){
										callback(err, record);
									}
									self.emit('Store.RecordSaved', err, record);
								});
							}else{
								collection.insert(record, {safe: true}, function(err, result) {
									if(callback){
										callback(err, record);
									}
									self.emit('Store.RecordSaved', err, record);
								});
							}
						}else{
							console.log(err);
						}
					});	
				}catch(e){
					console.log(e);
					self.emit('Store.Error', e);
				}
				
			});
		}
		
		return false;
	}
	
	function find(query, fields, channels, callback){
		
		var self = this;
		var err = false;
		var queryType = typeof query;
		var returnRecords = [];
		
		if(typeof fields =='function'){
			callback = fields;
			fields = {};
			channel = false;
		}

		if(!channels){
			channels = [self.defaultChannel];	
		}else{
			if((typeof channels)=='function'){
				callback = channels;
				channels= [self.defaultChannel];
			}else{
				if(!Array.isArray(channels)){
					channels = [channels];
				}
			}
		}
		
		switch(queryType){
			case 'string': //assume it's an id
				var returnRecord = false;
				function channelSearchLoop(){
					if(channels.length==0 || returnRecord!==false){
						if(callback){
							callback(err, [{
								err: err, 
								record: returnRecord
							}]);
						}
					}
					
					var channel = channels.shift();
					
					self.db.collection(channel, function(err, collection){
						if(!err){
							collection.findOne({id: query}, function(err, record){
								if(err){
									console.log(err);
								}else{
									if(record){
										returnRecord = record;
									}else{
										channelSearchLoop();
									}
								}
							});	
						}else{
							console.log(err);
							channelSearchLoop();
						}	
					});	
				}
				
				channelSearchLoop();	
				break;
			case 'object':
				var returnRecords = [];
				var didErr = false;
				
				function objectSearchLoop(){
					
					if(channels.length==0){
						if(callback){
							callback(err, returnRecords);
						}
						return;
					}
					
					var channel = channels.shift();

					queryByObject.call(self, query, fields, channel, false, function(err, recs){
						if(err){
							didErr = true;
						}else{
							for(var i=0;i<recs.length;i++){
								
								returnRecords.push(recs[i]);
							}
						}
						objectSearchLoop();
					});
				} 
				objectSearchLoop();
				break;
			case 'function': //this has the potential to be a very processor intensive task, as it has to load all objects in a collection
				self.db.collection(channel, function(err, collection){
					collection.find({}, function(err, cursor){
						var retObjects = [];
						
						cursor.toArray(function(err, arr){
							for(var arrIdx in arr){
								if(query(arr[arrIdx])===true){
									retObjects.push({
										err: false,
										record: arr[arrIdx]});
								}
							}
							if(callback){
								callback(err, retObjects);
							}		
						})
						
					});
				});
				break;
		}
		
		return false;
	}
	
	function queryByObject(query, fields, channel, maxRecs, callback){
		var self = this;
		var retArray = [];
		if(Array.isArray(query)){ //it's an OR style query
			console.log('OR QUERY ATTEMPT: NOT YET IMPLEMENTED');
		}else{
			if(query._map){//map reduce
				
			}else{ //find by attribute
				var channelName = channel
				if(channel instanceof Channel){
					channelName = channel.name;	
				}else{
					channel = false;
				}
				self.db.collection(channelName, function(err, collection){
					var mQuery = objectToQuery(query);
					
					var queryOpts = {};
					if(maxRecs && maxRecs>0){
						queryOpts.limit = maxRecs;
					}
					
					collection.find(mQuery, {}, queryOpts, function(err, cursor){
						var retArr = [];
						if(cursor){
							cursor.toArray(function(err, arr){
								
								if(!channel){
									self.getChannel(channelName, function(err, chan){
										for(var idx in arr){
											var newRec = new Record({
												data: arr[idx],
												channel: chan
											});
											retArr[idx] = {
												err: false,
												record: newRec
											}
										}
										
										if(callback){
											callback(err, retArr);
										}
									});
								}else{
									for(var idx in arr){
										var newRec = new Record({
											data: arr[idx],
											channel: channel
										});
										retArr[idx] = {
											err: false,
											record: newRec
										}
									}
									
									if(callback){
										callback(err, retArr);
									}	
								}
							});	
						}else{
							if(callback){
								callback(err, retArr);
							}
						}
					});
				});
			}
		}
		return retArray;
	}
	
	function objectToQuery(object, callback){
		var returnQuery = {};
		
		if(Array.isArray(object)){//OR query
			console.log('OR QUERY');
		}else{
			if(object instanceof Record){
				object = object._data;
			}
			
			for(var key in object){
				returnQuery[key] = {};
				var fieldProcessed = false;
				
				var criteria = object[key];
				
				if(!Array.isArray(criteria)){
					criteria = [criteria];
				}
				
				for(var critIdx in criteria){
					var objectVal = criteria[critIdx];
					//console.log(objectVal);
					if(objectVal.eq){
						objectVal = objectVal.eq; 
						returnQuery[key] = objectVal;
						fieldProcessed = true;
					}
					if(objectVal.neq){
						objectVal = objectVal.neq;
						
						var keyItem = returnQuery[key]; 
						keyItem['$ne'] = objectVal;
						fieldProcessed = true;
					}
					if(objectVal.lt){
						objectVal = objectVal.lt;
						var keyItem = returnQuery[key]; 
						keyItem['$lt'] = objectVal;
						fieldProcessed = true;
					}
					
					if(objectVal.gt){
						objectVal = objectVal.gt;
						var keyItem = returnQuery[key]; 
						keyItem['$gt'] = objectVal;
						fieldProcessed = true;
					}
					
					if(objectVal.lte){
						objectVal = objectVal.lte;
						
						var keyItem = returnQuery[key]; 
						keyItem['$lte'] = objectVal;
						fieldProcessed = true;
					}
					
					if(objectVal.gte){
						objectVal = objectVal.gte
						
						var keyItem = returnQuery[key]; 
						keyItem['$gte'] = objectVal;
						fieldProcessed = true;
					}
					
					if(objectVal.ct){
						var ignoreCase = objectVal.ignoreCase?objectVal.ignoreCase:true;
						objectVal = objectVal.ct;
						
						var keyItem = returnQuery[key]; 
						keyItem['$regex'] = new RegExp(objectVal, ignoreCase==true?"i":"");
						fieldProcessed = true;
					}
					
					if(objectVal.dct){
						var ignoreCase = objectVal.ignoreCase?objectVal.ignoreCase:true;
						objectVal = objectVal.dct;
						
						var keyItem = returnQuery[key]; 
						keyItem['$regex'] = new RegExp(objectVal, ignoreCase==true?"i":"");
						fieldProcessed = true;
					}
					
					if(objectVal.ae){
						objectVal = objectVal.ae;
						
						var keyItem = returnQuery[key]; 
						keyItem['$exists'] = objectVal; 
						fieldProcessed = true;
					}
					
					if(!fieldProcessed){ 
						returnQuery[key] = objectVal;
						fieldProcessed = true;
					}	
				}
				
			}
		}
		
		return returnQuery;
	}
	
	
	function findOne(query, fields, channel, callback){
		var self = this;
		var err = false;
		var queryType = typeof query;
		var returnRecords = [];
		
		if(!channel){
			channel = self.defaultChannel;
		}else{
			if((typeof channel)=='function'){
				callback = channel;
				channel = self.defaultChannel;
			}
		}

		switch(queryType){
			case 'string': //assume it's an id
				self.db.collection(channel, function(err, collection){
					if(!err){
						collection.findOne({id: query}, function(err, record){
							if(err){
								console.log(err);	
							}else{	
								if(callback){
									callback(err, record);
								}
							}
						});	
					}else{
						console.log(err);
					}	
				});
				
				break;
			case 'object':
				queryByObject.call(self, query, fields, channel, false, function(err, recs){
					
					if(callback){
						callback(err, recs);
					}
				});
				break;
			case 'function': //this has the potential to be a very processor intensive task, as it has to load all objects in a collection
				self.db.collection(channel, function(err, collection){
					collection.find({}, function(err, cursor){
						var retObjects = [];
						
						cursor.toArray(function(err, arr){
							for(var arrIdx in arr){
								if(query(arr[arrIdx])===true){
									retObjects.push(arr[arrIdx]);
								}
								if(retObjects.length==maxRecs){
									break;
								}
							}
							if(callback){
								callback(err, retObjects);
							}		
						});
					});
				});
				break;
		}
		
		return false;
	}
	
	function remove(query, channel, callback){
		console.log('removing record');
		
		var db = this.db;
		queryType = (typeof query);
		var oQuery = false;
		switch(queryType){
			case 'string':
				oQuery = {
					id: query
				};
				break;
			case 'object':
				oQuery = objectToQuery(query);	
				break;
		}
		
		
		if((typeof channel)=='string'){
		}else{
			channel = channel.name;
		}
		
		db.collection(channel).remove(oQuery, {w:1}, function(err, result) {
			if(callback){
				callback(err, result);
			}
		});
		return false;
	}
	
	return MongoDBStore;
}