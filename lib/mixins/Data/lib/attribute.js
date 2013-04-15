;!function(exports, undefined) {
	var fs = require('fs');
	var attributeTypes = {};
	
	var fileList = fs.readdirSync(__dirname+'/attributes/');
	for(var i=0;i<fileList.length;i++){
		var attrType = require(__dirname+'/attributes/'+fileList[i]).Attribute;
		attributeTypes[attrType.name] = attrType;
	}
	
	function attribute(cfg){
		this.name = cfg.name;
		this.label = cfg.label===undefined?cfg.name:cfg.label;
		this.required = cfg.required===undefined?false:cfg.required;
		this.type = cfg.type===undefined?'Attribute':cfg.type;
		this.hasMany = cfg.hasMany===undefined?false:cfg.hasMany;
		
		if(this.type!='Attribute'){
			//first see if the attribute type is one of the built in types
			if(attributeTypes[this.type]){
				var attrType = attributeTypes[this.type];
				//copy any functions/properties from the type to this attribute instance 
				for(var key in attrType){
					if(key!='name'){
						this[key] = attrType[key];	
					}
				}
			}
		}
		
		for(var key in cfg){
			//if it's not a built in item, add it
			if(key!='name' && key!='label' && key!='required' && key!='type' && key!='hasMany'){
				this[key] = cfg[key];
			}
		}
	}
		
		attribute.prototype.normalize = function(value){ //no normalization is performed
			return value;
		}
		
		attribute.prototype.validate = function(value){
			if(this.required==true && value===undefined){
				return false;	
			}
			
			return true;
		}
		
		attribute.prototype.get = function(data){
			return data[this.name];
		}
		
		attribute.prototype.set = function(data, value){
			data[this.name] = value;
		}

		attribute.prototype.toObject = function(){
			var attributeCfg = {
				name: this.name,
				type: this.type,
				label: this.label,
				required: this.required,
				hasMany: this.hasMany
			}
			
			for(var key in this){
				switch(key){
					case 'name':
					case 'label':
					case 'required':
					case 'hasMany':
					case 'type':
					case 'normalize':
					case 'validate':
					case 'get':
					case 'set':
					case 'toObject':
						break;
					default:
						attributeCfg[key] = this[key];
						break;
				}
			}
			
			return attributeCfg;
		}
	if (typeof define === 'function' && define.amd) {
		define(function() {
			return attribute;
		});
	} else {
		exports.Attribute = attribute;
	}

}(typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);