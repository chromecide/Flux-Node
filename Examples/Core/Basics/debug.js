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
			name: 'TCPTunnels'
		}
	]
});
