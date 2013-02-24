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
		if(!Array.isArray(check)){
			isValid = false;
			if(callback){
				callback(isValid, check);
			}
		}else{
			if(options){
				if(options.validators){
					var checkItems = [];
					for(var i=0;i<check.length;i++){
						checkItems.push(check[i]);
					}
					
					function validateLoop(){
						if(checkItems.length==0 || isValid==false){
							if(callback){
								callback(isValid);
							}
							return;
						}
						
						var checkItem = checkItems.shift();
						
						modelInst.validateField(checkItem, options.validators, function(itemValid){
							if(!itemValid){
								isValid = false;
							}
							validateLoop();
						});	
					}
					
					validateLoop();
				}
			}else{
				isValid = true;
						
				if(callback){
					callback(isValid, check);
				}
			}
		}
	}