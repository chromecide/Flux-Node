
var FluxNode = require('../../../FluxNode.js').FluxNode;
	new FluxNode({
		name: 'Fake Service Node 1',
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
					],
					ads: [
						{
							name: 'My Custom Node Name',
							protocol: 'tcp',
							type: 'CustomService', //must be 14 characters or less
							port: 9500,
							options:{
								autoStart: false //we want the ad created now, but we'll start it later when the FluxNode is ready
							}
						}
					]
				}
			}
		]
	}, function(myNode){
		console.log('Starting Custom Service App');
		
		myNode.emit('MDNS.Ad.Start',{
			name: 'My Custom Node Name'
		});
	});
