var mixinFunctions = {
	init: function(cfg, callback){
		var thisNode = this;
		//add properties that are needed by this mixin
	
		//add Events that are emitted by this mixin
		
		
		//should be called when the mixin is actually ready, not simp;y at the end of the init function
		thisNode.emit('Mixin.Ready', {
			name: 'MyMixinName'
		});
		
		if(callback){
			callback(thisNode);
		}
	},
	myFunction: function(){
		var thisNode = this;
		
		return true;
	}
}

if (typeof define === 'function' && define.amd) {
	define(mixinFunctions);
} else {
	module.exports = mixinFunctions;
}
	