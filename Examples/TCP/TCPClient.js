
var FluxNode;
var myNode = null;

FluxNode = require('../../lib/FluxNode_0.0.1').FluxNode;

myNode = new FluxNode({
	delimiter:'.',
	wildcard:true
});
	
myNode.mixin('FluxNodeUI_0.0.1', {}, function(){
	myNode.mixin(
		'TCP', 
		{
			host: '10.0.0.12',
			port: 8080
		},
		function(){
			myNode.on('tcp_serverstarted', function(){
				myNode.tcpConnect({host:'10.0.0.8', port: 8080});
			});
			setInterval(sendHelloWorld, 5000);
		}
	);
});


function sendHelloWorld(){
	console.log('Emitting');
	myNode.emit('*.HelloWorld', {
		CustomData: 'Goes Here'
	});
}