var FluxNode = require('../../../FluxNode').FluxNode;

new FluxNode({
	mixins: [
		{
			name: 'debug',
			options:{
				events: true
			}
		},
		{
			name: 'MCast',
			options: {
				servers:[
					{
						name: 'FluxNode',
						options:{
							events: '*',
							multicast: '224.0.0.43'
						}
					}
				]
			}
		}
	]
}, function(thisNode){
	setInterval(function(name, message){
		thisNode.MCast_sendMessage(name, message);
	}, 1000, 'FluxNode', {
		topic: thisNode.id+'.mcast.heartbeat',
		message: {
			port: 8080,
			type: 'tcp'
		}
	});
});
