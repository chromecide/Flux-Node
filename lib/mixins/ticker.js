var mixinFunctions = {
	init: function(cfg, callback){
		var thisNode = this;
		//add properties that are needed by this mixin
	
		//add Events that are emitted by this mixin
		if(!cfg){
			cfg = {};
		}
		
		if(!cfg.interval){
			cfg.interval = 1000;
		}
		
		thisNode.once('FluxNode.Ready', function(){
			setInterval(function(){
				thisNode.emit('Ticker.Tick', {
					time: (new Date()).getTime()
				});
			}, cfg.interval);
		});
		//should be called when the mixin is actually ready, not simp;y at the end of the init function
		thisNode.emit('Mixin.Ready', {
			name: 'MyMixinName'
		});
		
		if(callback){
			callback(thisNode);
		}
	}
}

if (typeof define === 'function' && define.amd) {
	define(mixinFunctions);
} else {
	module.exports = mixinFunctions;
}
	