exports = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);
	
if (typeof define === 'function' && define.amd) {
	define(['util', 'EventEmitter2', 'StorageManager/Store'], function(util, EventEmitter2, Store) {
		var fnConstruct = StoreBuilder(util, EventEmitter2, Store);
		return fnConstruct;
	});		
} else {
	var util = require('util'), 
	EventEmitter2 = require('eventemitter2').EventEmitter2,
	Store = require('../Store').Store;
	
	var fnConstruct = StoreBuilder(util, EventEmitter2, Store);
	exports.Store = fnConstruct;
}

function StoreBuilder(util, EventEmitter2, Store){
	
	function MemoryStore(cfg){
		
		var self = this;
		Store.call(this, cfg);
		self.configureStore = configureStore;
		self.save = save;
		self.find = find;
		self.findOne = findOne;
		self.remove = remove;
		self.indexList = {};
		
		self.defaultChannel = {};
		if(cfg){
			self.configureStore(cfg);
		}
	}
	
		util.inherits(MemoryStore, Store);
	
	function configureStore(cfg){
		var self = this;
		
		if(cfg.defaultChannel){
			self.defaultChannel = cfg.defaultChannel;
		}else{
			self.defaultChannel = 'master';
		}
		
		if(cfg.options){
			if(cfg.options.channels){
				for(var channelIdx in cfg.options.channels){
					var channelName = cfg.options.channels[channelIdx];
					self.records[channelName]=[];
				}
			}
		}
		
		if(cfg.data){
			self.records = data;
		}
	}
	
	function addChannel(channelName){
		var self = this;
		if(!self.records[channelName]){
			self.records[channelName] = [];
		}
	}
	
	function save(records, channel, callback){
		var self = this;
		var err = false;

		if(!Array.isArray(records)){
			records = [records];
		}
		
		if((typeof channel=='function')){ //callback supplied as 2nd arg
			callback = channel;
			channel = self.defaultChannel;
		}else{
			if(!channel){
				channel = self.defaultChannel;
			}
		}
		var ReturnRecords = [];
		
		function doSaveRecords(){
			if(records.length==0){
				if(callback){
					callback(err, ReturnRecords);
				}
				return;
			}
			
			var newRecord = records.shift();
			saveRecord.call(self, newRecord, channel, function(err, rec){
				if(err){
					err = true;
					newRecord = {
						error: err,
						record: newRecord
					}
				}
				ReturnRecords.push(newRecord);
				doSaveRecords();
			});
		}
		doSaveRecords();
	}
	
	function saveRecord(record, channel, callback){
		var self = this;
		var err = false;
		if(!record.id){
			record.id = self.generateID();
		}
		
		if(!self.records[channel]){
			self.records[channel] = []
		}
		
		var oldLength = self.records[channel].length;
		var newLength = self.records[channel].push(record);
		
		if(newLength!=oldLength+1){
			err = true;	
		}
		
		if(callback){
			callback(err, record);
		}
		
		self.emit('Store.RecordSaved', err, record);
	}
	
	function find(query, channel, callback){
		var self = this;
		var err = false;
		var queryType = typeof query;
		var returnRecords = [];
		
		switch(queryType){
			case 'string': //assume it's an id
				for(var recIdx in self.records[channel]){
					if(self.records[recIdx].id==query){
						returnRecords.push(self.records[recIdx]);
						break; //there is only going to be one item with the supplied ID
					}
				}
				break;
			case 'object':
				returnRecords = queryByObject.call(self, query, channel, false);
				break;
			case 'function':
				for(var recIdx in self.records[channels]){
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
	
	function queryByObject(query, channel, maxRecs, callback){
		var self = this;
		
		var retArray = [];
		if(Array.isArray(query)){ //it's an OR style query
			var currentCount = 0;
			retArray = self.records[channel].filter(function(rec){
				var matches = false;
				for(var idx in query){
					var queryItem = query[idx];
					switch(typeof queryItem){
						case 'string':
						
							break;
						case 'object':
							var allItemsMatch = true;
							for(var key in queryItem){
								if(rec[key] && rec[key]!=queryItem[key]){
									allItemsMatch = false;
									break;
								}	
							}
							if(allItemsMatch){
								matches = true;
								break;
							}
							break;
						case 'function':
						
							break;	
					}
					
				}
				if(matches){
					currentCount++;
					
					if(maxRecs && currentCount>maxRecs){
						matches = false;
					}
				}
				return matches;
			});
		}else{
			if(query._map){//map reduce
				
			}else{ //find by attribute
				retArray = self.records[channel].filter(function(rec){
					for(var key in query){
						if(rec[key] && rec[key]!=query[key]){
							return false;
						}	
					}
					return true;
				});
			}
		}
		return retArray;
	}
	
	function findOne(query, channel, callback){
		var self = this;
		var err = false;
		var queryType = typeof query;
		var returnRecords = [];
		
		switch(queryType){
			case 'string': //assume it's an id
				for(var recIdx in self.records[channel]){
					if(self.records[recIdx].id==query){
						returnRecords.push(self.records[recIdx]);
						break; //there is only going to be one item with the supplied ID
					}
				}
				break;
			case 'object':
				returnRecords = queryByObject.call(self, query, channel, 1);
				break;
			case 'function':
				var currentCount = 0;
				for(var recIdx in self.records[channels]){
					if(query(self.records[recIdx])===true){
						currentCount++;
						if(currentCount==maxRecs){
							break;
						}
						returnRecords.push(self.records[recIdx]);
					}
				}
				break;
		}
		
		if(callback){
			callback(err, returnRecords);
		}
	}
	
	function remove(query, channel, callback){
		var self = this;
		var queryType = typeof query;
		switch(queryType){
			case 'string': //assume it's an id
				for(var recIdx in self.records[channel]){
					if(self.records[Channel][recIdx].id==query){
						delete self.records[Channel][recIdx];
						break; //there is only going to be one item with the supplied ID
					}
				}
				break;
			case 'object':
				returnRecords = queryByObject.call(self, query, channel, 1);
				for(var recIdx in returnRecords){
					self.remove(returnRecords[recIdx].id, channel, callback);
				}
				break;
			case 'function':
				for(var recIdx in self.records[channels]){
					if(query(self.records[recIdx])===true){
						delete self.records[Channel][recIdx];
					}
				}
				break;
		}
		return false;
	}
	
	return MemoryStore;
}