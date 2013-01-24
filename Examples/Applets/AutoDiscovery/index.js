var FluxNode = require('../../../FluxNode').FluxNode;
var os = require('os');

new FluxNode({
	name: os.hostname(),
	listeners:{
		'MDNS.Service.Up': function(advert){
			var thisNode = this;
			if(advert.type.name=='FluxNode'){
				console.log('FluxNode Found');
				//console.log(advert);
				if(advert.port!=thisNode.getSetting('TCPTunnels.port')){
					console.log(advert.addresses[0]);
					console.log(advert.port);
					var connectionCfg = {
						host: advert.addresses[0],
						port: advert.port
					};
					thisNode.TCPTunnels_Connect(connectionCfg);	
				}else{
					console.log('oh wait...that\'s me...');
				} 
				
			}
		},
		'MDNS.Service.Down': function(advert){
			if(advert.type.name=='FluxNode'){
				console.log('FluxNode Dissappeared');
			}
		},
		'Tunnel.Ready': function(destinationId, tunnel){
			var thisNode = this;
			console.log('Found FluxNode: '+tunnel.name+'(ID: '+destinationId+')');
			thisNode.sendEvent(destinationId, 'Hello', {message: 'Hellow There'});
		}
	},
	mixins:[
		{
			name: 'debug',
			options: {
				events: true
			}
		},
		{
			name: 'TCPTunnels',
			options:{
				host: '0.0.0.0',
				port: 'auto'
			}
		},
		{
			name: 'fs_mdns',
			options:{
				browsers: [
					{
						name: 'FluxNode_Browser',
						protocol: 'tcp'
					}
				]
			}
		}
	]	
}, function(thisNode){
	console.log('LISTENING on port '+thisNode.getSetting('TCPTunnels.port'));
	thisNode.MDNS_createAdvert('FluxNode', 'tcp', 'FluxNode', thisNode.getSetting('TCPTunnels.port'), function(){
		console.log(arguments);
	});
});
