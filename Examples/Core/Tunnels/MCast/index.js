var FluxNode = require('../../../../FluxNode').FluxNode;

new FluxNode({
	id: 'Node2', //change this for each instance you start
	//debug: true,
	listeners:{
		'Tunnel.Ready': function(destination, tunnel){
			var thisNode = this;
			if(!thisNode.currentMessageNum){
				thisNode.currentMessageNum = 1;
			}
			
			thisNode.sendEvent(destination, 'MessageTest', {
				number: thisNode.currentMessageNum
			});
			
			thisNode.currentMessageNum++;
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
			name: 'MCastTunnels',
			options:{
				server:{
					address: '0.0.0.0'//this needs to be set to the local ip address when run on Windows based machines
				}
			}
		}
	]
}, function(thisNode){
	
	console.log('STARTED');
});
