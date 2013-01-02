
var FluxNode = require('../../../FluxNode.js').FluxNode;
	new FluxNode({
		name: 'Fake Service Node 2',
		host: '0.0.0.0',
		port: 9001,
		listeners:{
			'MDNS.Service.Up': function(service){
				if(service.type.name=='FluxNode'){
					console.log('FluxNode Service Up(port: '+service.port+'): '+service.name);	
				}
			},
			'MDNS.Service.Down': function(service){
				if(service.type.name=='FluxNode'){
					console.log('FluxNode Service Down(port: '+service.port+'): '+service.name);	
				}
			}
		},
		mixins:[
			{
				name: 'fs_mdns'
			}
		]
	}, function(myNode){
		console.log('Node Ready');
	});
