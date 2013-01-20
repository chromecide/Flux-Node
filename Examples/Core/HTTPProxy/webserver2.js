var FluxNode = require('../../../FluxNode').FluxNode;

new FluxNode({
	mixins:[
		{
			name: 'Webserver',
			options:{
				webroot: __dirname+'/webroot2',
				port: 8082,
				autoStart: true
			}
		}
	]
}, function(){
	console.log('Server Started');
});
