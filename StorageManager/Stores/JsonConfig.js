exports = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);
	
if (typeof define === 'function' && define.amd) {
	define(['FluxNode/util', 'EventEmitter2', 'StorageManager/Store'], function(util, EventEmitter2, Store) {
		var fnConstruct = StoreBuilder(util, EventEmitter2, Store);
		return fnConstruct;
	});		
} else {
	var util = require('util'), 
	EventEmitter2 = require('EventEmitter2').EventEmitter2,
	Store = require('../Store').Store;
	var fnConstruct = StoreBuilder(util, EventEmitter2, Store);
	exports.Store = fnConstruct;
}

function StoreBuilder(util, EventEmitter2, Store){

	function JsonConfigStore(cfg){
		var self = this;
		self._environment = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? 'nodejs' : 'browser');
		
		self.configureStore = configureStore;
		self.save = save;
		self.find = find;
		self.findOne = findOne;
		self.remove = remove;
		
		if(cfg){
			self.configureStore(cfg);
		}
	}
	
		util.inherits(JsonConfigStore, Store);
	
	function configureStore(cfg){
		var self = this;
		
		if(cfg.path){
			self.path = cfg.path;
		}
	}
	
	function save(record){
		console.log('not implemented');
		return false;
	}
	
	function find(query){
		return false;
	}
	
	function findOne(query){
		return false;
	}
	
	function remove(query){
		return false;
	}
	
	return JsonConfigStore;
}