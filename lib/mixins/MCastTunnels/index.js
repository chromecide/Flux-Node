var caster = require('caster');
//var tunnel = require(__dirname+'/MCastTunnel.js').Tunnel;

var mixinFunctions = {
	init: function(cfg, callback){
		var thisNode = this;
		//add properties that are needed by this mixin
		if(!cfg){
			cfg = {
				
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
				var destinationId = topicParts[1];
				if(peerId!=thisNode.id){ //not a message we sent
					if(message.topic==peerId+'.*.MCastTunnels.Announce' || message.topic==peerId+'.'+thisNode.id+'.MCastTunnels.Announce'){ //anounce to all or direct announce to this node
						
						//see if the peer already exists
						var peer = thisNode.getSetting('MCastTunnels.Peers.'+peerId);
						if(!peer){ //doesn't already exist, add
							
							thisNode.setSetting('MCastTunnels.Peers.'+peerId, {
								firstSeen: new Date(),
								lastSeen: new Date()
							});
							
							//create a new MCastTunnel Object
							var tunnel = thisNode.TunnelManager.factory('MCast').Tunnel;
							
							var newTunnel = new tunnel();
							newTunnel.setServer(server);
							newTunnel.peerId = peerId;
							thisNode.TunnelManager.registerTunnel(false, newTunnel);
						}else{ //already exists, updated last Seen
							thisNode.setSetting('MCastTunnels.Peers.'+peerId+'.lastSeen', new Date());
						}
					}
				}
			}
		});
		
		//add Events that are emitted by this mixin
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
			}else{
				console.log(err);	
			}
		});
		
		var interval = setInterval(function(){
			thisNode.MCastTunnels_doAnnounce();
		}, 5000);
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