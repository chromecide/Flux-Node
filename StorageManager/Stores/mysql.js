exports = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);
	
if (typeof define === 'function' && define.amd) {
	define(['util', 'EventEmitter2', 'StorageManager/Store', 'StorageManager/Channel', 'StorageManager/Model', 'StorageManager/Record'], function(util, EventEmitter2, Store, Channel, Model, Record) {
		var fnConstruct = StoreBuilder(util, EventEmitter2, Store);
		return fnConstruct;
	});		
} else {
	var util = require('util'), 
	EventEmitter2 = require('eventemitter2').EventEmitter2,
	StoreCtr = require('../Store').Store,
	channelCtr = require('../Channel.js').Channel,
	modelCtr = require('../Model.js').Model,
	recordCtr = require('../Record.js').Record,
	mysql = require('mysql')
	;
	
	var fnConstruct = StoreBuilder(util, EventEmitter2, StoreCtr, channelCtr, modelCtr, recordCtr, mysql);
	exports.Store = fnConstruct;
}

function StoreBuilder(util, EventEmitter2, Store, Channel, Model, Record, MySQL){
	
	function MySQLStore(cfg, callback){
		
		var self = this;
		
		Store.apply(this, cfg);
		
		self.configureStore = configureStore;
		
		self.getChannels = getChannels;
		self.getChannel = getChannel;
		self.addChannel = addChannel;
		self.removeChannel = removeChannel;
		
		self.save = save;
		self.find = find;
		self.findOne = findOne;
		self.remove = remove;
		self.rawQuery = rawQuery;
		self.loadChannelDefinitions = loadChannelDefinitions;
		self.defaultChannel = {};
		
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
	
		util.inherits(MySQLStore, Store);
	
	function configureStore(cfg, callback){
		var self = this;
		
		if(cfg.defaultChannel){
			self.defaultChannel = cfg.defaultChannel;
		}else{
			self.defaultChannel = 'master';
		}
		
		if(!cfg.host){
			cfg.host = 'localhost';
		}
		
		this.connection = MySQL.createConnection(cfg);
		
		this.connection.connect();
		
		this.loadChannelDefinitions(function(){
			if(callback){
				callback(false, cfg);
			}	
		});
		
	}
	
	/*
	 * Channel Functions
	 */
	
	function getChannel(channelName, callback){
		
		if(!channelName){
			return this._channels;
		}
		if(callback){
			callback(false, this._channels[channelName]);
		}
		return this._channels[channelName];
	}
	
	function getChannels(callback){
		
		if(callback){
			callback(false, this._channels);
		}
		return this._channels;
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
		}
		
		if(callback){
			callback(false, channelObj);
		}
	}
	
	function removeChannel(channelName){
		delete this._channels[channelName];
	}
	/*
	 * End Channel Functions
	 */
	
	function rawQuery(sqlString, model, callback){
		if((typeof model)=='function'){
			callback = model;
			model = false;
		}
		
		var returnRecords = [];
		this.connection.query({sql: sqlString}, function(err, results){
			for(var i=0;i<results.length;i++){
				var newRecord = new Record({
					data: results[i],
					model: model
				});
				
				returnRecords.push({
					err: false,
					record: newRecord
				});
			}
			
			if(callback){
				callback(false, returnRecords);
			}
		});
	}
	
	function loadChannelDefinitions(callback){
		var self = this;
		self.connection.query('SHOW TABLES', function(err, tables){
			var defs = {};
			function tableInfoLoop(){
				if(tables.length==0){
					if(callback){
						callback(err, defs);
					}
					return;
				}
				var table = tables.shift();
				for(var key in table){
					if(key.indexOf('Tables_in_')==0){
						var tableName = table[key];	
					}	
				}
				
				var model = new Model({
					name: tableName
				});
				
				self.connection.query('SHOW COLUMNS FROM '+tableName, function(err, cols){
					for(var i=0;i<cols.length;i++){
						var typeSet = false;
						if(cols[i].Key=='PRI'){
							model._idField = cols[i].Field;
						}
						var fieldCfg = {
							name: cols[i].Field,
							validators:{}
						};
						
						if(cols[i].Null=='No'){
							fieldCfg.validators.required = {};
						}
						
						if(cols[i].Type.indexOf('varchar')==0){
							typeSet = true;
							fieldCfg.validators.string = {
								minLength: cols[i].Null=='No'?1:0,
								maxLength: cols[i].Type.replace('varchar(', '').replace(')','')
							}
						}
						
						if(cols[i].Type.indexOf('int')==0 || cols[i].Type.indexOf('decimal')==0 ){
							typeSet = true;
							fieldCfg.validators.number = {};
						}
						
						if(cols[i].Type.indexOf('tinyint')==0 || cols[i].Type.indexOf('bit')==0){
							typeSet = true;
							fieldCfg.validators.boolean = {};
						}
						
						if(cols[i].Type.indexOf('datetime')==0 || cols[i].Type.indexOf('timestamp')==0  || cols[i].Type.indexOf('time')==0  || cols[i].Type.indexOf('date')==0){
							typeSet = true;
							fieldCfg.validators.date = {};
						}
						
						if(cols[i].Type.indexOf('text')==0){
							typeSet = true;
							fieldCfg.validators.string = {};
						}
						
						if(!typeSet){
							console.log(cols[i].Type);
							fieldCfg.validators.string = {};
						}
						
						model.addField(fieldCfg);
					}
					
					var newChannel = new Channel({
						name: tableName,
						model: model
					});
					
					defs[tableName] = newChannel;	
					self.addChannel(newChannel);
					tableInfoLoop();
				});
				
			}
			tableInfoLoop();
		});
	}
	
	function save(records, channel, callback){
		var self = this;
		var savedRecords = [];
		
		if(!Array.isArray(records)){
			records = [records];
		}
		
		var error = false;
		
		function saveLoop(){
			if(records.length==0){
				if(callback){
					callback(error, savedRecords);
				}
				return;
			}
			
			var record = records.shift();
			saveRecord.call(self, record, channel, function(err, savedRec){
				if(err){
					error = true;
				}else{
					savedRecords.push({
						error: err,
						record:savedRec
					});
				}
				
				saveLoop();
			});
		}
		
		saveLoop();
		
		return false;
	}
	
	function saveRecord(record, channel, callback){
		var self = this;
		var model = channel.getModel();
		
		//first we need to see if the id exists in the collection
		if(record.get(model._idField)){
			var qry = {};
			qry[model._idField] = record.get(model._idField);
			
			self.find(qry, {}, channel, function(err, recs){
				
				//if a record exists we need to to an update
				if(recs.length==1){
					var sqlString = objectToUpdate.call(self, record, channel);
					console.log(sqlString);
					self.connection.query(sqlString, {}, function(err, result){
						console.log(err);
						record._changed = {};
						if(callback){
							callback(err, record);
						}
					});	
				}else{ //otherwise do an insert
					var sqlString = objectToInsert.call(self, record, channel);
					self.connection.query(sqlString, {}, function(err, result){
						record._changed = {};
						if(callback){
							callback(err, record);
						}
					});	
				}			
			});
		}else{
			var model = channel.getModel();
			var newId = model.generateId();
			record.set(model._idField, newId);
			var sqlString = objectToInsert.call(self, record, channel);
			
			self.connection.query(sqlString, {}, function(err, result){
				record._changed = {};
				if(callback){
					callback(err, record);
				}
			});
		}
		
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
					queryByObject.call(self, query, fields, channel, false, function(err, records){
						if(callback){
							callback(err, records);
						}
					});
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
	}
	
	function queryByObject(query, fields, channel, maxRecs, callback){
		var self = this;
		var retArray = [];
		if((typeof channel)=='string'){
			channel = self.getChannel(channel);
		}
		
		var sqlString = objectToQuery.call(self, query, fields, channel);
		
		if(maxRecs && maxRecs>0){
			sqlString+=' LIMIT 0, '+maxRecs;
			
		}
		
		self.connection.query(sqlString, function(err, records){
			for(var idx in records){
				var newRecord = new Record({
					data: records[idx],
					channel: channel
				});
				
				retArray[idx] = {
					err:false,
					record: newRecord
				}
			}
			
			if(callback){
				callback(false, retArray);
			}
		});
	}
	
	function objectToQuery(object, fields, channel, callback){
		var self = this;
		var returnQuery = {};
		var emptyObj = {};
		if(Array.isArray(object)){//OR query
			console.log('OR QUERY');
			console.log(object);
		}else{
			
			var sql = 'SELECT ';
			
			if(!fields){
				sql+='* ';
			}else{
				var keyCount = 0;
				for(var key in fields){
					keyCount++;
					if(fields[key]==true){
						sql+=key+', '
					}
				}	
				if(keyCount==0){
					sql+='* ';
				}
			}
			
			if(sql.charAt(sql.length-1)==','){
				sql = sql.substr(0, sql.length-1);
			}
			sql += ' FROM '+channel.name;
			
			if(object!={}){
				sql +=' WHERE ';
			}
			
			var isFirst = true;
			for(var key in object){
				var model = channel.getModel();
				var keyObj = model.getField(key);
				
				var fieldProcessed = false;
				
				var criteria = object[key];
				
				if(!Array.isArray(criteria)){
					criteria = [criteria];
				}
				
				if(!isFirst){
					sql+=' AND ';
				}
				
				
				for(var critIdx in criteria){
					var objectVal = criteria[critIdx];
					
					
					if(objectVal.neq){
						objectVal = objectVal.neq;
						sql+=key+'<>';
						if(keyObj.validators.boolean){
							sql+=objectVal?1:0;
						}else{
							if(keyObj.validators.date){
								sql+='"'+objectVal.format('Y-m-d H:i:s');
							}else{
								sql+=self.connection.escape(objectVal);	
							}
						}
						
						fieldProcessed = true;
					}
					if(objectVal.lt){
						objectVal = objectVal.lt;
						sql+=key+'<';
						if(keyObj.validators.boolean){
							sql+=objectVal?1:0;
						}else{
							if(keyObj.validators.date){
								sql+='"'+objectVal.format('Y-m-d H:i:s');
							}else{
								sql+='"'+self.connection.escape(objectVal)+'"';
							}
						}
						
						fieldProcessed = true;
					}
					
					if(objectVal.gt){
						objectVal = objectVal.gt;
						sql+=key+'>';
						if(keyObj.validators.boolean){
							sql+=objectVal?1:0;
						}else{
							if(keyObj.validators.date){
								sql+='"'+objectVal.format('Y-m-d H:i:s');
							}else{
								sql+=self.connection.escape(objectVal);	
							}
						}
						
						fieldProcessed = true;
					}
					
					if(objectVal.lte){
						objectVal = objectVal.lte;
						sql+=key+'<=';
						if(keyObj.validators.boolean){
							sql+=objectVal?1:0;
						}else{
							if(keyObj.validators.date){
								sql+='"'+objectVal.format('Y-m-d H:i:s');
							}else{
								sql+='"'+self.connection.escape(objectVal)+'"';
							}
						}
						
						fieldProcessed = true;
					}
					
					if(objectVal.gte){
						objectVal = objectVal.gte
						sql+=key+'>=';
						if(keyObj.validators.boolean){
							sql+=objectVal?1:0;
						}else{
							if(keyObj.validators.date){
								sql+='"'+objectVal.format('Y-m-d H:i:s');
							}else{
								sql+='"'+self.connection.escape(objectVal)+'"';	
							}
						}
						
						fieldProcessed = true;
					}
					
					if(objectVal.ct){
						var ignoreCase = objectVal.ignoreCase?objectVal.ignoreCase:true;
						sql+=key+' LIKE ';
						sql+='"'+self.connection.escape(objectVal)+'"';	
						
						fieldProcessed = true;
					}
					
					if(objectVal.dct){
						var ignoreCase = objectVal.ignoreCase?objectVal.ignoreCase:true;
						sql+=key+' NOT LIKE ';
						sql+='"'+self.connection.escape(objectVal)+'"';	
						
						fieldProcessed = true;
					}
					
					if(objectVal.ae){
						//no support for AttributeExists with mysql tables
						fieldProcessed = true;
					}
					
					
					if(objectVal.eq || !fieldProcessed){
						objectVal = objectVal.eq?objectVal.eq:objectVal;
						sql+=key+'=';
						
						if(keyObj.validators.boolean){
							sql+=objectVal?1:0;
						}else{
							if(keyObj.validators.date){
								sql+='"'+objectVal.format('Y-m-d H:i:s');
							}else{
								sql+=self.connection.escape(objectVal);	
							}
						}
						
						fieldProcessed = true;
					}	
				}
				
				isFirst = false;
			}
			
		}
		if(callback){
			callback(false, sql);
		}
		return sql;
	}
	
	function objectToInsert(object, channel, callback){
		var self = this;
		var returnQuery = {};
		var emptyObj = {};
		
		
		var sql = 'INSERT INTO '+channel.name+'(';
		//console.log(object);
		var model = object.getModel();
		
		var fieldSql = '';
		var valueSql = '';
		var isFirst = true; 
		var fieldList = model.getFields();
		for(var key in fieldList){
			if(key!=model._idField){
				var value = object.get(key);
				
				if(!isFirst){
					fieldSql+=', ';
					valueSql+=', ';
				}else{
					isFirst = false;
				}
				
				fieldSql += key;
				
				if(fieldList[key].validators.date){
					if(value){
						value = value.toISOString().replace(/T/, ' ').replace(/\..+/, '');
					}
				}
				
				valueSql += self.connection.escape(value);
			}else{ //only add the id in if it was supplied
				var value = object.get(key);
				
				if(value){
					if(!isFirst){
						fieldSql+=', ';
						valueSql+=', ';
					}else{
						isFirst = false;
					}
					
					fieldSql += key;
					
					if(fieldList[key].validators.date){
						if(value){
							value = value.toISOString().replace(/T/, ' ').replace(/\..+/, '');
						}
					}
					
					valueSql += self.connection.escape(value);
						
				}
			}
		}
		
		sql+=fieldSql+') VALUES ('+valueSql+');';
		
		if(callback){
			callback(false, sql);
		}
		return sql;
	}
	
	function objectToUpdate(object, channel, callback){
		var self = this;
		var returnQuery = {};
		var emptyObj = {};
		
		
		var sql = 'UPDATE '+channel.name+' SET ';
		//console.log(object);
		var model = object.getModel();
		
		var whereSql = ' WHERE '+model._idField+'='+self.connection.escape(object.get(model._idField));
		var valueSql = '';
		var isFirst = true; 
		var fieldList = model.getFields();
		for(var key in fieldList){
			if(key!=model._idField){
				if(object._changed[key]){
					var value = object.get(key);
				
					if(!isFirst){
						valueSql+=', ';
					}else{
						isFirst = false;
					}
					
					if(fieldList[key].validators.date){
						if(value){
							value = value.toISOString().replace(/T/, ' ').replace(/\..+/, '');
						}
					}
					
					valueSql += key+'='+self.connection.escape(value);	
				}
			}
		}
		
		sql+=valueSql+whereSql;
		
		if(callback){
			callback(false, sql);
		}
		return sql;
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
					if((typeof channel)=='string'){
						channel = self.getChannel(channel);
					}
					if(Array.isArray(query)){
						while(query.length>0 && returnRecords.length==0){
							var queryItem = query.shift();
							queryByObject.call(self, queryItem, fields, channel, 1, function(err, records){
								if(retRecs && retRecs.length>0){
									returnRecords.push(retRecs[0].record);
								}
								if(callback){
									callback(err, returnRecords);
								}	
							});	
						}	
					}else{
						var retRecs = queryByObject.call(self, query, fields, channel, 1, function(err, records){
							
							if(records && records.length>0){
								returnRecords.push(records[0].record);
							}
							if(callback){
								callback(err, returnRecords);
							}
						});
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
		if(callback){
			callback(true, {
				message: 'MYSQL Save not Implemented'
			});
		}
		return false;
	}
	
	return MySQLStore;
}