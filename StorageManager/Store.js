exports = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);
	
if (typeof define === 'function' && define.amd) {
	define(['FluxNode/util', 'EventEmitter2'], function(util, EventEmitter2) {
		var fnConstruct = StoreBuilder(util, EventEmitter2);
		return fnConstruct;
	});		
} else {
	var util = require('util'), 
	EventEmitter2 = require('EventEmitter2').EventEmitter2;
	var fnConstruct = StoreBuilder(util, EventEmitter2);
	exports.Store = fnConstruct;
}

function StoreBuilder(util, EventEmitter2){

	function Store(cfg){
		var self = this;
		self._environment = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? 'nodejs' : 'browser');
		self.collections = [];
		self.records = [];
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
					console.log(cfg.channels);
					break;
				default:
					self[key] = cfg[key];
					break;
			}
		}
	}
	
		util.inherits(Store, EventEmitter2);
		
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
					//TODO
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
				if(!validation(rec[keyName])){
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
		for(var keyName in validationCfg){
			var validations = validationCfg[keyName];
			var keyValid = true;

			if(validations){
				//make sure the validations value is an array, even if it's a single item
				if(!Array.isArray(validations)){
					validations = [validations];
				}
				
				for(var validationIdx in validations){
					var validation = validations[validationIdx];
					
					if(!self.validateValue(rec, keyName, validation)){
						keyValid = false;
					}
					if(!keyValid){
						allKeysValid = false;
						break; //we don't need to do more testing, so break out of both loops
					}
				}
			}
			if(!allKeysValid){
				break;
			}
		}
		
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