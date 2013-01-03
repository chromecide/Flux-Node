
var FluxNode = require('../../../FluxNode.js').FluxNode;
	new FluxNode({
		name: 'Fake Service Node 2',
		listeners:{
			'MDNS.Service.Up': function(service){
				console.log(service.type.name+' Service Up(port: '+service.port+'): '+service.name);
			},
			'MDNS.Service.Down': function(service){
				console.log(service.type.name+' Service Down(port: '+service.port+'): '+service.name);
			}
		},
		mixins:[
			{
				name: 'fs_mdns',
				options:{
					browsers: [
						{
							name: 'Custom Service Browser',
							protocol: 'tcp',
							type: 'CustomService'
						}
					]
				}
			}
		]
	}, function(myNode){
		console.log('Node Ready');
	});
