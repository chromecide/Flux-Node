var myNode

requirejs.onError = function(){
	console.log('ERROR');
}

require(['FluxNode'], function(FN){ //successful load of dependencies
	FluxNode = FN;
	new FluxNode({
		mixins:[
			{
				name: 'websockets'
			}
		]
	}, function(nd){
		myNode = nd;
		
		myNode.on('tunnelready', function(destination){
			myNode.ServerID = destination; //when connecting via a websocket for examples like this, we'll only ever have 1 tunnel open, which is to the server
		});
		
		myNode.on('Require.Error', function(err){
			if(err.id.indexOf('socket.io.js')>-1){
				alert('Could not connect to Websocket Server.  Please ensure you started the server.');
			}else{
				alert('Could not load: '+err.id);
			}
		});
		
		myNode.on('Welcome', function(){
			alert('The Server said Welcome');
		});
	});	
	
});
	
