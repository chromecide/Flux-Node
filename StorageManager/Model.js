if (typeof define === 'function' && define.amd) {
	define([], function(){
		return model;
	});
}else{
	var valArray = require(__dirname+'/field_validators/array.js').validator;
	var valBoolean = require(__dirname+'/field_validators/boolean.js').validator;
	var valDate = require(__dirname+'/field_validators/date.js').validator;
	var valFunction = require(__dirname+'/field_validators/function.js').validator;
	var valNumber = require(__dirname+'/field_validators/number.js').validator;
	var valRequired = require(__dirname+'/field_validators/required.js').validator;
	var valString = require(__dirname+'/field_validators/string.js').validator;
	var valEmail = require(__dirname+'/field_validators/email.js').validator;
	var valObject = require(__dirname+'/field_validators/object.js').validator;
	
	exports.Model = model;
}
	//strict means ONLY the supplied fields are allowed.  if a supplied object has other fields, they will be ignored
	function model(name, fields, options, callback){
		this._fields = {
			
		};
		
		this._idField = false;
		
		if((typeof name)=='object'){
			if((typeof fields=='function')){
				callback = fields;
			}	
			fields = name.fields;
			options = name.options;
			name = name.name;
		}else{
			if((typeof options)=='function'){
				callback=options;
				options = false;
			}
		}
		
		if(options){
			if(options.idField){
				this._idField = options.idField;
			}else{
				this._idField = 'id';
				this.fields.id= {
					validators: {
						required:{}
					}
				}
			}
		}
		this.name = name;
		
		if(fields){
			if(Array.isArray(fields)){
				for(var i=0;i<fields.length;i++){
					var field = fields[i];
					this.addField(field.name, field.cfg);
				}	
			}else{// config object
				for(var key in fields){
					var field = fields[key];
					this.addField(key, field);
				}
			}
			
		}
				
		if(callback){
			callback(false, {
				model: this,
				options: options
			});
		}
	}
	
	model.prototype._validators = {
		'array': valArray,
		'boolean': valBoolean,
		'date': valDate,
		'function': valFunction,
		'number': valNumber,
		'required': valRequired,
		'string': valString,
		'email': valEmail,
		'object': valObject
	};
	
	model.prototype.generateID = model.prototype.generateId = function(){
		var newID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		    return v.toString(16);
		});
		return newID;
	}
	
	model.prototype.validate = function(record, fieldListObject, callback){
		
		var self = this;
		var fieldList = [];
		var isValid = false;
		
		if((typeof fieldListObject)=='function'){
			callback = fieldList;
			fieldList = false; 
		}
		
		if(!fieldListObject){
			fieldList = [];
			for(var key in this._fields){
				fieldList.push(key);
			}
		}else{
			if(Array.isArray(fieldListObject)){
				fieldList = fieldListObject;
			}else{
				for(var key in fieldListObject){
					var itemObj = fieldListObject[key];
					itemObj.name = key;
					fieldList.push(itemObj);
				}	
			}
			
		}
		
		function validateLoop(){
			if(fieldList.length==0){
				if(callback){
					callback(isValid);
				}
				return;
			}
			
			var fieldName = fieldList.shift();
			var field;
			if((typeof fieldName)=='object'){
				field = fieldName;
				fieldName = field.name;
			}else{
				field = fieldName;
			}
			var checkValue = record.get?record.get(fieldName):record[fieldName];
			
			self.validateField(field, checkValue, function(valid){
				isValid = valid;
				if(!valid){
					if(callback){
						callback(false);
					}
					return
				}
				
				validateLoop();
			});
		}
		
		validateLoop();
	}
	
	model.prototype.validateField = function(field, value, callback){
		var self = this;
		if((typeof field)=='string'){
			field = this._fields[field];	
		}
		
		var isValid = false;
		
		if(field){
			var validations = field.validators;
			
			var valList = [];
			
			for(var key in validations){
			
				valList.push(key);
			}
			
			var self = this;
			
			function validationLoop(){
				if(valList.length==0){
					if(callback){
						callback(isValid);
					}
					return;
				}
				
				var validationName = valList.shift();
				
				var options = field.validators[validationName];
				
				validation = validations[validationName];
				if((typeof validation)!='function'){
					if(self._validators[validationName]){
						validation = self._validators[validationName];
					}else{
						//load the validator function
						console.log('TODO: LOAD OTHER VALIDATIONS FROM FILE');
						console.log(validationName);
					}
				}
				
				validation.call(self, value, options, function(valid){
					
					if(!valid){
						
						isValid = false;
						if(callback){
							callback(isValid);
						}
					}else{//that one was valid, next
						
						isValid = true;
						validationLoop();
					}
				});
			}
			
			validationLoop();
		}
	}
	
	model.prototype.addField = function(name, fieldCfg, callback){
		
		if((typeof name)=='object'){
			if((typeof fieldCfg)=='function'){
				callback = fieldCfg;
			}
			fieldCfg = name;
			name = name.name;
		}
		
		this._fields[name] = fieldCfg;
		if(callback){
			callback(false, fieldCfg);
		}
	}
	
	model.prototype.removeField = function(name, validator, callback){
		delete this._fields[name];
	}
	
	model.prototype.getField = function(name, callback){
		if(callback){
			callback(false, this._fields[name]);
		}
		return this._fields[name];
	}
	
	model.prototype.getFields = function(){
		return this._fields;
	}
