var FluxNode = require('../../FluxNode').FluxNode;

var WebNode = new FluxNode({
	mixins:[
		{
			name: 'FNM-WebServer',
			options:{
				port:8080
			}
		}
	]
}, function(nd){
	var thisNode = nd;
	
	thisNode.FNMWebserver_startServer();
}); 
