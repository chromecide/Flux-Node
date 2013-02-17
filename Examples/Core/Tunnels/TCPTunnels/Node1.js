var NodeHost = '0.0.0.0';//this needs to be chnaged to the local IP when run on windows 
var NodePort = 9000;

var FluxNode = require('../../../../FluxNode.js').FluxNode;
	
new FluxNode({
	id: 'FluxNode1',
	listeners:{
		'TCPTunnels.Listening': function(){
			console.log('Listening for FluxNode Connections');
		},
		'Tunnel.Ready': function(destination, tunnel){
			console.log('Tunnel Ready for: '+destination);
		},
		'Tunnel.Closed': function(destination){
			console.log('Tunnel Closed for: '+destination);
		},
		'MyCustomMessage': function(message, rawMessage){
			var randomnumber=Math.floor(Math.random()*11);
			var thisNode = this;
			setTimeout(function(){
				console.log('sending message');
				thisNode.sendEvent(rawMessage._message.sender, 'MyCustomReply', {replyMessage: 'This is a reply'}, rawMessage._message.id);	
			}, randomnumber*1000);
			
		}
	},
	mixins:[
		{
			name: 'TCPTunnels',
			options: {
				host: NodeHost,
				port: NodePort
			}
		}
	]
}, function(myNode){
	console.log('Node Ready');
});
