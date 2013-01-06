var FluxNode = require('../../../FluxNode').FluxNode;

var WebNode = new FluxNode({
	mixins:[
		{
			name: 'webserver',
			options:{
				port:8080,
				autoStart: true,
				webroot: __dirname+'/webroot/'
			}
		}
	]
}, function(nd){
	var thisNode = nd;
	
	thisNode.Webserver_startServer();
}); 
