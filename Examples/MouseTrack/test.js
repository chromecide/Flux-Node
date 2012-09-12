
var FluxNode;
var myNode = null;

if (typeof define === 'function' && define.amd) {
	require(['../../lib/FluxNode_0.0.1'], function(FN){
		FluxNode = FN;
		run();
	});
} else {
	FluxNode = require('../../lib/FluxNode_0.0.1').FluxNode;
	run();
}

function run(){
	myNode = new FluxNode({
		delimiter:'.',
		wildcard:true
	});
		
	myNode.mixin('FluxNodeUI_0.0.1', {}, function(){
		myNode.mixin(
			'Websockets', 
			{
				host: '10.0.0.12',
				port: 8080
			},
			function(){
				myNode.mixin(
					'mousetrack', 
					{
						events:[
							'Move'
						]
					},
					function(){
						//done loading, not necessarily successfully
					}
				);	
			}
		);
	})
}

