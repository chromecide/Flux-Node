exports = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);
	
if (typeof define === 'function' && define.amd) {
	define(['FluxNode/util', 'EventEmitter2', 'StorageManager/Store'], function(util, EventEmitter2, Store) {
		var fnConstruct = StoreBuilder(util, EventEmitter2, Store);
		return fnConstruct;
	});		
} else {
	var util = require('util'), 
	EventEmitter2 = require('EventEmitter2').EventEmitter2,
	Store = require('../Store').Store,
	Mongo = require('mongodb');
	var fnConstruct = StoreBuilder(util, EventEmitter2, Store, Mongo);
	exports.Store = fnConstruct;
}

function StoreBuilder(util, EventEmitter2, Store, mongo){

	function MongoDBStore(cfg){
		var self = this;
		self._environment = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? 'nodejs' : 'browser');
		
		self.configureStore = configureStore;
		self.save = save;
		self.find = find;
		self.findOne = findOne;
		self.remove = remove;
		
		
		self.saveRecord = saveRecord;
		
		if(cfg){
			self.configureStore(cfg);
		}
		
		var Server = mongo.Server;
		var Db = mongo.Db;
		
		self.server = new Server(self.host, self.port, self.mongo_options, {safe: true});
		var db = self.db = new Db(self.databaseName, self.server, {safe: true});
		
		try{
			self.db.open(function(err, db) {
				if(!err) {
					self.emit('Store.Ready', err, self);
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
		var didErr = true;
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
	
	function find(query, channel, callback){
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
									callback(err, [{
										err: err, 
										record: record
									}]);
								}
							}
						});	
					}else{
						console.log(err);
					}	
				});
				
				break;
			case 'object':
				queryByObject.call(self, query, channel, false, function(err, recs){
					
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
	
	function queryByObject(query, channel, maxRecs, callback){
		var self = this;
		console.log('QUERYING');
		console.log(query);
		console.log('-------------');
		var retArray = [];
		if(Array.isArray(query)){ //it's an OR style query
			console.log('OR QUERY ATTEMPT: NOT YET IMPLEMENTED');
		}else{
			if(query._map){//map reduce
				
			}else{ //find by attribute
				self.db.collection(channel, function(err, collection){
					var queryOpts = {};
					if(maxRecs && maxRecs>0){
						queryOpts.limit = maxRecs;
					}
					if(maxRecs && maxRecs==1){
						collection.findOne(query, {}, queryOpts, function(err, record){
							if(callback){
								callback(err, {err: err, record: record});
							}
						});	
					}else{
						collection.find(query, {}, queryOpts, function(err, cursor){
							cursor.toArray(function(err, arr){
								for(var idx in arr){
									arr[idx] = {
										err: false,
										record: arr[idx]
									}
								}
								if(callback){
									callback(err, arr);
								}
							});
						});	
					}
				});
			}
		}
		return retArray;
	}
	
	
	function findOne(query, channel, callback){
		console.log('FINDING ONE');
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
			console.log('searching........');
			console.log(query);
				returnRecords = queryByObject.call(self, query, channel, 1, function(err, recs){
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
	
	function remove(query){
		
		return false;
	}
	
	return MongoDBStore;
}