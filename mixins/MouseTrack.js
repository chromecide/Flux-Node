/*
 * MouseTrack Messages
 * 	TOPIC												Parameters
 * ----------------------------------------------------------------------
 * 	[Destination|*].MouseTrack.Broadcasting				{id:'Broadcasting Node ID', Events:['Move', 'Click', 'DoubleClick']}
 *  [Destination].MouseTrack.Subscribe					{Events:[]}
 *  [Destination].MouseTrack.Subscribe.Response			{allowed: Boolean, Events:[]}
 *  [Destination|*].MouseTrack.Start					{id: 'Broadcasting Node ID'}
 *  [Destination|*].MouseTrack.Stop						{id: 'Broadcasting Node ID'}
 * 	[Destination|*].MouseTrack.Move						{X: Number, Y: Number}
 *  [Destination|*].MouseTrack.Click					{X: Number, Y: Number}
 *  [Destination|*].MouseTrack.DoubleClick				{X: Number, Y: Number}
 */

var mouseTrackFunctions = {
	init: function(cfg){
		console.log('Initialising Mouse Track');
		var self = this;
		self.MouseTrack_connectedClients = {};
		
		if(self._environment=='browser'){
			//when a tunnel is ready, inform it that we are broadcasting MouseTrack Events
			self.on('tunnelready', function(destinationId, tunnel){
				self.sendEvent(destinationId, 'MouseTrack.Start', {id: self.id, events: cfg.events});
			});
			
			self.on('*.MouseTrack.BroadCasting', function(data){
				
			});
			
			self.on('MouseTrack.Connected', function(data){
				if(data.message.id==self.id){ //connection confirmed
					console.log('CONNECTION CONFIRMED');
				}else{//someone else connected
					//create an indicator for their mouse position
					//subscribe to the mouse events
					console.log('SOMEONE CONNECTED');
					self.FluxNodeUI_confirm('Subscribe to Mouse Events?', 'Flux Node "'+data._message.sender+'" has connected.\nWould you like to subscribe to their Mouse Events', function(subscribe){
						if(subscribe==true){
							self.sendEvent(data.message.id, 'MouseTrack.Subscribe', {events:['Move']});
						}
					});
				}
			});
			
			self.on('tunnelclosed', function(){
				console.log('tunnel closed');
			});
			
			self.on('MouseTrack.Subscribe', function(data){
				console.log('Subscription Recieved');
				if(data._message.destination==self.id){
					self.FluxNodeUI_confirm('Subscription request recieved', 'Subscription Request Recieved From: '+data._message.sender, function(response){
						if(response==true){
							//setup a connected client
							self.MouseTrack_connectedClients[data._message.sender] = data.events;
						}
						self.sendEvent(data._message.sender, 'MouseTrack.Subscribe.Response', {
							allowed: response
						});
					});	
				}
			});
			
			self.on('MouseTrack.Subscribe.Response', function(data){
				if(data._message.destination==self.id){
					if(data.message.allowed){
						if(!document.getElementById('MouseTrack_'+data._message.sender)){
							var _body = document.getElementsByTagName('body')[0];
							var _div = document.createElement('div');
							_div.id = 'MouseTrack_'+data._message.sender;
							var _text = document.createTextNode('^');
							_div.appendChild(_text);
							_body.appendChild(_div);
						}
					}else{
						self.FluxNodeUI_alert(data._message.sender+' rejected your request to subscribe their mouse events');
					}
				}
			});
			
			self.on('MouseTrack.Move', function(data){
				document.getElementById('MouseTrack_'+data._message.sender).style.left = data.message.X;
				document.getElementById('MouseTrack_'+data._message.sender).style.top = data.message.Y;
			});
			
			var lastTest = new Date().getTime();

			function MouseMove(ev){
				var currentTest = new Date().getTime();
				
				if((currentTest-lastTest)>500){//max once per second
					lastTest = currentTest;
					 ev = ev || window.event;
					 for(var clIdx in self.MouseTrack_connectedClients){
					 	var client = clIdx;
					 	self.sendEvent(clIdx, 'MouseTrack.Move', {
						  	id: self.id,
						  	X: ev.clientX,
						  	Y: ev.clientY
						});
					 }
				}
			}
			document.onmousemove = MouseMove;
		}else{
			self.on('MouseTrack.Connect', function(data){
				console.log(arguments);
				self.MouseTrack_connectedClients[data._message.sender] = data.message;
				for(var clID in self.MouseTrack_connectedClients){
					var client = self.MouseTrack_connectedClients[clID];
					console.log(data);
					self.sendEvent(clID, 'MouseTrack.Connected', {
						id: data.message.id
					});
				}
			});
			
			/*self.on('*.'+self.id+'.MouseTrack.Subscribe', function(data){
				self.MouseTrack_connectedClients[data.id] = data;
				for(var clID in self.MouseTrack_connectedClients){
					var client = self.MouseTrack_connectedClients[clID];
					self.fireEvent(clID+'.MouseTrack.Connected', data);
				}
			});*/
			
			self.on('*.'+self.id+'.MouseTrack.Unsubscribe', function(data){
				self.MouseTrack_connectedClients[data.id] = data;
				for(var clID in self.MouseTrack_connectedClients){
					var client = self.MouseTrack_connectedClients[clID];
					self.fireEvent(clID, 'MouseTrack.Connected', data);
				}
			});
			
			/*self.on('MouseTrack.Move', function(data){
				console.log(data);
				for(var clID in self.MouseTrack_connectedClients){
					var client = self.MouseTrack_connectedClients[clID];
					if(clID!=data.id){
						self.fireEvent(clID, clID+'.MouseTrack.Moved', data);
					}
				}
			});*/
		}
	},
	MouseTrack_onConnected: function(destinationID){
		var self = this;
		
	}
}

	if (typeof define === 'function' && define.amd) {
		define(mouseTrackFunctions);
	} else {
		module.exports = mouseTrackFunctions;
	}
