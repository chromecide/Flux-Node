var caster = require('caster');
//var tunnel = require(__dirname+'/MCastTunnel.js').Tunnel;

var mixinFunctions = {
	init: function(cfg, callback){
		var thisNode = this;
		//add properties that are needed by this mixin
		if(!cfg){
			cfg = {
				server: {
					loopback: false
				}
			};
		}
		
		var serverOptions = cfg.server;
		var server = caster.create(serverOptions);
		
		thisNode.setSetting('MCastTunnels', {
			Server: server,
			Peers: {},
			Announcer: null
		});
		
		//message topics
		// NodeID.Topic.TopicSub
		// NodeID.DestinationID.Topic.TopicSub
		server.on('message', function(buff, rawMessage){
			var message = JSON.parse(buff.toString());
			if(message && message.topic){
				var topicParts = message.topic.split('.');
				var peerId = topicParts[0];
				var peerTunnel = thisNode.TunnelManager.getTunnel(peerId);
				var destinationId = topicParts[1];
				
				if(peerId!=thisNode.id){ //not a message we sent
					if(message.topic==peerId+'.*.MCastTunnels.Announce' || message.topic==peerId+'.'+thisNode.id+'.MCastTunnels.Announce'){ //anounce to all or direct announce to this node
						
						if(!peerTunnel){
							//create a new MCastTunnel Object
							var tunnel = thisNode.TunnelManager.factory('MCast').Tunnel;
							
							var newTunnel = new tunnel();
							newTunnel.setServer(server);
							newTunnel.peerId = peerId;
							newTunnel.localId = thisNode.id;
							newTunnel.remoteId = peerId;
							newTunnel.init(true);
							
							thisNode.TunnelManager.registerTunnel(peerId, newTunnel);
						}
					}else{
						if(message.topic==peerId+'.'+thisNode.id+'.init'){
							var tunnel = thisNode.TunnelManager.factory('MCast').Tunnel;
							
							var newTunnel = new tunnel();
							newTunnel.setServer(server);
							newTunnel.peerId = peerId;
							newTunnel.localId = thisNode.id;
							newTunnel.remoteId = peerId;
							newTunnel.init(false);
							
							thisNode.TunnelManager.registerTunnel(peerId, newTunnel);
						}
					}
				}
			}
		});
		
		server.bind(function(err){
			if(!err){
				var mixinReturn = {
					name: 'MCast',
					config: cfg
				}
				
				if(callback){
					callback(mixinReturn);
				}
				
				thisNode.emit('Mixin.Ready', mixinReturn);
				
				var interval = setInterval(function(){
					thisNode.MCastTunnels_doAnnounce();
				}, 5000);
				
				thisNode.MCastTunnels_doAnnounce();
			}else{
				console.log(err);	
			}
		});
		
	},
	MCastTunnels_doAnnounce: function(destination){
		var thisNode = this;
		var server = thisNode.getSetting("MCastTunnels.Server");
		var message = {
			topic: thisNode.id+'.'+(destination?destination+'.':'*.')+'MCastTunnels.Announce',
			message: {
				id: thisNode.id,
				time: new Date()
			}
		}
		
		var buffer = new Buffer(JSON.stringify(message));
		server.send(buffer, function(err, bytes){
		//	console.log(bytes, ' bytes written');
		});
	}
}

if (typeof define === 'function' && define.amd) {
	define(mixinFunctions);
} else {
	module.exports = mixinFunctions;
}