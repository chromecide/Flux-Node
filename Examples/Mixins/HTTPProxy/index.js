var FluxNode = require('../../../FluxNode').FluxNode;

new FluxNode({
	mixins:[
		{
			name: 'HTTPProxy',
			options:{
				hosts: [
					{
						name: 'fluxnode.local (HTTP)',
						inHost: 'fluxnode.local',
						inPort: 8000,
						outHost: '127.0.0.1',
						outPort: 80
					},
					{
						inHost: 'thephone.fluxnode.local',
						inPort: 8000,
						outHost: '127.0.0.1',
						outPort: 8080
					}
				]
			}
		}
	]
},
function(thisNode){
	
});
