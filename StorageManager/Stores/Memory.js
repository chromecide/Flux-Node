exports = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);
	
if (typeof define === 'function' && define.amd) {
	define(['util', 'EventEmitter2', 'StorageManager/Store', 'StorageManager/Channel', 'StorageManager/Model', 'StorageManager/Record'], function(util, EventEmitter2, Store, Channel, Model, Record) {
		var fnConstruct = StoreBuilder(util, EventEmitter2, Store, Channel, Model, Record);
		return fnConstruct;
	});		
} else {
	var util = require('util'), 
	EventEmitter2 = require('eventemitter2').EventEmitter2,
	StoreCtr = require('../Store').Store,
	channelCtr = require('../Channel.js').Channel,
	modelCtr = require('../Model.js').Model,
	recordCtr = require('../Record.js').Record
	;
	
	var fnConstruct = StoreBuilder(util, EventEmitter2, StoreCtr, channelCtr, modelCtr, recordCtr);
	exports.Store = fnConstruct;
}

function StoreBuilder(util, EventEmitter2, Store, Channel, Model, Record){
	
	function MemoryStore(cfg, callback){
		
		var self = this;
		
		Store.apply(this, cfg);
		
		self.configureStore = configureStore;
		
		self.addChannel = addChannel;
		self.getChannel = getChannel;
		self.removeChannel = removeChannel;
		
		self.save = save;
		self.find = find;
		self.findOne = findOne;
		self.remove = remove;
		self.indexList = {};
		
		self.defaultChannel = {};
		//self._records = {};
		if(cfg){
			self.configureStore(cfg, function(){
				self.status = 'ready';
		
				self.emit('Store.Ready', false, self);
				if(callback){
					callback(cfg, self);
				}
			});
		}else{
			self.status = 'ready';
		
			self.emit('Store.Ready', false, self);
			if(callback){
				callback(cfg, self);
			}
		}
	}
	
		util.inherits(MemoryStore, Store);
	
	function configureStore(cfg, callback){
		var self = this;
		
		if(cfg.defaultChannel){
			self.defaultChannel = cfg.defaultChannel;
		}else{
			self.defaultChannel = 'master';
		}
		
		if(cfg){
			if(cfg.channels){
				for(var channelIdx in cfg.channels){
					var channelCfg = cfg.channels[channelIdx];
					
					self.addChannel(channelCfg,function(){
						
					});
				}
				
			}
		}
		
		if(cfg.data){
		//	self._records = data;
		}
		if(callback){
			callback();
		}
	}
	
	/*
	 * Channel Functions
	 */
	
	function getChannel(channelName){
		if(!channelName){
			return this._channels;
		}
		//console.log(this._channels[channelName]);
		return this._channels[channelName];
	}
	
	function addChannel(name, callback){
		var channelObj = name;
		if((typeof channelName)=='string'){
			channelObj = new Channel({
				name: channelName
			});
		}else{
			if((name instanceof Channel)==false){
				channelObj = new Channel(name);
			}
		}
		name = channelObj.name;
		if(!this._channels[name]){
			channelObj.setStore(this);
			this._channels[name] = channelObj;
			this._records[name] = [];
		}
	}
	
	function removeChannel(channelName){
		delete this._channels[channelName];
	}
	/*
	 * End Channel Functions
	 */
	
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
		if((typeof channel)=='string'){
			channel = self.getChannel(channel);	
		}
		
		if((record instanceof Record)==false){
			record = new Record({
				channel: channel, 
				data: record
			});
		}
		
		if(!record.get('id')){
			record.set('id', record.generateId());
		}
		
		if(!self._records[channel.name]){
			self._records[channel.name] = [];
		}else{
			var chanRecords = self._records[channel.name];
			for(var i=0;i<chanRecords.length;i++){
				var existingRecord = chanRecords[i]; 
				if(record.get('id')==existingRecord.id){
					chanRecords.splice(i,1);
				}
			}
			self._records[channel.name] = chanRecords;
		}
		
		var oldLength = self._records[channel.name].length;
		
		var newLength = self._records[channel.name].push(record._data);
		
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
		var queryType = (typeof query);
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

				channels = [self.defaultChannel];
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
		//console.log(queryFunctions.emailAddress.toString());
		
		if((typeof channel)=='string'){
			channel = self.getChannel(channel);
		}
		
		if(self._records[channel.name]){
			for(var recIdx=0;recIdx<self._records[channel.name].length;recIdx++){
				if(maxRecs!=false && retArray.length==maxRecs){
					break;
				}else{
					if(self.validateRecord(self._records[channel.name][recIdx], queryFunctions)){
					
						var newRec = new Record({
							channel: channel,
							data: self._records[channel.name][recIdx]
						});

						retArray.push(newRec);//self._records[channel.name][recIdx]);
					}	
				}
			}	
		}else{
			console.log('Channel '+channel.name+' not found');
		}
		
		for(var idx in retArray){
			retArray[idx] = {
				err:false,
				record: retArray[idx]
			}
		}
		
		if(callback){
			callback(false, retArray);
		}
		return retArray;
	}
	
	function objectToQuery(object, callback){
		var returnQuery = {};
		
		if(Array.isArray(object)){//OR query
			console.log('OR QUERY');
			console.log(object);
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
								if(val==oVal){
									return true;
								}
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
								if(oVal==true){
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
						var valFunc = function(oVal){
							return function(record, val){
								if(val==oVal){
									return true;
								}
								return false;
									
							}
						}
						
						returnQuery[key].push(valFunc(objectVal));
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
				channels = [self.defaultChannel];
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
					if(Array.isArray(query)){
						while(query.length>0 && returnRecords.length==0){
							var queryItem = query.shift();
							var retRecs = queryByObject.call(self, queryItem, fields, channel, 1);
							
							if(retRecs && retRecs.length>0){
								//for(var i=0;i<retRecs.length;i++){
									returnRecords.push(retRecs[0].record);
								//}
							}	
						}	
					}else{
						var retRecs = queryByObject.call(self, query, fields, channel, 1);
						for(var i=0;i<retRecs.length;i++){
							returnRecords.push(retRecs[i]);
						}	
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
		return returnRecords;
	}
	
	function remove(query, channel, callback){
		
		var self = this;
		
		if((typeof channel)=='string'){
			channel = self.getChannel(channel);
		}
		if(query instanceof Record){
			//console.log(query);
			var recId = query.get('id');
			query = recId;
		}
		
		var queryType = (typeof query);
		
		switch(queryType){
			case 'string': //assume it's an id
				console.log(channel);
				var removedRecords = [];
				for(var recIdx in self._records[channel.name]){
					if(self._records[channel.name][recIdx].id==query){
						removedRecords.push(self._records[channel.name][recIdx]);  
						self._records[channel.name].splice(recIdx, 1);
						break; //there is only going to be one item with the supplied ID
					}
				}
				if(callback){
					callback(false, removedRecords);
				}
				break;
			case 'object':
				if(query instanceof Record){
					self.remove(query.get('id'), callback);
				}else{
					returnRecords = queryByObject.call(self, query, {}, channel, 1);
				
					for(var recIdx in returnRecords){
						self.remove(returnRecords[recIdx].record.get('id'), channel, callback);
					}	
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