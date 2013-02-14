var FluxNode = require('../../../FluxNode').FluxNode;

new FluxNode({
	mixins:[
		{
			name: 'Webserver',
			options:{
				webroot: __dirname+'/webroot',
				port: 8080,
				autoStart: true
			}
		}
	]
}, function(thisNode){
	console.log('Server Started');
	thisNode.registerMiddleware('Webserver', 'Response.Recieved', function(req, resp, next){
		
		if(req.url=='/test'){
			resp.write('custom message');
			resp.end();
			thisNode.emit('Webserver.ResponseSent', {
				path: '/test'
			});
			next(false); //we don't want any other processing to be done on this request
		}else{
			next(true);
		}
	});
});
