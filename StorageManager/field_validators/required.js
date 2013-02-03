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
		if((typeof check)!='undefined' && check!=null && check!=undefined){
			isValid = true;
		}else{
			console.log('REQ NOT VALID');
		}
		
		if(callback){
			callback(isValid, check);
		}
		
		return isValid;
	}