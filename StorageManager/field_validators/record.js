if (typeof define === 'function' && define.amd) {
	define(['StorageManager/Record'], function(recordCtr){
		return modelValidatorBuilder(recordCtr);
	});
}else{
	var recordCtr = require('../Record.js');
	exports.validator = modelValidatorBuilder(recordCtr);
}

function modelValidatorBuilder = function(Record){
	return function(check, options, callback){
		var isValid = false;
		
		//DO VALIDATION HERE
		if(check instanceof Record){
			if(check.getModel() instanceof options.model){
				isValid = true;	
			}
			
			if(callback){
				callback(isValid, check);
			}
		}else{
			if((typeof check)=='object'){
				options.model.validate(check, function(valid){
					if(valid){
						isValid = true;
					}
					
					if(callback){
						callback(isValid, check);
					}
				});
			}
		}
	}
}
	