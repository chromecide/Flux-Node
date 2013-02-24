var fs = require('fs');
var mixinFunctions = {
	init: function(cfg, callback){
		var thisNode = this;
		//add properties that are needed by this mixin
	
		//add Events that are emitted by this mixin
		
		
		//should be called when the mixin is actually ready, not simp;y at the end of the init function
		var mixinReturn = {
			name: 'JSONReader',
			config: cfg
		}
		
		if(callback){
			callback(mixinReturn);
		}
		
		thisNode.on('JSONReader.Load', function(message, rawMessage){
			thisNode.JSONReader_loadJSON(message.path, function(err, obj){
				if(rawMessage && rawMessage._message.sender){
					thisNode.sendEvent(rawMessage._message.sender, 'JSONReader.Load.Response', obj, rawMessage._message.id);
				}
			});
		});
		
		thisNode.emit('Mixin.Ready', mixinReturn);
	},
	JSONReader_loadJSON: function(path, callback){
		var thisNode = this;
		fs.exists(path, function(exists){
			if(exists){
				try{
					var jsonContent = require(path);
					if(callback){
						callback(false, jsonContent);
					}	
				}catch(e){
					if(callback){
						callback(true, e);
					}
				}
				
			}
		});
	}
}

if (typeof define === 'function' && define.amd) {
	define(mixinFunctions);
} else {
	module.exports = mixinFunctions;
}
	