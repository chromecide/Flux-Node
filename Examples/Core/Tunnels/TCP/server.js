
var FluxNode = require('../../../../FluxNode').FluxNode;
var myNode = null;
myNode = new FluxNode({
	id: '4d1cb28a-90af-4972-bd21-f3f296290849',
	mixins: [
		{
			name: 'TCPServer',
			options:{
				host: 'localhost',
				port: 8081
			}
		}
	]
});

myNode.on('Hello.World', function(message, rawMessage){
	//we don't need to worry about determining if this is browser or nodejs, because in this instance, this event is only sent by the browser
	console.log(rawMessage._message.sender+' sent:'+message.CustomMessageProperty);
	myNode.sendEvent(rawMessage._message.sender, 'HelloRightBack', {NewCustomProperty: 'Hello Right Back At You!!!'})
});

myNode.on('HelloRightBack', function(message, rawMessage){
	//we don't need to worry about determining if this is browser or nodejs, because in this instance, this event is only sent by the server
	console.log(rawMessage._message.sender+' sent: '+message.NewCustomProperty);
});

myNode.on('Tunnel.Ready', function(destination){
	console.log('connection recieved from: '+destination);
});

