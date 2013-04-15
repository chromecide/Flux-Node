;!function(exports, undefined) {
	
	var attribute = {
		name: 'Calculated'
	};
	
	attribute.normalize = function(value){ //no normalization is performed
		return value;
	}
	
	attribute.validate = function(value){
		return (typeof value)=='function';
	}
	
	attribute.get = function(data, entity){
		return this.fn(data, entity);
	}
	
	if (typeof define === 'function' && define.amd) {
		define(function() {
			return attribute;
		});
	} else {
		exports.Attribute = attribute;
	}

}(typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);