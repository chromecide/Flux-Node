exports = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);
	
if (typeof define === 'function' && define.amd) {
	define(['util', 'EventEmitter2', 'StorageManager/Store', 'StorageManager/Collection', 'StorageManager/Channel', 'StorageManager/Record', 'StorageManager/Model','Stores/Memory'], function(util, EventEmitter2, Store, Collection, ChannelCtr, Record, Model, MemStore) {
		return StorageManagerBuilder(util, EventEmitter2, Store, ChannelCtr, Collection, Record, Model, MemStore);
	});		
} else {
	var util = require('util'), 
	EventEmitter2 = require('eventemitter2').EventEmitter2,
	Store = require(__dirname+'/Store.js').Store;
	Collection = require(__dirname+'/Collection.js').Collection;
	ChannelCtr = require(__dirname+'/Channel.js').Channel;
	Record = require(__dirname+'/Record.js').Record;
	Model = require(__dirname+'/Model.js').Model;
	var MemoryStore = require(__dirname+'/Stores/Memory.js').Collection;
	//svar fnConstruct = TunnelManager;
	exports.StorageManager = StorageManagerBuilder(util, EventEmitter2, Store, ChannelCtr, Collection, Record, Model, MemoryStore);
}

function StorageManagerBuilder(util, EventEmitter2, Store, Channel, Collection, Record, Model, MemStore){
	
	var StorageManager = function(cfg){
		
		var self = this;
		
		EventEmitter2.call(self, {
			delimiter: '.',
			wildcard: true
		});
		
		self._environment = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? 'nodejs' : 'browser');
		
		self._config = {
			
		};
		
		self.Store = Store;
		self.Collection = Collection;
		self.Channel = Channel;
		self.Record = Record;
		self.Model = Model
		self.stores = {};
		self.collections = [];
		
		if(!cfg){
			cfg = {};
		}
		self._config = cfg;
		
		if(cfg.debug===true){
			self.debug =true;
		}
		
		if(!cfg.stores || cfg.stores.length==0){
			/*cfg.stores = [{
				type: 'Memory',
				options:{
					channels:[
						'master'
					]
				},
				defaultChannel: 'master',
				isDefault: true
			}];*/
		}else{
			console.log('DEF SUPPLIED');
			//console.log(cfg.stores);
		}
		
		/*self.factory('Memory', function(MemStore){
			self.trashStore = new MemStore({
				type: 'Memory',
				options:{
					channels:[
						'master'
					]
				},
				defaultChannel: 'master'
			});	
		});*/
		/*
		if(cfg){
			self.configure(cfg);	
		}*/
		
	}
	
		util.inherits(StorageManager, EventEmitter2);
	
	StorageManager.prototype.configure = function(cfg, callback){
		var self = this;
		var err = false;
		
		for(var key in cfg){
			switch(key){
				case 'stores':
				case 'Stores':
					var stores = cfg.stores;
					var numStores = stores.length;
					var finishedStores = 0;		
					
					function storeCreateLoop(){
						
						if(stores.length==0){
							if(callback){
								callback.call(self, false, cfg);
							}
							
							self.emit('StorageManager.Ready', false, self);
							return;
						}
						
						var storeCfg = stores.shift();
						
						self.createStore(storeCfg, function(createErr, store){
							console.log(storeCfg);
							if(!createErr){
								if(storeCfg.isDefault===true){ //the first store to be added will be the default store, unless a later one has isDefault===true
									self.defaultStore = store;
								}
							}
							storeCreateLoop();
						});
					}
					
					storeCreateLoop();
					
					break;
			}
		}
		
		if(callback){
			callback.call(self, err, self._config);
		}
		self.emit('StorageManager.Ready', err, self);
	}
	
	StorageManager.prototype.factory = function(type, callback){
		if(!type){
			return;
		}
		var self = this;
		
		if(self._environment=='nodejs'){
			var storeDef = require('./Stores/'+type).Store;
			if(callback){
				callback(storeDef);
			}
			return storeDef;
		}else{
			require(['Stores/'+type], function(def){
				if(callback){
					callback(def);	
				}
			});
		}
	}
	
	StorageManager.prototype.getDefaultStore = function(){
		console.log(this.defaultStore);
		return this.defaultStore;
	}
	
	StorageManager.prototype.save = function(records, store, channel, callback){
		
		var self = this;
		
		if((typeof store=='function')){//the callback was passed as the second argument
			callback = store;
			store = self.getDefaultStore();
			channel = false;
		}else{
			if((typeof store)=='string' || !store){
				store = self.getStore(store);
			}
		}
		
		if((typeof channel=='function')){
			//the callback was passed as the third argument
			callback = channel;
			channel = false;
		}
		
		store.save(records, channel, function(err, records){
			if(callback){
				callback(err, records);
			}
		});
	}
	
	/*
	 * Usage:
	 * 
	 * Update a single attribute for an object instance
	 * StorageManager.setRecordValue(myObject, 'MyAttribute','New Value', cbFunction);
	 * StorageManager.setRecordValue(myObject, {'MyAttribute': 'New Value'}, cbFunction);
	 * 
	 * * Update a single attribute for multiple object instances
	 * StorageManager.setRecordValue([myObject1, myObject2], 'MyAttribute','New Value', cbFunction);
	 * 
	 * * Update multiple attributes for an object instance
	 * StorageManager.setRecordValue(myObject, ['MyAttribute1', 'MyAttribute2'], ['New MyAttribute1Value', 'New MyAttribute2Value'], cbFunction);
	 * StorageManager.setRecordValue(myObject, {MyAttribute1: 'New MyAttribute1Value', MyAttribute2: 'New MyAttribute2 Value'}, cbFunction);
	 * 
	 * * Update multiple attributea for multiple object instances
	 * StorageManager.setRecordValue([myObject1, myObject2], ['MyAttribute1', 'MyAttribute2'], ['New MyAttribute1Value', 'New MyAttribute2Value'], cbFunction);
	 * StorageManager.setRecordValue([myObject1, myObject2], {MyAttribute1: 'New MyAttribute1Value', MyAttribute2: 'New MyAttribute2 Value'}, cbFunction);
	 * 
	 */
	StorageManager.prototype.setRecordValue = function(records, keys, values, stores, channels, callback){
		var self = this;
		if((typeof values=='function')){
			callback = values;
			values = null;
			stores = false;
			channels = false;
		}
		
		if((typeof stores=='function')){
			callback = stores;
			stores = false;
			channels = false;
		}
		
		if((typeof channels=='function')){
			callback = channels;
			channels = false;
		}
		
		
		if(!Array.isArray(records)){
			records = [records];
		}
		
		//if no store was supplied, we assume the user intended to use this as a convenience function
		//otherwise, we can assume that "records" is a query object
		if(!stores){
			if((typeof keys)=='object'){
				
			}else{
				var recordList = [];
				for(var i=0;i<records.length;i++){
					recordList[i]=records[i];
				}
				
				function recordLoop(){
					if(recordList.length==0){
						if(callback){
							callback(false, records);
						}
						return;
					}
					var keyList = [];
					if(!Array.isArray(keys)){
						keys = [keys];
					}
					
					if(!Array.isArray(values)){
						values = [values];
					}
					
					var record = recordList.shift();
					
					for(var i=0;i<keys.length;i++){
						var key = keys[i];
						if(key.indexOf('.')>0){
							var keyParts = key.split('.');
							var attribute = keyParts.shift(); 
							var subRecord = record[attribute];
							if(!subRecord){
								subRecord = {};
							}
							var subAttribute = keyParts.join('.');
							
							self.setRecordValue(subRecord, subattribute, values[i], function(err, records){
								record[subAttribute] =  records[0];
							});
						}else{
							record[key] = values[i];
						}
					}
				}
				
				recordLoop();
			}
		}else{
		}
	}
	
	
	StorageManager.prototype.find = function(query, fields, stores, channels, callback){
		
		var self = this;
		var err = false;
		var recs = [];
		if(typeof stores=='function'){ //callback supplied as the second arg
			callback = stores;
			stores = false;	
		}
		
		if(typeof channels=='function'){ //callback supplied as the second arg
			callback = channels;
			channels = false;	
		}
		
		if(!stores){
			stores = [];
			for(var strIdx in self.stores){
				stores.push(self.stores[strIdx]);
			}
		}else{
			if(!Array.isArray(stores) || !stores){
				var rStore = self.getStore(stores);
				stores = [rStore]; 
			}
		}
		
		if(!channels){
			channels = [];
			for(var i=0;i<stores.length;i++){
				channels[i] = false;
			}
		}else{
			if(typeof channels=='string'){
				var chanName = channels;
				channels = [];
				for(var i=0;i<stores.length;i++){
					channels[i] = chanName;
				}
			}else{
				if(Array.isArray(channels)){
					if(typeof channels[0]=='string'){ //it's an array of strings, so all channels will be called for all stores
						var chanArray = channels;
						for(var i=0;i<stores.length;i++){
							channels[i] = chanArray;
						}
					}else{
						//leave as is, cause it's an array of arrays
					}
				}else{
					//we don't support anything else	
				}
			}
		}
		
		var curStoreIdx = 0;
		function searchNextStore(){	
			
			if(stores.length==0){

				if(callback){
					callback(err, recs);
				}
				return;
			}

			var store = stores.shift();
			
			var storeChannels = channels[curStoreIdx];
			
			if(store){
				if(!storeChannels){
					storeChannels = storeChannels = [store.defaultChannel];
				}
				
				store.find(query, fields, storeChannels, function(err, records){
					recs = records;
					if(!err){
						if(recs.length==0){//keep looking
							searchNextStore();
						}else{
							if(callback){
								callback(err, recs);
							}
						}
					}else{
						console.log(err);
					}
				});
			}else{
				if(callback){
					callback()
				}
			}
			
			curStoreIdx++;
		}
		
		searchNextStore();
	}
	
	StorageManager.prototype.findOne = function(query, fields, stores, channels, callback){
		var self = this;
		var err = false;
		var recs = [];
		
		
		if(typeof fields =='function'){ //callback supplied as the second arg
			callback = fields;
			fields = {};
			stores=[];
			channels=false;
			for(var strIdx in self.stores){
				stores.push(self.stores[strIdx]);
			}
		}
		
		if(typeof stores =='function'){ //callback supplied as the second arg
			callback = stores;
			stores = [];
			channels = false;
			for(var strIdx in self.stores){
				stores.push(self.stores[strIdx]);
			}
		}
		
		if((typeof channels) =='function'){ //callback supplied as the third arg
			callback = channels;
			channels = false;
		}
		
		if(!stores){
			stores = [];
			for(var strIdx in self.stores){
				stores.push(self.stores[strIdx]);
			}
		}else{
			if(!Array.isArray(stores)){
				var rStore = self.getStore(stores);
				stores = [rStore];
			}
		}
		
		if(!channels){
			channels = [];
			for(var i=0;i<stores.length;i++){
				channels[i] = false;
			}
		}else{
			if(typeof channels=='string'){
				var chanName = channels;
				channels = [];
				for(var i=0;i<stores.length;i++){
					channels[i] = chanName;
				}
			}else{
				if(Array.isArray(channels)){
					if(typeof channels[0]=='string'){ //it's an array of strings, so all channels will be called for all stores
						var chanArray = channels;
						for(var i=0;i<stores.length;i++){
							channels[i] = chanArray;
						}
					}else{
						//leave as is, cause it's an array of arrays
					}
				}else{
					//we don't support anything else	
				}
			}
		}
		
		var curStoreIdx = 0;
		
		function searchNextStore(){
			if(stores.length==0){
				
				if(callback){
					callback(err, recs);
				}
				return;
			}
			var store = stores.shift();

			if(store){
				store.findOne(query, fields, channels[curStoreIdx], function(err, records){
					recs = records;
					if(!err){
						if(recs.length==0){//keep looking
							searchNextStore();
						}else{
							if(callback){
								callback(err, recs);
							}
						}
					}
					curStoreIdx++;
				});	
			}else{
				callback(false, false);
			}	
		}
		
		searchNextStore();
	}
	
	StorageManager.prototype.remove = function(query, stores, channels, callback){
		
		var self = this;
		var err = false;
		var recs = [];
		
		if(!stores){
			stores = [];
			for(var strIdx in self.stores){
				stores.push(self.stores[strIdx]);
			}
		}else{
			if(!Array.isArray(stores)){
				var store = self.getStore(stores);
				console.log(store);
				stores = [store]; 
			}
		}
		
		function removeFromNextStore(){
			if(stores.length==0){
				if(callback){
					callback(err, recs);
				}
				return;
			}
			
			var store = stores.shift();
			
			store.remove(query, channels, function(err, records){
				recs = records;
				if(!err){
					removeFromNextStore();
				}
			});
		}
		
		removeFromNextStore();
	}
	
	StorageManager.prototype.createStore = function(cfg, callback){
		var self = this;
		//try{
			
			if(cfg.type){
				self.factory(cfg.type, function(storeDef){
					
					new storeDef(cfg.options, function(err, newStore){
						if(newStore.status=='ready'){
							if(!cfg.id){
								cfg.id = generateID();
							}
							 
							if(cfg.id){
								newStore.id = cfg.id;
								self.registerStore(cfg.id, newStore, callback);
							}else{
								if(callback && (typeof callback)=='function'){
									callback(false, newStore);
								}
							}
							
							self.emit('StorageManager.StoreReady', false, newStore);
							
						}else{
							newStore.once('Store.Ready', function(err, store){
								
								if(!cfg.id){
									cfg.id = generateID();
								}
								 
								if(cfg.id){
									newStore.id = cfg.id;
									self.registerStore(cfg.id, newStore, callback);
								}else{
									if(callback && (typeof callback)=='function'){
										callback(false, newStore);
									}
								}
								self.emit('StorageManager.StoreReady', err, store);
							});	
						}
					});
				});	
			}else{
				if(callback){
					callback(true, {
						message: 'No type supplied'
					});
				}
			}
				
		/*}catch(e){
			console.log(e);
			self.emit('error', e);
			if(callback && (typeof callback)=='function'){
				callback(e, false);
			}
		}*/
		
		
		return true;	
	}
	
	StorageManager.prototype.registerStore = function(id, store, callback){
		var self = this;
		self.stores[id] = store;
		
		store.on('Store.RecordSaved', function(err, records){
			self.emit('StorageManager.RecordSaved', err, records);
		});
		
		self.emit('StorageManager.StoreRegistered', store);
		
		if(callback){
			callback(false, store);	
		}
	}
	
	StorageManager.prototype.getStore = function(cfg, callback){
		var self = this;
		
		if(!cfg){//return the default store
			return self.getDefaultStore();
		}
		
		if((typeof cfg)=='string'){
			if(self.stores[cfg]){
				if(callback){
					callback(false, self.stores[cfg]);
				}
				return self.stores[cfg];	
			}else{
				cfg = {
					name: cfg
				};
				for(var storeId in self.stores){
					var str = self.stores[storeId];
					if(str.validateRecord(str, cfg)){
						if(callback){
							callback(false, self.stores[storeId]);
						}
						return self.stores[storeId];
					}
				}
			}
		}else{
			if(cfg.id){
				if(callback){
					callback(false, self.stores[cfg.id]);
				}
				return self.stores[cfg.id];
			}
		}
		return false;
	}

	StorageManager.prototype.getStores = function(callback){
		var self = this;
		if(callback){
			callback(false, self.stores);
		}
		return self.stores;	
	}

	StorageManager.prototype.createCollection = function(cfg, callback){
		var self = this;
		
		var collections = self.collections;
		
		if(!cfg){
			return false;
		}
		
		if(!cfg.stores || cfg.stores.length==0){
			var storeList = [];
			for(var strIdx in self.stores){
				storeList.push(self.stores[strIdx]);
			}
			cfg.stores = storeList;
		}
		
		var newCollection = new Collection(cfg);
		self.collections.push(newCollection);
		
		if(callback){
			callback(false, newCollection);
		}
		return newCollection;
	}
	
	
	return StorageManager;
}


function generateID(){
	var newID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
	    return v.toString(16);
	});
	return newID;
}