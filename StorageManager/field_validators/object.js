if (typeof define === 'function' && define.amd) {
	define([], function(){
		return fieldValidator;
	});
}else{
	exports.validator = fieldValidator;
}

	function fieldValidator(check, options, callback){
		var modelInst = this;
		var isValid = true;
		
		//DO VALIDATION HERE
		if((typeof check)!='object'){
			isValid = false;
			if(callback){
				callback(isValid, check);
			}
		}else{
			if(options){
				if(options.fields){
					//we need to validate each field, so build a validator object that can be used by the models validateFIeld function
					modelInst.validate(check, options.fields, function(objectValid){
						isValid = objectValid; 
						if(callback){
							callback(isValid);
						}
					});
				}
			}else{
				isValid = true;
						
				if(callback){
					callback(isValid, check);
				}
			}
		}
	}