var FluxNode = require('../../../../FluxNode').FluxNode;

new FluxNode({
	mixins:[
		{
			name: 'websockets'
		}
	]
}, function(myNode){
	// when a FluxNode connects, send them a custom welcome message
	myNode.on('Tunnel.Ready', function(destination, tunnel){
		myNode.sendEvent(destination, 'Welcome', {
			username: 'Guest'
		});
	});
});
