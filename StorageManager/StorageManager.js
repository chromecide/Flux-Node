exports = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);
	
if (typeof define === 'function' && define.amd) {
	define(['FluxNode/util', 'EventEmitter2', 'StorageManager/Store', 'StorageManager/Collection'], function(util, EventEmitter2, Store) {
		return StorageManagerBuilder(util, EventEmitter2, Store);
	});		
} else {
	var util = require('util'), 
	EventEmitter2 = require('EventEmitter2').EventEmitter2,
	Store = require('./Store.js').Tunnel;
	Collection = require('./Collection.js').Collection;
	//svar fnConstruct = TunnelManager;
	exports.StorageManager = StorageManagerBuilder(util, EventEmitter2, Store, Collection);
}

function StorageManagerBuilder(util, EventEmitter2, Store, Collection){
	
	
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
		
		var trashStoreDef = self.factory('Memory');
		self.trashStore = new trashStoreDef({
			type: 'Memory',
			options:{
				channels:[
					'master'
				]
			},
			defaultChannel: 'master'
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
			return storeDef;
		}else{
			require(['./Stores/'+type], callback);
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
		
		store.save(records, channel, function(err, records){
			if(callback){
				callback(err, records);
			}
		});
	}
	
	StorageManager.prototype.find = function(record, stores, callback){
		
	}
	
	StorageManager.prototype.findById = function(record, stores, callback){
		
	}
	
	StorageManager.prototype.createStore = function(cfg, callback){
		var self = this;
		try{
			
			var storeDef = self.factory(cfg.type);
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
			console.log(self.collections);
			self.emit('StorageManager.RecordSaved', err, records);
		});
		
		self.emit('StorageManager.StoreRegistered', store);
		
		if((typeof callback)=='function'){
			callback(false, store);
		}
		
	}
	
	StorageManager.prototype.getStore = function(cfg){
		var self = this;
		
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