if (typeof define === 'function' && define.amd) {
	define([], function(){
		return fieldValidator;
	});
}else{
	exports.validator = fieldValidator;
}

	function fieldValidator(check, options, callback){
		var isValid = true;
		
		//DO VALIDATION HERE
		if((typeof check)!='string'){
			isValid = false;
		}else{
			if(options){
				if(options.maxLength){
					if(check.length>options.maxLength){
						isValid = false;
					}
				}
				
				if(options.minLength){
					if(check.length<options.minLength){
						isValid = false;
					}
				}
			}
		}
		
		if(callback){
			callback(isValid, check);
		}
		
		return isValid;
	}