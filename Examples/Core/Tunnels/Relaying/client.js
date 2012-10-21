var myNode

requirejs.onError = function(){
	console.log('ERROR');
}

require(['FluxNode'], function(FN){ //successful load of dependencies
	FluxNode = FN;
	new FluxNode({
		mixins:[
			{
				name: 'websockets'
			}
		]
	}, function(nd){
		myNode = nd;
		
		var connectedClients = [];
		
		myNode.on('Tunnel.Ready', function(destination){
			myNode.ServerID = destination; //when connecting via a websocket for examples like this, we'll only ever have 1 tunnel open, which is to the server
			var name = prompt('Username: ', 'guest_'+(new Date()).getTime());
			console.log(name);
			
			myNode.sendEvent(myNode.ServerID, 'Connect', {
				id: myNode.id,
				name: name
			});
		});
		
		myNode.on('Require.Error', function(err){
			if(err.id.indexOf('socket.io.js')>-1){
				alert('Could not connect to Websocket Server.  Please ensure you started the server.');
			}else{
				alert('Could not load: '+err.id);
			}
		});
		
		
		window.sendMessage = function sendMessage(recipient){
			var message = prompt('message:');
			myNode.sendEvent(recipient, 'DirectMessage', {
				content: message
			});
		}
		
		myNode.on('Client.Connected', function(message, rawMessage){
			
			connectedClients.push(message);
			var html = '<ul>';
			for(var i=0; i<connectedClients.length;i++){
				if(!connectedClients[i] || connectedClients[i].id==message){
					connectedClients.splice(i, 1);
				}else{
					if(connectedClients[i].id == myNode.id){
						html+= '<li><b>'+connectedClients[i].name+'</b></li>';
					}else{
						html+= '<li><a onclick=\'return sendMessage("'+connectedClients[i].id+'");\'>'+connectedClients[i].name+'</a></li>';	
					}		
				}
			}
			html += '</ul>';
			document.getElementById('clientList').innerHTML = html;
		});
		
		myNode.on('Client.Disconnected', function(message, rawMessage){
			
			var html = '<ul>';
			for(var i=0; i<connectedClients.length;i++){
				if(!connectedClients[i] || connectedClients[i].id==message.id){
					connectedClients.splice(i, 1);
				}else{
					if(connectedClients[i].id == myNode.id){
						html+= '<li><b>'+connectedClients[i].name+'</b></li>';
					}else{
						html+= '<li><a onclick=\'return sendMessage("'+connectedClients[i].id+'");\'>'+connectedClients[i].name+'</a></li>';	
					}
						
				}
			}
			html += '</ul>';
			document.getElementById('clientList').innerHTML = html;
		});
		
		myNode.on('Welcome', function(message){
			console.log(message);
			connectedClients = message.clients;
			
			var html = '<ul>';
			for(var i=0; i<connectedClients.length;i++){
				console.log(connectedClients[i]);
				if(!connectedClients[i] || connectedClients[i].id==message){
					connectedClients.splice(i, 1);
				}else{
					if(connectedClients[i].id == myNode.id){
						html+= '<li><b>'+connectedClients[i].name+'</b></li>';
					}else{
						html+= '<li><a onclick=\'return sendMessage("'+connectedClients[i].id+'");\'>'+connectedClients[i].name+'</a></li>';	
					}
						
				}
			}
			html += '</ul>';
			document.getElementById('clientList').innerHTML = html;
			myNode.sendEvent(myNode.ServerID, 'Subscribe', {
				events: [
					'Client.Connected',
					'Client.Disconnected'
				]
			});
		});
		
		myNode.on('DirectMessage', function(message, rawMessage){
			var senderName = false;
			
			for(var i=0;i<connectedClients.length;i++){
				if(connectedClients[i].id == rawMessage._message.sender){
					senderName = connectedClients[i].name;
				}	
			}
			
			alert(senderName+' sent:\n'+message.content);
		});
	});	
	
});
	
