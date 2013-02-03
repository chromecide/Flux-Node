exports = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);
	
if (typeof define === 'function' && define.amd) {
	define(['util', 'EventEmitter2'], function(util, EventEmitter2) {
		var fnConstruct = ChannelBuilder(util, EventEmitter2);
		return fnConstruct;
	});		
} else {
	var util = require('util'), 
	EventEmitter2 = require('eventemitter2').EventEmitter2,
	Record = require(__dirname+'/Record.js').Record;
	var fnConstruct = ChannelBuilder(util, EventEmitter2);
	exports.Channel = fnConstruct;
}

function ChannelBuilder(util, EventEmitter2){
	function Channel(cfg, callback){
		var self = this;
		
		self._store = false;
		self._fields = {};
		self._validators = {};
		self._data = {};
		self_readonly = false;
		
		if(!cfg){
			cfg = {};
		}else{
			if((typeof cfg)=='string'){
				cfg = {
					name: cfg
				};
			}
		}
		
		if(!cfg.name){
			cfg.name = 'master';
		}
		
		if(cfg.model){
			self.setModel(cfg.model);
		}
		
		if(cfg.store){
			self.setStore(cfg.store);
		}
		EventEmitter2.call(
			self,
			{
			delimiter: '.',
			wildcard: true
			}
		);
		
		//process any config options
		if(cfg.name){
			self.name = cfg.name;
		}
		
		if(callback){
			callback(self, cfg);
		}
	}
	
	util.inherits(Channel, EventEmitter2);
	
	Channel.prototype.generateID = function(){
		var newID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		    return v.toString(16);
		});
		return newID;
	}
	
	Channel.prototype.setStore = function(store, callback){
		this._store = store;
		
		var returnObj = {
			channel: this,
			store: store
		};
		
		this.emit('Store.Set', returnObj);
		
		if(callback){
			callback(returnObj);
		}
	}
	
	Channel.prototype.setModel = function(model, callback){
		this._model = model;
		
		var returnObj = {
			channel: this,
			model: model
		};
		
		this.emit('Model.Set', returnObj);
		
		if(callback){
			callback(returnObj);
		}
	}
	
	Channel.prototype.getModel = function(callback){
		var model = this._model;
		
		if(callback){
			callback(false, model);
		}
		return model;
	}
	
	Channel.prototype.newRecord = function(recValues, callback){
		var model = this.getModel();
		if(!model){
			return false;
		}
		
		var record = new Record({
			channel: this,
			data: recValues
		});
		
		if(callback){
			callback(record?false:true, record);
		}
		
		return record;
	}
	
	Channel.prototype.validateRecord = function(record, callback){
		//validate the supplied record against the model we have
		var err = false;
		var errors = [];
		if(this._model){
			//validate the record against the model
				
		}else{
			errors.push({
				message: 'No Model Supplied'
			});
		}
		
		if(!err){
			this.emit('Record.Valid', {
				channel: this,
				record: record
			});
		}else{
			this.emit('Record.Invalid', {
				channel: this,
				record: record
			});
		}
		
		if(callback){
			callback(err, err?errors:{
				channel: this,
				record:record
			});
		}
	}
	
	Channel.prototype.save = function(record, callback){
		if(!this._engine){
			console.log('NO ENGINE SUPPLIED FOR CHANNEL: '+this.name);
			return false;
		}
	}
	
	Channel.prototype.remove = function(record, callback){
		if(!this._store){
			console.log('CHANNEL HAS NO STORE');
			console.log(this);
			return false;
		}
		
		this._store.remove(record, this, function(){
			//console.log(arguments);
		});
	}
	
	Channel.prototype.find = function(query, callback){
		if(!this._store){
			console.log('CHANNEL HAS NO FIND STORE');
			return false;
		}
		
		this._store.find(query);
	}
	
	Channel.prototype.findOne = function(query, callback){
		
	}
	
	return Channel;
}