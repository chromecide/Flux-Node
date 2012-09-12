var mixinFunctions = {
	init: function(){
		var self = this;
		//add properties that are needed by this mixin
	
		//add Events that are emitted by this mixin
		
	},
	FluxNodeUI_alert: function(title, message, callback){
		if((typeof alert) !='undefined'){
			alert(title, message, callback);
		}else{
			console.log(title+' - '+message);
			if(callback){
				callback();	
			}
		}
		
	},
	FluxNodeUI_confirm: function(title, message, callback){
		if(typeof confirm !='undefined'){
			var answer = confirm(message);
			if(callback){
				callback(answer);
			}	
		}else{
			console.log('Confirm request recieved:');
		}
		
	},
	FluxNodeUI_prompt: function(title, message, callback){
		prompt(title, message, callback);
	},
	FluxNodeUI_window: function(id, title, content){
		docu
	}
}

if (typeof define === 'function' && define.amd) {
	define(mixinFunctions);
} else {
	module.exports = mixinFunctions;
}
	