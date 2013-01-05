if (typeof define === 'function' && define.amd) {
	require(['FluxNode'], function(FN){
		FluxNode = FN;
		run();
	});
} else {
	FluxNode = require('../../../FluxNode.js').FluxNode;
	run();
}

function run(){
	new FluxNode({
		mixins:[
			{
				name: 'Rules/RuleManager.js',
				options: {
					rules: [
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
									console.log(service);
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
				name:'tickers',
				options: {
					name: 'SecondsTicker',
					interval: 5000
				}
			},
			{
				name: 'TCPServer',
				options:{
					//port:9001
				}
			}
		]
	}, function(myNode){
		
		/*myNode.RuleManager_AddRule([
			{
				name: 'Test Cron',
				topic: 'Ticker.Tick',
				criteria: [
					function(FNode, message, rawMessage){
						//only check once every minute
						if(message.ticker=='SecondsTicker'){
							return true;
						}else{
							return false;	
						}
					}
				],
				actions: [
					{
						name: 'Fire Cron',
						action: function(FNode, message, rawMessage){
							console.log('FIRING');
							FNode.emit('Some.Other.Event', message);
						}
					}
				]
			}
		],
		function(){
			myNode.RuleManager_GetRules({}, {}, function(err, records){
				if(!err){
					for(var i=0; i<records.length;i++){
						var record = records[i].record;
						console.log(record.name+' - '+record.topic);
						//console.log(record);
					}
				}
			})	
		});*/
	});
}