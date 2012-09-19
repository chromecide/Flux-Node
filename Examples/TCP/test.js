
var FluxNode;
var myNode = null;

FluxNode = require('../../lib/FluxNode').FluxNode;

myNode = new FluxNode({
	delimiter:'.',
	wildcard:true
});
	
myNode.mixin('FluxNodeUI_0.0.1', {}, function(){
	myNode.mixin(
		'TCP', 
		{
			host: '10.0.0.8',
			port: 8080
		},
		function(){
			myNode.emit('*', 'HelloWorld', {
				my: 'Custom Data'
			});
		}
	);
});

