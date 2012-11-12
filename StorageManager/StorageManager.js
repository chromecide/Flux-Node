exports = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);
	
if (typeof define === 'function' && define.amd) {
	define(['util', 'EventEmitter2', 'StorageManager/Store', 'StorageManager/Collection', 'Stores/Memory'], function(util, EventEmitter2, Store, Collection, MemStore) {
		return StorageManagerBuilder(util, EventEmitter2, Store, Collection, MemStore);
	});		
} else {
	var util = require('util'), 
	EventEmitter2 = require('eventemitter2').EventEmitter2,
	Store = require('./Store.js').Tunnel;
	Collection = require('./Collection.js').Collection;
	var MemoryStore = require('./Stores/Memory.js').Collection;
	//svar fnConstruct = TunnelManager;
	exports.StorageManager = StorageManagerBuilder(util, EventEmitter2, Store, Collection, MemoryStore);
}

function StorageManagerBuilder(util, EventEmitter2, Store, Collection, MemStore){
	
	var StorageManager = function(cfg){
		
		var self = this;
		
		EventEmitter2.call(self, {
			delimiter: '.',
			wildcard: true
		});
		
		self._environment = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? 'nodejs' : 'browser');
		
		self._config = {
			
		};
		
		self.stores = {};
		self.collections = [];
		
		if(!cfg){
			cfg = {};
		}
		self._config = cfg;
		if(!cfg.stores || cfg.stores.length==0){
			console.log('ADDING DEFAULT MEMSTORE');
			cfg.stores = [{
				type: 'Memory',
				options:{
					channels:[
						'master'
					]
				},
				defaultChannel: 'master',
				isDefault: true
			}];
		}
		
		self.factory('Memory', function(MemStore){
			self.trashStore = new MemStore({
				type: 'Memory',
				options:{
					channels:[
						'master'
					]
				},
				defaultChannel: 'master'
			});	
		});
		
		self.configure(cfg);
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
					
					for(var storeIdx in stores){
						var storeCfg = stores[storeIdx];
						self.createStore(storeCfg, function(createErr, store){
							
							if(!createErr){
								if(finishedStores==0 || storeCfg.isDefault===true){ //the first store to be added will be the default store, unless a later one has isDefault===true
									self.defaultStore = store;
								}	
							}
							
							finishedStores++;
							if(err!==false){
								err = createErr;
							}
							if(finishedStores==numStores || err){
								if(callback){
									callback.call(self, err, self._config);
								}
								self.emit('StorageManager.Ready', createErr, self);
							}
						});
					}	
					break;
			}
		}
		
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
		return this.defaultStore;
	}
	
	StorageManager.prototype.save = function(records, store, channel, callback){
		var self = this;
		
		if((typeof store=='function')){//the callback was passed as the second argument
			callback = store;
			store = self.getDefaultStore();
			channel = false;
		}
		
		if((typeof channel=='function')){
			//the callback was passed as the third argument
			callback = channel;
			channel = false;
		}

		if(store && store._environment){//a store object was supplied
		}else{
			store = self.getStore(store);
		}
		
		store.save(records, channel, function(err, records){
			if(callback){
				callback(err, records);
			}
		});
	}
	
	//TODO: FIX AND ADD SUPPORT FOR CHANNELS
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
			
			var storeChannels = channels[curStoreIdx];
			if(store){
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
		
		if(typeof channels =='function'){ //callback supplied as the third arg
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
	
	StorageManager.prototype.remove = function(query, stores, channel, callback){
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
				var store = self.getStore(store);
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
					if(recs.length==0){//keep looking
						searchNextStore();
					}else{
						if(callback){
							callback(err, recs);
						}
					}
				}
			});
		}
		
		removeFromNextStore();
	}
	
	StorageManager.prototype.createStore = function(cfg, callback){
		var self = this;
		//try{
			
			self.factory(cfg.type, function(storeDef){
				var newStore = new storeDef(cfg.options);
			
				newStore.once('Store.Ready', function(err, store){
						
					if(!cfg.id){
						cfg.id = generateID();
					}
					 
					if(cfg.id){
						self.registerStore(cfg.id, newStore, callback);
					}else{
						if(callback && (typeof callback)=='function'){
							callback(false, newStore);
						}
					}
					self.emit('StorageManager.StoreReady', err, store);
				});
				
			});
				
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
			if((typeof callback)=='function'){
				callback(false, store);
			}	
		}
	}
	
	StorageManager.prototype.getStore = function(cfg){
		var self = this;
		
		if(!cfg){//return the default store
			return self.getDefaultStore();
		}
		
		if((typeof cfg)=='string'){
			if(self.stores[cfg]){
				return self.stores[cfg];	
			}else{
				cfg = {
					name: cfg
				};
			}
		}else{
			if(cfg.id){
				return self.stores[cfg.id];
			}
		}
		
		for(var storeId in self.stores){
			//console.log(self.stores[storeId]);
			if(self.trashStore.validateRecord(self.stores[storeId], cfg)){
				return self.stores[storeId];
			}
		}
		
		return false;
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