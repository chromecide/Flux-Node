var mixinFunctions = {
	init: function(cfg){
		var self = this;
		//add properties that are needed by this mixin
		self.Chatrooms = {
			Settings:{
				AuthLevels: {
					AddRoom: 20
				}
			},
			ReservedNicks: {
				'SystemAdmin':{
					authtoken: 'root',
					authlevel:100
				}
			},
			ConnectedNodes: {
				
			},
			Rooms:{
				Help: {
					topic: 'Chatrooms Help Room',
					Owner: 'SystemAdmin',
					Users:[]
				}
			}
		};
		
		self.on('Chatrooms.Connect', function(message, rawMessage){
			var remoteNodeId = rawMessage._message.sender;
			var nick = message.nick;
			//make sure the node isn't already connected
			if(!self.Chatrooms.ConnectedNodes[remoteNodeId]){
				//register the node connection
				
				if(self.Chatrooms_NickInUse(nick)){
					self.sendEvent(remoteNodeId, 'Chatrooms.ConnectFailed', {
						error_id: 1,
						reason: 'Nick in Use'
					});
				}else{
					self.Chatrooms.ConnectedNodes[remoteNodeId] = {
						nick: nick,
						identified: false,
						connecttime: new Date()
					}
					
					if(self.Chatrooms_NickIsReserved(nick)){
						//set a timeout for 30 seconds that will automatically disconnect the node from the chatrooms if they don't identify for the reserved nick
						setTimeout(function(){
							delete self.Chatrooms.ConnectedNodes[remoteNodeId];
						}, 30000);
						//tell the node that they need to identify
						self.sendEvent(remoteNodeId, 'Chatrooms.ConnectFailed', {
							error_id: 2,
							reason: 'Reserved Nick,  Please Identify.'
						});
					}else{
						self.Chatrooms.ConnectedNodes[remoteNodeId].identified = true;
						self.sendEvent(remoteNodeId, 'Chatrooms.Connected', {});
					}
				}
			}
		});
		
		//disconnect from the chat rooms (does not disconnect the node)
		self.on('Chatrooms.Quit', function(message, rawMessage){
			var remoteNodeId = rawMessage._message.sender;
			if(self.Chatrooms.ConnectedNodes[remoteNodeId]){
				//TODO: Remove the Nodes Users from any Rooms they are a part of
				delete self.Chatrooms.ConnectedNodes[remoteNodeId];
			}
		});
		
		//Register a nick for reserved use
		self.on('Chatrooms.RegisterNick', function(message, rawMessage){
			var remoteNodeId = rawMessage._message.sender;
			var connectedNode = self.Chatrooms.ConnectedNodes[remoteNodeId];
			if(connectedNode){
				if(connectedNode.identified===true){
					var authtoken = message.authtoken;
					var nick = connectedNode.nick;
					var currentLevel = self.Chatrooms.ReservedNicks[nick]?self.Chatrooms.ReservedNicks[nick].authlevel:1;
					self.Chatrooms.ReservedNicks[nick] = {
						nick: nick,
						authtoken: authtoken,
						authlevel: currentLevel
					};
					self.sendEvent(remoteNodeId, 'Chatrooms.NickReserved', {});
				}else{
					self.sendEvent(remoteNodeId, 'Chatrooms.Error', {
						error_id: 0,
						reason: 'Not Connected to Chatrooms'
					});	
				}
			}else{
				self.sendEvent(remoteNodeId, 'Chatrooms.Error', {
					error_id: 0,
					reason: 'Not Connected to Chatrooms'
				});
			}
		});
		
		self.on('Chatrooms.Identify', function(message, rawMessage){
			var remoteNodeId = rawMessage._message.sender;
			console.log(remoteNodeId);
			console.log(self.Chatrooms.ConnectedNodes[remoteNodeId]);
			var connectedNode = self.Chatrooms.ConnectedNodes[remoteNodeId];
			
			var reservedNickAuthToken = self.Chatrooms.ReservedNicks[connectedNode.nick].authtoken;
		
			if(!connectedNode.identified){
				//check the supplied auth token against the reserved nick token
				if(reservedNickAuthToken==message.authtoken){
					connectedNode.identified = true;
					self.sendEvent(remoteNodeId, 'Chatrooms.Connected', {});
				}else{
					//tell the user that the connection has still failed
					self.sendEvent(remoteNodeId, 'Chatrooms.ConnectFailed', {
						error_id: 2,
						reason: 'Reserved Nick,  Please Identify.'
					});
				}
			}
		});
		
		//add Events that are emitted by this mixin
		self.on('Chatrooms.Join', function(message, rawMessage){
			self.Chatrooms_onJoin(message, rawMessage);
		});
		
		self.on('Chatrooms.AddRoom', function(message, rawMessage){
			self.Chatrooms_onAddRoom(message, rawMessage);
		});
		
		self.on('Chatrooms.DeleteRoom', function(message, rawMessage){
			
		});
		
		self.on('Chatrooms.ListRooms', function(message, rawMessage){
			self.Chatrooms_onListRooms(message, rawMessage);
		});
		
		self.on('Chatrooms.JoinRoom', function(message, rawMessage){
			self.Chatrooms_onJoinRoom(message, rawMessage);
		});
		
		self.on('Chatrooms.RoomMessage', function(message, rawMessage){
			self.Chatrooms_onRoomMessage(message, rawMessage);
		});
		
		self.emit('Chatrooms.ServerStarted', {});
	},
	Chatrooms_NickInUse: function(nick){
		var self = this;
		var nickFound = false;
		for(var remoteNodeId in self.Chatrooms_ConnectedNodes){
			var connectedNode = self.Chatrooms_ConnectedNodes[remoteNodeId];
			if(connectedNode.nick==nick){
				nickFound = false;
			}
		}
		
		return nickFound;
	},
	Chatrooms_NickIsReserved: function(nick){
		var self = this;
		var nickReserved = false;
		
		if(self.Chatrooms.ReservedNicks[nick]){
			nickReserved = true;
		}
		
		return nickReserved;
	},
	Chatrooms_RoomNameInUse: function(roomName){
		var self = this;
		var roomInUse = false;
		if(self.Chatrooms.Rooms[roomName]){
			roomInUse = true;
		}
		
		return roomInUse;
	},
	Chatrooms_onAddRoom: function(message, rawMessage){
		var self = this;
		var remoteNodeId = rawMessage._message.sender;
		var connectedNode = self.Chatrooms.ConnectedNodes[remoteNodeId];
		if(connectedNode){
			if(connectedNode.authlevel >= self.Chatrooms.Settings.AuthLevels.AddRoom){
				var roomName = message.name;
				var roomTopic = message.topic;
				if(!self.ChatRooms_RoomNameInUse(roomName)){
					self.Chatrooms.Rooms[roomName] = {
						name: roomName,
						owner: remoteNodeId,
						topic: roomTopic,
						users: [
							remoteNodeId
						]
					};
				}else{
					self.sendEvent(remoteNodeId, 'Chatrooms.AddRoomFailed', {
						error_id:1,
						reason: 'Room Name In Use.'
					});
				}
			}	
		}
		return true;
	},
	Chatrooms_deleteRoom: function(){
		
	},
	Chatrooms_onListRooms: function(message, rawMessage){
		var self = this;
		var remoteNodeId = rawMessage._message.sender;
			
			var searchTerm = message.searchTerm?message.searchTerm:'';
			//get the room list
			var list = {};
			
			for(var roomName in self.Chatrooms.Rooms){
				var room = self.Chatrooms.Rooms[roomName];
				
				if(searchTerm!=''){
					if(roomName.indexOf(searchTerm)>-1){
						list[roomName] = self.deleteDataFields(self.copyDataFields(room, {}, {topic: topic}), ['Owner', 'Users']);
					}
				}else{
					list[roomName] = self.deleteDataFields(self.copyDataFields(room, {}, {}));
				}
			}
			
			//send it back to the requester
			self.sendEvent(remoteNodeId, 'Chatrooms.RoomList', list);
	},
	Chatrooms_onJoinRoom: function(message, rawMessage){
		var self = this;
		var remoteNodeId = rawMessage._message.sender;
			
		var connectedNode = self.Chatrooms.ConnectedNodes[remoteNodeId];
		var nick = connectedNode.nick;
		var roomName = message.room;
		var room = self.Chatrooms.Rooms[roomName];
		
		room.Users.push(nick);
		
		console.log('USER ADDED TO ROOM');
		
		self.emit('Chatrooms.RoomMessage', {
			room: roomName,
			message: nick+' has joined'
		});
		
		self.sendEvent(remoteNodeId, 'Chatrooms.RoomJoined', {
			
		});
	},
	Chatrooms_AddUserToRoom: function(nick, roomName){
		var self = this;
		if(!roomName){ //remove the user from all rooms
			for(var rName in self.Chatrooms.Rooms){
				var room = self.Chatrooms.Rooms[rName];
				var userList = room.Users;
				var userFoundIdx = -1;
				for(var uIdx in userList){
					if(userList[uIdx]==nick){
						userFoundIdx = uIdx; 
					}
				}
				
				if(userFound>-1){
					room.Users.splice(userFoundIdx,1);
				}
			}
		}
	},
	Chatrooms_RemoveUserFromRoom: function(nick, leaveMessage, roomName){
		var self = this;
		for(var rName in self.Chatrooms.Rooms){
			if(rName==roomName || roomName=='' || !roomName){ //if its the supplied name, or no name supplied
				var room = self.Chatrooms.Rooms[rName];
				var userList = room.Users;
				var userFoundIdx = -1;
				for(var uIdx in userList){
					if(userList[uIdx]==nick){
						userFoundIdx = uIdx; 
					}
				}
				
				if(userFound>-1){
					room.Users.splice(userFoundIdx,1);
					self.emit('Chatrooms.RoomMessage', {
						room: rName,
						sender: -1,
						message: nick+' left ('+(leaveMessage?leaveMessage:'quit')+')'
					});
				}	
			}
		}
	},
	Chatrooms_onLeave: function(message, rawMessage){
		
	},
	Chatrooms_onRoomMessage: function(message, rawMessage){
		var self =  this;
		var remoteNodeId = rawMessage?rawMessage._message.sender: '';
		
		var connectedNode = self.Chatrooms.ConnectedNodes[remoteNodeId];
		var nick = connectedNode?connectedNode.nick: 'Chatrooms';
		
		var roomName = message.room;
		var room = self.Chatrooms.Rooms[roomName];
		
		var userList = room.Users;
		
		for(var uIdx in userList){
			if(userList[uIdx]!=nick){
				self.sendEvent(userList[uIdx], 'Chatrooms.RoomMessage', {
					nick: nick,
					room: roomName,
					message: message
				});	
			}
		}
	}
}

if (typeof define === 'function' && define.amd) {
	define(mixinFunctions);
} else {
	module.exports = mixinFunctions;
}
	