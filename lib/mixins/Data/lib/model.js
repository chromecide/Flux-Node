;!function(exports, undefined) {
	var EventEmitter2 = require('eventemitter2').EventEmitter2;
	var util = require('util');
	var Attribute = require(__dirname+'/attribute.js').Attribute;
	
	function model(name, fields){
		if((typeof name)=='object'){
			fields = name.fields,
			name = name.name
		}
		
		this.name = name;
		this._fields = {};
		
		if(fields){
			var fieldList = parseFieldConfig(fields);
			for(var fieldName in fieldList){
				this._fields[fieldName] = new Attribute(fieldList[fieldName]);
			}
		}
		
		EventEmitter2.call(this, arguments);
	}
	
		util.inherits(model, EventEmitter2);
	
		model.prototype.get = function(name){
			return this._fields[name];
		}
		
		model.prototype.add = function(name, type, required, hasMany){
			var fieldCfg = {};
			
			if((typeof name)=='object'){
				fieldCfg = name;
			}else{
				fieldCfg = {
					name: name,
					type: type?type:'Attribute',
					required: required===undefined?false: required,
					hasMany: hasMany===undefined?false: hasMany
				}
			}
			
			this._fields[fieldCfg.name] = new Attribute(fieldCfg);
			this.emit('added', this, this._fields[fieldCfg.name]);
			this.emit('changed', this, this._fields[fieldCfg.name]);
		}
		
		model.prototype.remove = function(name){
			delete this._fields[name];
			this.emit('removed', this, name);
			this.emit('changed', this, this._fields[fieldCfg.name]);
		}
		
		model.prototype.validate = function(entity){
			var isValid = true;
			for(var fieldName in this._fields){
				var field = this._fields[fieldName];
				if(field.type!='Calculated'){
					if(!this.validateField(field, entity.get(fieldName))){
						isValid = false;
						continue;
					}	
				}
			}
			
			return isValid;
		}
		
		model.prototype.validateField = function(field, data){
			return field.validate(data);
		}
		
		model.prototype.toObject = function(){
			var modelCfg = {
				name: this.name,
				fields:[]
			};
			for(var fieldName in this._fields){
				var field = this._fields[fieldName];
				modelCfg.fields.push(field.toObject());
			}
			return modelCfg;
		}
		/*
		 * Support Functions
		 */
		
		function parseFieldConfig(fields){
			var fieldList = {};

			if(Array.isArray(fields)){
				for(var i=0;i<fields.length;i++){
					var fieldItem = parseFieldItem(fields[i]);
					fieldList[fieldItem.name] = fieldItem;
				}
			}else{
				switch((typeof fields)){
					case 'object': //field configuration object
						for(var key in fields){
							var fieldItem = parseFieldItem([fields[key]]);
							fieldList[fieldItem.name] = fieldItem;	
						}
						break;
					case 'string':
						if(fields.indexOf(',')>-1){//comma separated list of field names
							fields = fields.split(',');
							for(var i=0;i<fields.length;i++){
								var fieldItem = parseFieldItem(fields[i]);
								fieldList[fieldItem.name] = fieldItem;
							}
						}else{//a single field name
							var fieldItem = parseFieldItem(fields);
							fieldList[fieldItem.name] = fieldItem;
						}
						break;
				}
			}
			
			return fieldList;
		}
		
		function parseFieldItem(field){
			var fieldCfg = {};
			switch((typeof field)){
				case 'object':
					if(field.name){
						fieldCfg = field;
					}
					
					break;
				case 'string':
					fieldCfg.name = field.trim();
					break;
			}
			
			if(fieldCfg.required===undefined){
				fieldCfg.required = false;	
			}
			
			if(fieldCfg.type===undefined){
				fieldCfg.type = 'attribute';
			}
			return fieldCfg;
		}
		
	if (typeof define === 'function' && define.amd) {
	    define(function() {
	    	return model;
	    });
	} else {
		exports.Model = model;
	}

}(typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);