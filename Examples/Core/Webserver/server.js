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
}, function(){
	console.log('Server Started');
});
