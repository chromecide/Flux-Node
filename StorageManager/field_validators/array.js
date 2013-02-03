if (typeof define === 'function' && define.amd) {
	define([], function(){
		return fieldValidator;
	});
}else{
	exports.validator = fieldValidator;
}

	function fieldValidator(check, options, callback){
		var isValid = false;
		
		//DO VALIDATION HERE
		if(Array.isArray(check)){
			isValid = true;
		}
		
		if(callback){
			callback(isValid, check);
		}
		
		return isValid;
	}