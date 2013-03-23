exports = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);
	
if (typeof define === 'function' && define.amd) {
	define(['util', 'EventEmitter2'], function(util, EventEmitter2) {
		var fnConstruct = RecordBuilder(util, EventEmitter2);
		return fnConstruct;
	});		
} else {
	var util = require('util'), 
	EventEmitter2 = require('eventemitter2').EventEmitter2;
	var fnConstruct = RecordBuilder(util, EventEmitter2);
	
	exports.Record = fnConstruct;
}

function RecordBuilder(util, EventEmitter2){

	function Record(cfg, callback){
		var self = this;
		
		self._data = {};
		self._changed = {};
		self._channel = false;
		self._model = false;
		
		if(cfg.model){
			this.setModel(cfg.model);
		}
		
		if(cfg.channel){
			this.setChannel(cfg.channel);
		}
		
		if(cfg.data){
			for(var key in cfg.data){
				self.set(key, cfg.data[key]);
			}
			self._changed = {};
		}
		
		EventEmitter2.call(
			self,
			{
			delimiter: '.',
			wildcard: true
			}
		);
		
		if(callback){
			callback(self, cfg);
		}
	}
	
	util.inherits(Record, EventEmitter2);
	
	Record.prototype.generateID = Record.prototype.generateId = function(){
		var newID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		    return v.toString(16);
		});
		return newID;
	}
	
	Record.prototype.getModel = function(callback){
		
		if(callback){
			callback(false, this._model);//no error
		}
		
		return this._model
	}
	
	Record.prototype.setModel = function(model, callback){
		this._model = model;
		if(callback){
			callback(false);//no error
		}
	}
	
	Record.prototype.setChannel = function(channel, callback){
		this._channel = channel;
		//set the record model to the channel's model
		this.setModel(channel.getModel());
	}
	
	Record.prototype.isDirty = function(){
		if(this._changed!={}){
			return true;
		}else{
			return false;
		}
	}
	
	Record.prototype.set = function(fieldName, fieldValue, callback){
		console.log('RECORD.SET: ', fieldName);
		var self = this;
		if(!this._model){
			var oldValue = this._data[fieldName];
			if(oldValue!=fieldValue){
				this._changed[fieldName] = true;
				this._data[fieldName] = fieldValue;	
			}
			
			if(callback){
				callback(oldValue, fieldValue);
			}
		}else{
			//validate the field first
			this._model.validateField(fieldName, fieldValue, function(isValid){
				if(isValid){
					console.log('SETTING:', fieldName);
					var oldValue = self._data[fieldName];
					if(oldValue!=fieldValue){
						self._changed[fieldName] = true;
						self._data[fieldName] = fieldValue;	
					}
					
					if(callback){
						callback(oldValue, fieldValue);
					}
				}else{
					console.log('NOT SETTING: '+fieldName);
					
					if(callback){
						callback(this._model);
					}
				}
			});
		}
	}
	
	Record.prototype.get = function(fieldName, callback){
		var value = this._data[fieldName];
		
		if(callback){
			callback(value);
		} 
		return value;
	}
	
	Record.prototype.save = function(callback){
		if(!this._channel){
			console.log('NO CHANNEL FOR', this);
			return false;
		}
		
		this._channel.save(this, callback);
	}
	
	Record.prototype.remove = function(){
		if(!this._channel){
			console.log('RECORD HAS NO CHANNEL');
			return false;
		}
		
		this._channel.remove(this);
	}
	
	return Record;
}