var mixinFunctions = {
	init: function(cfg, callback){
		var thisNode = this;
		//add properties that are needed by this mixin
	
		//add Events that are emitted by this mixin
		
		thisNode.FluxUI_getWorkspace(false, function(workspace){
			console.log(workspace);
			thisNode.emit('Mixin.Ready', {
				name: 'GroupSecurity.AdminClient'
			});
			
			if(callback){
				callback(thisNode);
			}	
		});
		//should be called when the mixin is actually ready, not simp;y at the end of the init function
		
	}
}

if (typeof define === 'function' && define.amd) {
	define(mixinFunctions);
} else {
	module.exports = mixinFunctions;
}