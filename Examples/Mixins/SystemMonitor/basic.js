var FluxNode = require('../../../FluxNode').FluxNode;

new FluxNode({
	listeners:{
		'SystemMonitor.Heartbeat': function(values){
			console.log(values);
		}
	},
	mixins:[
		{
			name: 'SystemMonitor'
		}
	]
});
