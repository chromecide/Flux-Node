exports = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);
	
if (typeof define === 'function' && define.amd) {
	define(['util', 'EventEmitter2', 'StorageManager/Store', 'StorageManager/Collection', 'Stores/Memory'], function(util, EventEmitter2, Store, Collection, MemStore) {
		return StorageManagerBuilder(util, EventEmitter2, Store, Collection, MemStore);
	});		
} else {
	var util = require('util'), 
	EventEmitter2 = require('EventEmitter2').EventEmitter2,
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
		self.stores = {};
		self.collections = [];
		
		if(!cfg){
			cfg = {};
		}
		
		if(!cfg.stores || cfg.stores.length==0){
			cfg.stores = [{
				type: 'Memory',
				isDefault: true,
				options:{
					channels:[
						'master'
					]
				},
				defaultChannel: 'master'
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
		var stores = cfg.stores;
		var numStores = stores.length;
		var finishedStores = 0;
		var err = false;
		for(var storeIdx in stores){
			var storeCfg = stores[storeIdx];
			self.createStore(storeCfg, function(creatErr, store){
				if(finishedStores==0 || storeCfg.isDefault===true){ //the first store to be added will be the default store, unless a later one has isDefault===true
					self.defaultStore = store;
				}
				finishedStores++;
				if(err!==false){
					err = createErr;
				}
				if(finishedStores==numStores || err){
					if(callback){
						callback(err, self.stores);
					}
				}
			});
		}
	}
	
	StorageManager.prototype.factory = function(type, callback){
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
		
		if((typeof channel=='function')){//the callback was passed as the third argument
			callback = channel;
			channel = false;
		}
		
		store = self.getStore(store);
		
		store.save(records, channel, function(err, records){
			if(callback){
				callback(err, records);
			}
		});
	}
	
	StorageManager.prototype.find = function(record, stores, callback){
		
	}
	
	StorageManager.prototype.findOne = function(query, stores, channels, callback){
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
		
		function searchNextStore(){
			if(stores.length==0){
				if(callback){
					callback(err, recs);
				}
				return;
			}
			var store = stores.shift();
			
			store.findOne(query, channels, function(err, records){
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
		
		searchNextStore();
	}
	
	StorageManager.prototype.findById = function(record, stores, callback){
		
	}
	
	StorageManager.prototype.createStore = function(cfg, callback){
		var self = this;
		try{
			
			self.factory(cfg.type, function(storeDef){
				var newStore = new storeDef(cfg);
			
				if(!cfg.id){
					cfg.id = generateID();
				}
				 
				if(cfg.id){
					self.registerStore(cfg.id, newStore, callback);
				}else{
					if((typeof callback)=='function'){
						callback(false, newStore);
					}
				}	
			});
				
		}catch(e){
			self.emit('error', e);
			if((typeof callback)=='function'){
				callback(e, false);
			}
		}
		
		return true;	
	}
	
	StorageManager.prototype.registerStore = function(id, store, callback){
		var self = this;
		self.stores[id] = store;
		
		store.on('Store.RecordSaved', function(err, records){
			self.emit('StorageManager.RecordSaved', err, records);
		});
		
		self.emit('StorageManager.StoreRegistered', store);
		
		if((typeof callback)=='function'){
			callback(false, store);
		}
		
	}
	
	StorageManager.prototype.getStore = function(cfg){
		var self = this;
		
		if(!cfg){//return the default store
			return self.getDefaultStore();
		}
		
		if((typeof cfg)=='string' || cfg.id){
			return self.stores[cfg.id];
		}
		
		for(var storeId in self.stores){
			if(self.trashStore.validateRecord(self.stores[storeId], cfg)){
				return self.stores[storeId];
			}
		}
		
		return false;
	}

	StorageManager.prototype.createCollection = function(cfg){
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