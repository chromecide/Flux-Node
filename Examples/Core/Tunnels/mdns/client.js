
FluxNode = require('../../../../FluxNode.js').FluxNode;
run();

function run(){
	new FluxNode({
		mixins:[
			{
				name: 'Rules/RuleManager.js',
				options: {
					rules: [
						{
							name: 'DEBUG CONNECT',
							topic: 'Tunnel.Ready',
							criteria:[],
							actions:[
								function(FNode, destinationId, tunnel){
									console.log('CONNECTED TO: '+destinationId);
									FNode.sendEvent(destinationId, 'Hello.Server', {
										message: 'Our First Message'
									});
								}
							]
						},
						{
							name: 'DEBUG CONNECT',
							topic: 'Hello.Response',
							criteria:[],
							actions:[
								function(FNode, message, rawMessage){
									console.log('The Server Responded with: '+message.message);
								}
							]
						},
						{
							name: 'AutoConnect FluxNodes',
							topic: 'MDNS.Service.Up',
							criteria: [
								function(FNode, service, rawMessage){
									if(service.type.name=='FluxNode'){
										if(service.name==FNode.getSetting('FluxMDNS.name')){
											//it's us
											return false;
										}else{
											return true;
										}
									}
									return false;
								}
							],
							actions: [
								{
									name: 'Connect To Remote FluxNode',
									action: function(FNode, message, rawMessage){
										FNode.addTunnel({
											type: 'TCP',
											options:{
												host: message.host,
												port: message.port
											}
										})
									}
								}
							]
						}
					]
				}
			},
			{
				name: 'fs_mdns'
			}
		]
	}, function(myNode){
		console.log('FluxNode Started');
	});
}