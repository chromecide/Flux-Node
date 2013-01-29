var NodeHost = '10.0.0.16'; 
var NodePort = 9001;

var remoteHost = '10.0.0.16';
var remotePort = 9000;

var FluxNode = require('../../../../FluxNode.js').FluxNode;
	
new FluxNode({
	id: 'FluxNode2',
	listeners:{
		'Tunnel.Ready': function(destination, tunnel){
			var thisNode = this;
			console.log('Tunnel Ready for: '+destination);
			//send a custom message
			thisNode.sendEvent(destination, 'MyCustomMessage', {
				MyMessage: 'MyValue',
				AnotherProperty: 1234
			});
		},
		'Tunnel.Closed': function(destination){
			console.log('Tunnel Closed for: '+destination);
		}
	},
	mixins:[
		{
			name: 'TCPTunnels',
			options: {
				host: NodeHost,
				port: NodePort
			}
		}
	]
}, function(myNode){
	console.log('Node Ready');
	console.log('Connecting to Node 1');
	myNode.TCPTunnels_Connect(
		{
			host: remoteHost,
			port: remotePort
		}
	)
});
