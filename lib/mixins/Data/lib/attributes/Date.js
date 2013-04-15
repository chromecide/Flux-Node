;!function(exports, undefined) {
	
	var attribute = {
		name: 'Date'
	};
	
	attribute.normalize = function(value){ //no normalization is performed
		return value+='';
	}
	
	attribute.validate = function(value){
		return true;
	}


	if (typeof define === 'function' && define.amd) {
		define(function() {
			return attribute;
		});
	} else {
		exports.Attribute = attribute;
	}

}(typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);