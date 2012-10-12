
var FluxNode = require('../../../FluxNode').FluxNode;
var myNode = null;
myNode = new FluxNode({
	tunnels: [
		{
			destination: '4d1cb28a-90af-4972-bd21-f3f296290849',
			type:'TCP',
			options:{
				host: '10.0.0.23',
				port: 8081
			}
		}
	]
});

myNode.on('tunnelready', function(destination){
	console.log('connection recieved from: '+destination);
	var thisNode = this;
	thisNode.sendEvent(destination, 'Hello.World', {
		CustomMessageProperty: 'test1'
	});
	thisNode.sendEvent(destination, 'Hello.World', {
		CustomMessageProperty: 'test2'
	});
});

