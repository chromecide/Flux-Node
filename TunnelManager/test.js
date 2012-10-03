exports = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);
	if (typeof define === 'function' && define.amd) {
		var err = require(['TunnelManager', 'http://localhost:8080/socket.io/socket.io.js', './Tunnels/Websocket.js'], function(tm, io, Tunnel){
			tm.configureManager({
				sender: 654321,
				allowRelay: true
			});
			
			var socket = window.io.connect('localhost', {
				port: 8080
			});
			
			var wsTunnel = new Tunnel();
			wsTunnel.setSocket(socket, function(){
				tm.on('tunnelready', function(){
					console.log('READY');
					tm.send('111111', 'DirectMessage', {content: 'Hey Hey!!'});
				});
				tm.registerTunnel(false, wsTunnel);
			});
		}, function(err){
			var failedId = err.requireModules && err.requireModules[0]
			if(failedId){
				alert('Require Failed for: '+failedId);
			}
		});
	} else {
		var tm = require('./TunnelManager.js').TunnelManager;
		tm.configureManager({
			sender: 123456,
			allowRelay: true
		});
		
		var io = require('socket.io').listen(8080);
		
		io.sockets.on('connection', function (socket) {
			//register a tunnel with the tunnel manager
			var wsTunnel = tm.factory('Websocket').Tunnel;
			var newTunnel = new wsTunnel();
			newTunnel.setSocket(socket);
			tm.registerTunnel(false, newTunnel);
		});
	}



