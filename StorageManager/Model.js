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
	
	exports.Model = model;
}
	//strict means ONLY the supplied fields are allowed.  if a supplied object has other fields, they will be ignored
	function model(name, fields, callback){
		this._fields = {
			id: {
				validators: {
					required:{}
				}
			}
		};
		
		if((typeof name)=='object'){
			if((typeof fields=='function')){
				callback = fields;
			}	
			fields = name.fields;
			name = name.name;
		}
		
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
				model: this
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
		'email': valEmail
	};
	
	model.prototype.validate = function(record){
		var fieldList = [];
		
		for(var key in this._fields){
			fieldList.push(key);
		}
		
		function validateLoop(){
			if(fieldList.length==0){
				if(callback){
					callback(isValid);
				}
				return;
			}
			
			var fieldName = fieldList.shift();
			this.validateField(field, record.get(fieldName), function(valid){
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
	
	model.prototype.validateField = function(name, value, callback){
		var field = this._fields[name];
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
						validation = self._validators[validationName]
					}else{
						//load the validator function
						console.log('TODO: LOAD OTHER VALIDATIONS FROM FILE');
						console.log(validationName);
					}
				}
				
				validation(value, options, function(valid){
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
		this._fields[name] = fieldCfg;
	}
	
	model.prototype.removeField = function(name, validator, callback){
		delete this._fields[name];
	}
	
	model.prototype.getFields = function(){
		return this._fields;
	}
