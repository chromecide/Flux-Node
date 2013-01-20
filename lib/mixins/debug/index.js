var mixinFunctions = {
	init: function(cfg, callback){
		var thisNode = this;
		//add properties that are needed by this mixin
	
		//add Events that are emitted by this mixin
		
		if(cfg && cfg.events && Array.isArray(cfg.events)){
			for(var i=0;i<cfg.events.length;i++){
				thisNode.on(cfg.events[i], thisNode.debug_consoleLogEvent, thisNode);
			}
		}else{
			if(cfg && cfg.events){
				if(cfg.events===true || cfg.events=='*'){
					//listen for all events
					console.log('LISTENING FOR ALL EVENTS');
					thisNode.onAny(thisNode.debug_consoleLogEvent, thisNode);
				}
			}
		}
		//should be called when the mixin is actually ready, not simp;y at the end of the init function
		if(callback){
			callback(thisNode);
		}
		
		thisNode.emit('Mixin.Ready', {
			name: 'MyMixinName'
		});
	},
	debug_consoleLogEvent: function(message, rawMessage){
		console.log('EMITTED: '+this.event);
		//console.log('EMITTED: '+rawMessage._message.topic);
	}
}

if (typeof define === 'function' && define.amd) {
	define(mixinFunctions);
} else {
	module.exports = mixinFunctions;
}
	