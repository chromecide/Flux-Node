var colorize = require('colorize');

var FluxNode = require('../../../FluxNode.js').FluxNode;

new FluxNode({
	mixins:[
		{
			name:'telnet',
			options: {
				WelcomeMessage: colorize.ansify('#bgred[                                          ]\n#bgred[ ] Welcome to #bold[the] #blink[secret] #blue[server]\n'),
				Prompt: ':$'
			}
		}
	]
}, function(thisNode){
	thisNode.on('Telnet.Data', function(message, rawMessage){
		var messageParts = message.data.split(' ');
		switch(messageParts[0]){
			case 'hello':
				thisNode.emit('Telnet.Send', {
					socket: message.socket.FluxID,
					message: 'Hello right back'
				});
				break;
			case 'help':
				thisNode.emit('Telnet.Send', {
					socket: message.socket.FluxID,
					message: colorize.ansify('#cyan[System Commands]\n  hello\n  help\n  logout\n')
				});
				break;
			case 'logout':
				thisNode.emit('Telnet.Disconnect', {
					socket: message.socket.FluxID
				});
				break;
		}
	});
});
