if (typeof define === 'function' && define.amd) {
	define([], function(){
		return dateValidator;
	});
}else{
	exports.validator = dateValidator;
}

	function dateValidator(check, options, callback){
		var isValid = false;
		if(check instanceof Date){
			isValid = true;
		}else{
			if((typeof check)=='string'){
				//need to validate the string
				isValid = isDate(check);
			}
		}
		
		if(callback){
			callback(isValid, check);
		}
		
		return isValid;
	}


	function isDate(dateStr) {
		var datePat = /^(\d{1,2})(\/|-)(\d{1,2})(\/|-)(\d{4})$/;
		var matchArray = dateStr.match(datePat); // is the format ok?
		
		if (matchArray == null) {
			return false;
		}else{
			day = matchArray[1]; // p@rse date into variables
			month = matchArray[3];
			year = matchArray[5];
			
			if (month < 1 || month > 12) { // check month range
				return false;
			}
			
			if (day < 1 || day > 31) {
				return false;
			}
			
			if ((month==4 || month==6 || month==9 || month==11) && day==31) {
				return false;
			}
			
			
			if (month == 2) { // check for february 29th
				var isleap = (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0));
				if (day > 29 || (day==29 && !isleap)) {
					alert("February " + year + " doesn`t have " + day + " days!");
					return false;
				}
			}	
		}
		
		return true; // date is valid
}