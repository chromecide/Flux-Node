var say = require('say');

var mixinFunctions = {
	init: function(cfg, callback){
		var thisNode = this;
		
		//add properties that are needed by this mixin
		thisNode.addSetting('TTS', {
			defaultVoice: 'Victoria'
		},{
			object: {
				fields: {
					name: "Default Voice",
			  		description: "The default voice to use when none is supplied with the TTS.Speak Topic.",
			  		validators: {
			  			"string": {}
			  		}
				}
			}
		});
	
		//add Events that are emitted by this mixin
		
		
		//should be called when the mixin is actually ready, not simply at the end of the init function
		var mixinReturn = {
			name: 'TTS',
			meta: require(__dirname+'/package.json'),
			config: cfg
		}
		
		thisNode.on('TTS.Speak', function(message, rawMessage){
			thisNode.TTS_speakText(message.text, message.voice);	
		});
		
		if(callback){
			callback(mixinReturn);
		}
		
		thisNode.emit('Mixin.Ready', mixinReturn);
	},
	TTS_speakText: function(text, voice, callback){
		var thisNode = this;
		if((typeof voice)=='function'){
			callback = voice;
			voice = thisNode.getSetting('TTS.defaultVoice');
		}
		
		if(!voice){
			voice = 'Victoria';
		}
		
		say.speak(voice, text);
		return true;
	}
}

if (typeof define === 'function' && define.amd) {
	define(mixinFunctions);
} else {
	module.exports = mixinFunctions;
}
	