
var FluxNode;
var myNode = null;

if (typeof define === 'function' && define.amd) {
	require(['FluxNode/index'], function(FN){
		FluxNode = FN;
		run();
	});
} else {
	FluxNode = require('../../node_modules/FluxNode').FluxNode;
	run();
}

function run(){
	myNode = new FluxNode({
		mixins: [
			{
				name: 'FluxNode-Websockets/index'
			}
		]
	});
	
	myNode.on('HelloWorld', function(message, rawMessage){
		//we don't need to worry about determining if this is browser or nodejs, because in this instance, this event is only sent by the browser
		console.log(rawMessage._message.sender+' sent:'+message.CustomMessageProperty);
		myNode.sendEvent(rawMessage._message.sender, 'HelloRightBack', {NewCustomProperty: 'Hello Right Back At You!!!'})
	});
	
	myNode.on('HelloRightBack', function(message, rawMessage){
		//we don't need to worry about determining if this is browser or nodejs, because in this instance, this event is only sent by the server
		console.log(rawMessage._message.sender+' sent: '+message.NewCustomProperty);
	});
	
	myNode.on('tunnelready', function(destination){
		//send a message to the websocket server
		if(myNode._environment=='browser'){
			console.log('Sending Hello World');
			myNode.sendEvent(destination, 'HelloWorld', {CustomMessageProperty: 'CustomValue'});
		}
	});
}

