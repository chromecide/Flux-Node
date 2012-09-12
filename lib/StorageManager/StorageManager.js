exports = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);
	
if (typeof define === 'function' && define.amd) {
	define(['util', 'EventEmitter2', 'StorageManager/Store'], function(util, EventEmitter2, Store) {
		return StorageManagerBuilder(util, EventEmitter2, Store);
	});		
} else {
	var util = require('util'), 
	EventEmitter2 = require('EventEmitter2').EventEmitter2,
	Store = require('./Store.js').Tunnel;
	//svar fnConstruct = TunnelManager;
	exports.StorageManager = StorageManagerBuilder(util, EventEmitter2, Store);
}

function StorageManagerBuilder(util, EventEmitter2, Store){
	var stores = {};
	
	var StorageManager = new EventEmitter2({
		delimiter: '.',
		wildcard: true
	});
	
	StorageManager._environment = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? 'nodejs' : 'browser');
	
	StorageManager.factory = function(type, callback){
		var self = this;
		if(self._environment=='nodejs'){
			var storeDef = require('./Stores/'+type).Store;
			return storeDef;
		}else{
			require(['./Stores/'+type], callback);
		}
	}
	
	StorageManager.createStore = function(cfg){
		var self = this;
		
		var storeDef = self.factory(cfg.type);
		var newStore = new storeDef(cfg); 
		if(cfg.name){
			self.registerStore(cfg.name, newStore);
		}
		return newStore;	
	}
	
	StorageManager.registerStore = function(name, store){
		var self = this;
		stores[name] = store;
	}
	
	StorageManager.getStore = function(name){
		var self =this;
		return stores[name];
	}

	
	return StorageManager;
}
