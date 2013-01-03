var NodeHost = '10.0.0.16'; 
var NodePort = 9000;

var FluxNode = require('../../../../FluxNode.js').FluxNode;
	
new FluxNode({
	name: 'Flux Node 1',
	listeners:{
		'TCPTunnels.Listening': function(){
			console.log('Listening for FluxNode Connections');
		},
		'Tunnel.Ready': function(destination, tunnel){
			console.log('Tunnel Ready for: '+tunnel.name+' ('+destination+')');
		},
		'Tunnel.Closed': function(destination){
			console.log('Tunnel Closed for: '+tunnel.name+' ('+destination+')');
		},
		'MyCustomMessage': function(message, rawMessage){
			console.log(message);
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
});
