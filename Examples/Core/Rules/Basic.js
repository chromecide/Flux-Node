var FluxNode = require('../../../FluxNode.js').FluxNode;

new FluxNode({
	stores:[
		{
			id: 'RuleStore',
			type: 'Memory'
		}
	],
	mixins: [
		{
			name: 'rules/RuleManager',
			options: {
				store: 'RuleStore',
				buildStructure: true,
				rules: [
					{
						name: 'Do Something on Tick',
						topic: 'Tickers.default.Tick',
						criteria: [
							{
								attribute: 'Test',
								operator: '=',
								value: ''
							}
						],
						actions: [
							{
								action: 'emit',
								map: {
									topic: 'MySystem.HeartBeat',
									message:{
										NodeID: '{This.id}',
										time: '{input.time}'
									}
								}
							}
						]
					},
					{
						name: 'Save Heartbeat Record',
						topic: 'Tickers.default.Tick',
						criteria: [
							{
								attribute: 'StorageManager.Stores.RuleStore.Channels.Heartbeats',
								operator: 'contains',
							}
						],
						actions: [
							{
								action: 'emit',
								map: {
									topic: 'MySystem.HeartBeat',
									message:{
										NodeID: '{This.id}',
										time: '{input.time}'
									}
								}
							}
						]
					}
				]	
			}
		},
		{
			name: 'Tickers'
		}
	]
},
function(thisNode){
	thisNode.RuleManager_AddRule(
	{
		name: 'Do Heartbeat Response',
		topic: 'MySystem.HeartBeat',
		criteria: [
		
		],
		actions:[
			function(message, rawMessage){
				console.log('PERFORMING CUSTOM ACTON');
				console.log(arguments);
			}
		]
	}, function(){
		console.log(thisNode.StorageManager.getStore('RuleStore')._records);
	})
});
