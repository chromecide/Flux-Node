;!function(exports, undefined) {

	var EventEmitter2 = require('EventEmitter2').EventEmitter2;
	var util = require('util');
	var modelCtr = require(__dirname+'/model').Model;
	
	function Entity(model, data){
		this._data = {};
		this._model = false;
		this._changedfields;
		
		if(!data){
			//if the model isn't an instance of the Model object, the user supplied the data and no model
			if(!(model instanceof modelCtr)){
				data = model;
				model = false;
			}
		}
		
		if(model){
			this.setType(model);
		}
		
		if(data){
			this.suspendChanges = true;
			this.set(data);
			this.suspendChanges = true;
		}
		
		EventEmitter2.call(this, arguments);
	}
	
		util.inherits(Entity, EventEmitter2);
	
		Entity.prototype.add = function(name, type, value){
			this._attributes
		}
		
		Entity.prototype.setType = function(model){
			this._model = model;
		}
		
		Entity.prototype.getType = function(){
			return this._model;
		}
	
		Entity.prototype.get = function(propName){
			if(propName){
				var propAttribute = this._model?this._model.get(propName):false; 
				if(propAttribute){
					return propAttribute.get(this._data, this);//use the attribute object to retrievethe value from the data
				}else{
					return getDataValueByString(this._data, propName);	
				}
			}else{
				return this._data;
			}
			
		}
		
		Entity.prototype.set = function(propName, propValue){
			var self = this;
			if(propValue==undefined){
				propValue = propName;
				propName = false;	
			}
			
			if(propName){
				if(this._model){
					var attr = this._model.get(propName);
					if(attr){
						attr.set(this._data, propValue);
						if(!self.suspendChanges){
							this.emit('changed', this, propName);	
						}	
					}else{
						if(setDataValueByString(this._data, propName, propValue)){
							if(!self.suspendChanges){
								this.emit('changed', this, propName);	
							}	
						}	
					}
				}else{
					if(setDataValueByString(this._data, propName, propValue)){
						if(!self.suspendChanges){
							this.emit('changed', this, propName);	
						}
					}	
				}
			}else{
				this._data = propValue;
				if(!self.suspendChanges){
					this.emit('changed', this, propName);	
				}
			}
		}
		
		Entity.prototype.del = function(propName){
			if(propName){
				if(removeDataValueByString(this._data, propName)){
					this.emit('changed', this);
				}
			}else{
				this._data = {};
				this.emit('changed', this);
			}
		}
		
		Entity.prototype.add = function(propName, propValue){
			if(propValue==undefined){
				propValue = propName;
				propName = false;
			}
			if(!propName){
				if(addDataValueByString(this._data, propName, propValue)){
					this.emit('changed', this);
				}
			}else{
				if(Array.isArray(this._data)){
					if(this._data){
						this._data = [this._data];
					}else{
						this._data = [];	
					}
						
				}
				
				this._data.push(propValue);
				this.emit('changed', this);
			}
		}
	
		Entity.prototype.toObject = function(){
			return this._data;
		}
	/*
	 * DATA SUPPORT FUNCTIONS
	 */
	
	function getDataValueByString(data, nameString){
		var self = this;
		if(nameString!=''){
			if(nameString.indexOf('.')>-1){
				var nameParts = nameString.split('.');
				var currentAttr = nameParts.shift();
				var currentValue;
				if(data){
					currentValue = data[currentAttr];	
				}
				
				var newValue = getDataValueByString(currentValue, nameParts.join('.'));
				
				return newValue;
			}else{
				if(data){
					return data[nameString];	
				}else{
					return data;
				}
				
			}
		}else{
			return;	
		}
	}
	
	function setDataValueByString(data, nameString, value){
		var self = this; 
		if(!data){
			data = {};
		}
		if(nameString){
			if(nameString.indexOf('.')>-1){
				var nameParts = nameString.split('.');
				var currentName = nameParts.shift();
				data[currentName] = setDataValueByString(data[currentName], nameParts.join('.'), value);
			}else{
				data[nameString] = value;
			}
		}
		
		return data;
	}
	
	function addDataValueByString(data, nameString, value){
		var self = this; 
		if(!data){
			data = {};
		}
		if(nameString){
			if(nameString.indexOf('.')>-1){
				var nameParts = nameString.split('.');
				var currentName = nameParts.shift();
				data[currentName] = setDataValueByString(data[currentName], nameParts.join('.'), value);
			}else{
				if(!Array.isArray(data[nameString])){
					data[nameString] = [];
				}
				data[nameString].push(value);
			}
		}
		
		return data;
	}
	
	function removeDataValueByString(data, nameString, index){
		var self = this;
		
		if(nameString!=''){
			if(nameString.indexOf('.')>-1){
				var nameParts = nameString.split('.');
				var currentAttr = nameParts.shift();
				var currentValue;
				if(data){
					currentValue = data[currentAttr];	
				}
				
				var newValue = removeDataValueByString(currentValue, nameParts.join('.'));
				
				return newValue;
			}else{
				if(data){
					if(Array.isArray(data[nameString])){
						data[nameString].splice(index, 1);
					}else{
						delete data[nameString];	
					}
					
					return true;	
				}else{
					delete data;
					return true;
				}
				
			}
		}else{
			return;	
		}
	}

	if (typeof define === 'function' && define.amd) {
		define(function() {
			return Entity;
		});
	} else {
		exports.Entity = Entity;
	}

}(typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);