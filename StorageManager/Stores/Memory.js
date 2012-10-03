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
	
	function MemoryStore(cfg){
		var self = this;
		self._environment = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? 'nodejs' : 'browser');
		
		self.configureStore = configureStore;
		self.save = save;
		self.find = find;
		self.findOne = findOne;
		self.remove = remove;
		self.records = [];
		self.indexList = {};
		
		if(cfg){
			self.configureStore(cfg);
		}
	}
	
		util.inherits(MemoryStore, Store);
	
	function configureStore(cfg){
		var self = this;
		
		if(cfg.path){
			self.path = cfg.path;
		}
	}
	
	function save(record, callback){
		var self = this;
		var err = false;
		if(!record.id){
			record.id = self.generateID();
		}
		
		var oldLength = self.records.length;
		var newLength = self.records.push(record);
		if(newLength!=oldLength+1){
			err = true;	
		}
		if(callback){
			callback(err, record);
		}
	}
	
	function find(query, callback){
		var self = this;
		var err = false;
		var queryType = typeof query;
		var returnRecords = [];
		switch(queryType){
			case 'string': //assume it's an id
				for(var recIdx in self.records){
					if(self.records[recIdx].id==query){
						returnRecords.push(self.records[recIdx]);
						break; //there is only going to be one item with the supplied ID
					}
				}
				break;
			case 'object':
				
				break;
			case 'function':
				console.log('finding by');
				for(var recIdx in self.records){
					if(query(self.records[recIdx])===true){
						returnRecords.push(self.records[recIdx]);
					}
				}
				break;
		}
		
		if(callback){
			callback(err, returnRecords);
		}
	}
	
	function findOne(query){
		return false;
	}
	
	function remove(query){
		var queryType = typeof query;
		
		return false;
	}
	
	return MemoryStore;
}