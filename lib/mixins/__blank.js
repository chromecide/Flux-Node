var mixinFunctions = {
	init: function(){
		var thisNode = this;
		//add properties that are needed by this mixin
	
		//add Events that are emitted by this mixin
		
	},
	myFunction: function(){
		return true;
	}
}

if (typeof define === 'function' && define.amd) {
	define(mixinFunctions);
} else {
	module.exports = mixinFunctions;
}
	