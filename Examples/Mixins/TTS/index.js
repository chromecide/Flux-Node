var FluxNode = require('../../../FluxNode.js').FluxNode;

new FluxNode({
	mixins:[
		{
			name:'TTS'
		}
	]
}, function(thisNode){
	thisNode.emit('TTS.Speak', {
		text: 'Hello World!'
	});
	
	thisNode.on('CustomEvent', function(message){
		thisNode.emit('TTS.Speak', {
			text: message.text
		});
	});
	
	setTimeout(function(){
		thisNode.emit('CustomEvent', {text: 'Something was updated.'})
	}, 5000);
});
