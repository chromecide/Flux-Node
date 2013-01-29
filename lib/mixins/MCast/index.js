var caster = require('caster');

var mixinFunctions = {
	init: function(cfg, callback){
		var thisNode = this;
		//add properties that are needed by this mixin
		thisNode.setSetting('MCast', {
			Servers:{},
			Peers: {}
		})
		//add Events that are emitted by this mixin
		if(cfg.servers){
			for(var i=0;i<cfg.servers.length;i++){
				thisNode.MCast_createServer(cfg.servers[i].name, cfg.servers[i].options);	
			}
		}
		
		//should be called when the mixin is actually ready, not simp;y at the end of the init function
		var mixinReturn = {
			name: 'MCast',
			config: cfg
		}
		
		if(callback){
			callback(mixinReturn);
		}
		
		thisNode.emit('Mixin.Ready', mixinReturn);
	},
	MCast_createServer: function(name, options, callback){
		
		var thisNode = this;
		var server = caster.create(options);
		
		server.on('message', function(buff, remote){
			
			var messageStr = buff.toString();
			var message = JSON.parse(messageStr);
			
			var topicParts = message.topic.split('.');
			
			//see if the peer is in our peers list
			var peerId = topicParts[0];
			var peer = thisNode.getSetting('MCast.Peers.'+peerId);
			
			if(!peer){
				thisNode.setSetting('MCast.Peers.'+peerId, {});
				if(peerId!=thisNode.id){
					thisNode.emit('MCast.'+name+'.Peer.Joined', peerId);
				}
			}
			
			if(peerId!=thisNode.id){
				thisNode.emit(message.topic, message.message);
			}
			
		});
		
		thisNode.setSetting('MCast.Servers.'+name, {
			server: server,
			config: options
		});
		
		var relayFunc = function(castName){
			return function(message, rawMessage){
				var eventName = thisNode.event;
				var topicParts = eventName.split('.');
				var peerId = topicParts[0];
				var peer = thisNode.getSetting('MCast.Peers.'+peerId);
				if(!peer){ //if the event did not come from a peer
					thisNode.MCast_sendMessage(name, {topic: thisNode.id+'.'+thisNode.event, message: message});	
				}
			}
		}
		
		if(options.events){
			var relayCB = relayFunc(name);
			thisNode.setSetting('MCast.Servers.'+name+'.relay', relayCB);
			
			if(Array.isArray(options.events)){
				for(var i=0;i<options.events;i++){
					var eventName = options.events[i];
					thisNode.on(eventName, relayCB);
				}
			}else{
				if(options.events=='*' || options.events===true){
					thisNode.onAny(relayCB);
				}
			}
		}
		
		server.bind(function(err){
			
		});
	},
	MCast_relay: function(message){
		var thisNode = this;
		
		var eventName = thisNode.event;
		thisNode.MCast_sendMessage()
	},
	MCast_sendMessage: function(name, message, callback){
		var thisNode = this;
		if(message.topic==thisNode.id+'.FluxNode.Ready'){
			message.message = {
				id: thisNode.id
			}
		}
		
		var strMessage = JSON.stringify(message);
		var buff = new Buffer(strMessage);
		var server = thisNode.getSetting('MCast.Servers.'+name+'.server');
		
		server.send(buff, function(err, bytes){
			if(callback){
				callback(err, bytes);
			}
		});
	}
}

if (typeof define === 'function' && define.amd) {
	define(mixinFunctions);
} else {
	module.exports = mixinFunctions;
}