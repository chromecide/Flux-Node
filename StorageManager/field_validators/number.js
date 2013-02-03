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
		if((typeof check)!='number'){
			isValid = false;
		}else{
			if(!isNan(check)){
				isValid = false;
			}else{
				if(options){
					if(options.min){
						if(check<options.min){
							isValid = false;
						}
					}
					
					if(options.max){
						if(check>optins.max){
							isValid = false;
						}
					}
				}
			}
		}
		
		if(callback){
			callback(isValid, check);
		}
		
		return isValid;
	}