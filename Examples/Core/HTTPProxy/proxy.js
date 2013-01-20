var FluxNode = require('../../../FluxNode').FluxNode;

new FluxNode({
	mixins:[
		{
			name: 'HTTPProxy',
			options:{
				hosts: [
					{
						name: 'Website 1',
						inHost: 'site1.fluxnode.local',
						inPort: 8000,
						outHost: '127.0.0.1',
						outPort: 8081
					},
					{
						name: 'Website 2',
						inHost: 'site2.fluxnode.local',
						inPort: 8000,
						outHost: '127.0.0.1',
						outPort: 8082
					}
				]
			}
		}
	]
},
function(thisNode){
	
});
