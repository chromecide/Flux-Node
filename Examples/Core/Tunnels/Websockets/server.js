var FluxNode = require('../../../../FluxNode').FluxNode;

new FluxNode({
	mixins:[
		{
			name: 'WebsocketTunnels'
		},
		{
			name: 'Webserver',
			options: {
				port:8081,
				webroot: __dirname,
				autoStart: true
			}
		}
	]
}, function(myNode){
	// when a FluxNode connects, send them a custom welcome message
	myNode.on('Tunnel.Ready', function(destination, tunnel){
		myNode.sendEvent(destination, 'Welcome', {
			username: 'Guest'
		});
	});
	
	myNode.on('GetList', function(message, rawMessage){
		myNode.sendEvent(rawMessage._message.sender, 'GetList.Response', [
			'item1',
			'item2',
			'item3',
			'item4',
			'item5',
			'item6',
		]);
	});
});
