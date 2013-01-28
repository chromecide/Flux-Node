var FluxNode = require('../../../../FluxNode').FluxNode;
var currentMessageNum = 1;
new FluxNode({
	id: 'Node3',
	listeners:{
		'Tunnel.Ready': function(destination, tunnel){
			var thisNode = this;
			thisNode.sendEvent(destination, 'MESSAGE TEST-'+currentMessageNum, {});
			currentMessageNum++;
		}
	},
	mixins:[
		{
			name: 'debug',
			options:{
				events: true
			}
		},
		{
			name: 'MCastTunnels'
		}
	]
}, function(thisNode){
	
	console.log('STARTED');
});
