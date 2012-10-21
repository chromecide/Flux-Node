var FluxNode = require('../../../../FluxNode').FluxNode;

new FluxNode({
	mixins:[
		{
			name: 'websockets'
		}
	]
}, function(myNode){
	var connectedClients = [];
	
	// when a FluxNode connects, send them a custom welcome message
	myNode.on('Tunnel.Ready', function(destination, tunnel){});
	
	myNode.on('Connect', function(message, rawMessage){
		connectedClients.push(message);
		
		myNode.emit('Client.Connected', message);
		
		myNode.sendEvent(rawMessage._message.sender, 'Welcome', {
			clients: connectedClients
		});
	});
	
	myNode.on('Tunnel.Closed', function(message, rawMessage){
		console.log('deleting client');
		console.log(message);
		var disconnectedClient = false;
		
		for(var i=0;i<connectedClients.length;i++){
			if(connectedClients[i].id == message){
				disconnectedClient = connectedClients[i];
				connectedClients.splice(i, 1);
			}
		}

		myNode.emit('Client.Disconnected', disconnectedClient);
	});
});
