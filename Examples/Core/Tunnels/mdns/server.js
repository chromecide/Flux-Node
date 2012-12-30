
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
							name: 'Hello Server Response',
							topic: 'Hello.Server',
							criteria: [],
							actions: [
								function(FNode, message, rawMessage){
									console.log(message.message);
									FNode.sendEvent(rawMessage._message.sender, 'Hello.Response', {
										message: 'And our first response'
									});
								}
							]
						},
						{
							name: 'FluxNode MDNS Ad',
							topic: 'TCPServer.Started',
							criteria:[],
							actions:[
								{
									name: 'Start MDNS',
									action: function(FNode, message, rawMessage){
										FNode.setSetting('FluxMDNS', 
											{
												name: 'MyNode',
												type: 'FluxNode',
												port: message.port
											}
										);
										FNode.emit('MDNS.StartAd', {
											name: 'MyNode',
											type: 'FluxNode',
											port: message.port
										});
									}
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
										console.log('RUNNING CONNECT ACTION');
									}
								}
							]
						}
					]
				}
			},
			{
				name: 'fs_mdns'
			},
			{
				name: 'TCPServer',
				options:{
					//port:9001
				}
			}
		]
	}, function(myNode){
		console.log('FluxNode Started');
	});
}