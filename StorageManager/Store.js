exports = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);
	
if (typeof define === 'function' && define.amd) {
	define(['util', 'EventEmitter2', 'Channel', 'Record'], function(util, EventEmitter2, Channel) {
		var fnConstruct = StoreBuilder(util, EventEmitter2, Channel);
		return fnConstruct;
	});		
} else {
	var util = require('util'), 
	EventEmitter2 = require('eventemitter2').EventEmitter2,
	ChannelCtr = require(__dirname+'/Channel.js').Channel,
	ModelCtr = require(__dirname+'/Model.js').Model,
	RecordCtr = require(__dirname+'/Record.js').Record
	;
	var fnConstruct = StoreBuilder(util, EventEmitter2, ChannelCtr, ModelCtr, RecordCtr);
	exports.Store = fnConstruct;
}

function StoreBuilder(util, EventEmitter2, Channel, Record){

	function Store(cfg, callback){
		var self = this;
		self._environment = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? 'nodejs' : 'browser');
		self._channels = {};
		self._records = [];
		
		EventEmitter2.call(
			self,
			{
			delimiter: '.',
			wildcard: true
			}
		);
		
		for(var key in cfg){
			switch(key){
				case 'channels':
					//console.log(cfg.channels);	
					break;
				default:
					self[key] = cfg[key];
					break;
			}
		}
		
		if(callback){
			callback(cfg, self);
		}
	}
	
		util.inherits(Store, EventEmitter2);
		
		
	Store.prototype.addChannel = function(name, channel, callback){
		if((typeof name)!='string'){ //a channel object or config was supplied
			if((typeof channel)=='function'){
				callback = channel;
			}
			channel = name;
			name = channel.name;
		}
		
		if(channel instanceof Channel){
			this.channels[name] = channel;
		}else{
			var channel = new Channel()
			console.log('NOT A CHANNEL INSTANCE');
		}
	}
	
	Store.prototype.getChannel = function(name, callback){
		var chan = this.channels[name];
		if(callback){
			callback(chan?false:true, chan);
		}
		return chan;
	}
	
	Store.prototype.removeChannel = function(name, callback){
		delete this.channels[name];
		
		if(callback){
			callback(false); //no error
		}
		
		return true;
	}
	
	Store.prototype.newRecord = function(chanName, cfg, callback){
		var channel = this.getChannel(chanName);
		var newRec = channel.newRecord(cfg);
		
		if(callback){
			callback(newRec?false:true, newRec);
		}
		
		return newRec;
	}
	
	Store.prototype.generateID = function(){
		var newID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		    return v.toString(16);
		});
		return newID;
	}
	
	//TODO: find an intuitive way of passing back return messages
	Store.prototype.validateValue = function(rec, keyName, validation){
		var self = this;
		var keyValid = true; //we're optimists
		
		switch(typeof validation){
			case 'string': //assume its a specific value that must match
			case 'number':
			case 'boolean':
			case 'date':
				if(rec[keyName]!=validation){
					keyValid = false;
				}
				break;
			case 'object':
				//determine if it's an array, a regex or a complex cfg object
				if(Array.isArray(validation)){ //all sub values must match
					var validations = validation;
					var itemPassed = false; //not so optimistic
					for(var valIdx in validations){
						var itemValidation = validations[valIdx];
						if(self.validateValue(rec, keyName, itemValidation)){
							itemPassed = true;
							break;
						}
					}
					if(!itemPassed){
						keyValid = false;
					}
				}else{
					if(validation instanceof RegExp){ 
						//we need to test the value against the supplied regex
						if(!rec[keyName].match(validation)){
							keyValid = false;
						}
					}else{
						var attrType = validation.type?validation.type:'anything';
						var isRequired = validation.required?validation.required:false;
						var mustExist = validation.mustExist?validation.mustExist:false;
						var min = validation.min?validation.min:false;
						var max = validation.max?validation.max:false;
						var validations = validation.validations?validation.validations:[];
						
						//we need to parse the complex cfg
						for(var cfgKey in validation){
							switch(cfgKey){
								case 'type':
									if(rec[keyName]){
										if((typeof rec[keyName])!=validation.type){
											if(validation.type =='date' && rec[keyName].getMonth){
												//do nothing it's valid
											}else{
												keyValid = false;	
											}
										}	
									}
									break;
								case 'required':
									if(!rec[keyName] || rec[keyName]==undefined){
										keyValid = false;
									}
									break;
								case 'mustExist':
									if(!rec[keyName]){
										keyValid = false;
									}
									break;
								case 'validations':
									var validations = validation.validations;
									var itemPassed = false; //not so optimistic
									for(var valIdx in validations){
										var itemValidation = validations[valIdx];
										if(self.validateValue(rec, keyName, itemValidation)){
											itemPassed = true;
											break;
										}
									}
									if(!itemPassed){
										keyValid = false;
									}
									break;
								case 'min':
									switch(attrType){
										case 'string':
											if(rec[keyName].toString().length<min){
												keyValid = false;
											}
											break;
										case 'number':
											if((rec[keyName]*1)<min){ //the multiply by 1 ensures a numeric value, (naive/lazy much??)
												keyValid = false;
											}
											break;
										case 'date':
											if(rec[keyName]<min){ //TODO:better date compare
												keyValid = false;
											}
											break;
										case 'anything': 	//either a field marked as anything,
										default: 			// or one we don't know
											if(!Array.isArray(rec[keyName]) || rec[keyName].length<min){ // assume that, by supply a min value, the user means it's a list of something
												keyValid = false;
											}			
											break;
									}
									break;
								case 'max':
									switch(attrType){
										case 'string':
											if(rec[keyName].toString().length>max){
												keyValid = false;
											}
											break;
										case 'number':
											if((rec[keyName]*1)>max){ //the multiply by 1 ensures a numeric value, (naive/lazy much??)
												keyValid = false;
											}
											break;
										case 'date':
											if(rec[keyName]>max){ //TODO: better date compare
												keyValid = false;
											}
											break;
										case 'anything': 	//either a field marked as anything,
										default: 			// or one we don't know
											if(!Array.isArray(rec[keyName]) || rec[keyName].length>max){ // assume that, by supply a max value, the user means it's a list of something
												keyValid = false;
											}			
											break;
									}
									break;
							}
						}
					}
				}
				break;
			case 'function':
				if(!validation(rec, rec[keyName])){
					keyValid = false;
				}
				break;
			default:
			
				break;
		}
		
		return keyValid;
	}
	
	Store.prototype.validateRecord = function(rec, validationCfg){
		var self = this;
		var allKeysValid = true;
		//console.log('------------------------------------------');
		for(var keyName in validationCfg){
			var validations = validationCfg[keyName];
			var keyValid = true;
			//console.log('------'+keyName+'------');
			if(validations){
				//make sure the validations value is an array, even if it's a single item
				if(!Array.isArray(validations)){
					validations = [validations];
				}
				for(var validationIdx in validations){
					//console.log(validationIdx);
					var validation = validations[validationIdx];
					
					if(!self.validateValue(rec, keyName, validation)){
						keyValid = false;
					}
					if(!keyValid){
						//console.log('NOT ALL KEYS VALID');
						allKeysValid = false;
						break; //we don't need to do more testing, so break out of both loops
					}
				}
				
			}
			//console.log('------/'+keyName+'------');
			if(!allKeysValid){
				break;
			}
		}
		//console.log('------------------------------------------');
		return allKeysValid;
	}
	
	function save(records, channel, callback){
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
	
	return Store;
}