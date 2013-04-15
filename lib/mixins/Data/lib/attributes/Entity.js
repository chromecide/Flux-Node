;!function(exports, undefined) {
	
	var attribute = {
		name: 'Entity'
	};
	attribute.entityCtr = require(__dirname+'/../entity.js');
	
	attribute.normalize = function(value){ //no normalization is performed
		return value;
	}
	
	attribute.validate = function(value){
		console.log('RETURNING');
		return true;
	}

	attribute.get = function(data){
		console.log(this.entityCtr.Entity);
		var entity = new this.entityCtr.Entity(this.model, data[this.name]);
		return entity;
	}
	
	attribute.set = function(data, value){
		if((value instanceof this.entityCtr.Entity)==false){
			value = new this.entityCtr.Entity(this.model, value);	
		}
		//store the data as a standard object
		data[this.name] = value.toObject();
	}

	if (typeof define === 'function' && define.amd) {
		define(function() {
			return attribute;
		});
	} else {
		exports.Attribute = attribute;
	}

}(typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);