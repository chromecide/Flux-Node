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
		self.status = 'ready';
		
		// this is here because the store is ready instantly, any code within the new FluxNode callback will never recieve the event,
		setTimeout(function(){
			self.emit('Store.Ready', false, self);	
		}, 1000)
		
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
				newRecord = {
					error: err,
					record: newRecord
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
	
	function find(query, fields, channels, callback){
		
		var self = this;
		var err = false;
		var queryType = typeof query;
		var returnRecords = [];
		
		if(typeof fields =='function'){
			callback = fields;
			fields = {};
			channels = false;
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
				for(var chanIdx in channels){
					var channel = channels[chanIdx];
					for(var recIdx in self.records[channel]){
						
						if(self.records[channel][recIdx].id==query){
							returnRecords.push({
								err: false,
								record: self.records[channel][recIdx]
							});
							
							break; //there is only going to be one item with the supplied ID
						}
					}	
				}
				break;
			case 'object':
				for(var chanIdx in channels){
					var channel = channels[chanIdx];
					var retRecs = queryByObject.call(self, query, fields, channel, false);
					for(var i=0;i<retRecs.length;i++){
						returnRecords.push(retRecs[i]);	
					}
					 
				}
				break;
			case 'function':
				for(var chanIdx in channels){
					var channel = channels[chanIdx];
					for(var recIdx in self.records[channel]){
						if(query(self.records[channel][recIdx])===true){
							returnRecords.push({err: false, record: self.records[channel][recIdx]});
						}
					}
				}
				break;
		}
		
		if(callback){
			callback(err, returnRecords);
		}
	}
	
	function queryByObject(query, fields, channel, maxRecs, callback){
		var self = this;
		
		var retArray = [];
		
		var queryFunctions = objectToQuery(query);
		
		if(self.records[channel]){
			for(var recIdx=0;recIdx<self.records[channel].length;recIdx++){
				if(maxRecs!=false && retArray.length==maxRecs){
					break;
				}else{
					if(self.validateRecord(self.records[channel][recIdx], queryFunctions)){
						retArray.push(self.records[channel][recIdx]);
					}	
				}
			}	
		}else{
			console.log('Channel '+channel+' not found');
		}
		
		for(var idx in retArray){
			retArray[idx] = {
				err:false,
				record: retArray[idx]
			}
		}
		
		return retArray;
	}
	
	function objectToQuery(object, callback){
		var returnQuery = {};
		
		if(Array.isArray(object)){//OR query
			//console.log('OR QUERY');
		}else{
			for(var key in object){
				returnQuery[key] = [];
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
						var valFunc = function(oVal){
							return function(record, val){
								//console.log(val+' == '+oVal);
								if(val==oVal){
									//console.log(' - Yes');
									return true;
								}
								//console.log(' - No');
								return false;
							}
						}
						
						returnQuery[key].push(valFunc(objectVal));
						fieldProcessed = true;
					}
					if(objectVal.neq){
						objectVal = objectVal.neq;
						var valFunc = function(oVal){
							return function(record, val){
								//console.log(val+' != '+oVal);
								if(val!=oVal){
									//console.log(' - Yes');
									return true;
								}
								//console.log(' - No');
								return false;
							}
						}
						
						returnQuery[key].push(valFunc(objectVal));
						fieldProcessed = true;
					}
					if(objectVal.lt){
						objectVal = objectVal.lt;
						var valFunc = function(oVal){
							return function(record, val){
								//console.log(val+' < '+oVal);
								if(val<oVal){
									//console.log(' - Yes');
									return true;
								}
								//console.log(' - No');
								return false;
							}
						}
						
						returnQuery[key].push(valFunc(objectVal));
						fieldProcessed = true;
					}
					
					if(objectVal.gt){
						objectVal = objectVal.gt;
						var valFunc = function(oVal){
							return function(record, val){
								//console.log(val+' > '+oVal);
								if(val>oVal){
									//console.log(' - Yes');
									return true;
								}
								//console.log(' - No');
								return false;
							}
						}
						
						returnQuery[key].push(valFunc(objectVal));
						fieldProcessed = true;
					}
					
					if(objectVal.lte){
						objectVal = objectVal.lte;
						var valFunc = function(oVal){
							return function(record, val){
								//console.log(val+' <= '+oVal);
								if(val<=oVal){
									//console.log(' - Yes');
									return true;
								}
								//console.log(' - No');
								return false;
							}
						}
						
						returnQuery[key].push(valFunc(objectVal));
						fieldProcessed = true;
					}
					
					if(objectVal.gte){
						objectVal = objectVal.gte
						var valFunc = function(oVal){
							return function(record, val){
								//console.log(val+' >= '+oVal);
								if(val>=oVal){
									//console.log(' - Yes');
									return true;
								}
								//console.log(' - No');
								return false;
							}
						}
						
						returnQuery[key].push(valFunc(objectVal));
						fieldProcessed = true;
					}
					
					if(objectVal.ct){
						var ignoreCase = objectVal.ignoreCase?objectVal.ignoreCase:true;
						objectVal = objectVal.ct;
						
						var valFunc = function(oVal){
							return function(record, val){
								switch(typeof oVal){
									case 'string':
										var recVal = record[key];
										var objVal = oVal;
										if(ignoreCase===true){
											recVal = recVal.toLowerCase();
											objVal = objVal.toLowerCase();
										}
										//console.log(recVal+' ct '+objVal);
										if(recVal.indexOf(objVal)>-1){
											//console.log(' - Yes');
											return true;
										}
										//console.log(' - No');
										return false
										break;
									case 'number'://can't do contains on numbers
										return false;
										break;
									case 'object':
										return false;
										break;
									default:
										//console.log(typeof oVal);
										return false;
										break;
								}
								return false;
							}
						}
						returnQuery[key].push(valFunc(objectVal));
						fieldProcessed = true;
					}
					
					if(objectVal.dct){
						var ignoreCase = objectVal.ignoreCase?objectVal.ignoreCase:true;
						objectVal = objectVal.dct;
						
						var valFunc = function(oVal){
							return function(record, val){
								switch(typeof oVal){
									case 'string':
										var recVal = record[key];
										var objVal = oVal;
										if(ignoreCase===true){
											recVal = recVal.toLowerCase();
											objVal = objVal.toLowerCase();
										}
										//console.log(val+' dct '+objectVal);
										if(recVal.indexOf(objVal)==-1){
											//console.log(' - Yes');
											return true;
										}
										//console.log(' - No');
										return false
										break;
									case 'number'://can't do contains on numbers
										return false;
										break;
									case 'object':
										return false;
										break;
									default:
										//console.log(typeof oVal);
										return false;
										break;
								}
								return false;
							}
						}
						
						returnQuery[key].push(valFunc(objectVal));
						fieldProcessed = true;
					}
					
					if(objectVal.ae){
						objectVal = objectVal.ae;
						
						var valFunc = function(oVal){
							return function(record, val){
								if(oval==true){
									if(record[key]){
										return true;	
									}
									return false;	
								}else{
									if(record[key]){
										return false;;	
									}
									return true;
								}
								
							}
						}
						
						returnQuery[key].push(valFunc(objectVal));
						fieldProcessed = true;
					}
					
					if(!fieldProcessed){
						returnQuery[key].push(function(record, val){
							
							if(record[key]==objectVal){
								return true;
							}
							return false;
						});
					}	
				}
				
			}
		}
		
		return returnQuery;
	}
	
	function findOne(query, fields, channels, callback){
		var self = this;
		var err = false;
		var queryType = typeof query;
		var returnRecords = [];
		
		if(typeof fields =='function'){
			callback = fields;
			fields = {};
			channels = false;
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
				for(var chanIdx in channels){
					var channel = channels[chanIdx];
					for(var recIdx in self.records[channel]){
						if(self.records[recIdx].id==query){
							returnRecords.push(self.records[recIdx]);
							break; //there is only going to be one item with the supplied ID
						}
					}
				}
				break;
			case 'object':
				for(var chanIdx in channels){
					var channel = channels[chanIdx];
					var retRecs = queryByObject.call(self, fields, query, channel, 1);
					for(var i=0;i<retRecs.length;i++){
						returnRecords.push(retRecs[i]);
					}
					 
				}
				break;
			case 'function':
				var currentCount = 0;
				for(var chanIdx in channels){
					var channel = channels[chanIdx];
					for(var recIdx in self.records[channels]){
						if(query(self.records[recIdx])===true){
							currentCount++;
							if(currentCount==maxRecs){
								break;
							}
							returnRecords.push(self.records[recIdx]);
						}
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