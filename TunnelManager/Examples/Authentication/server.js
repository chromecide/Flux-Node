var net = require('net');
var TunnelManagerDef = new require('../../TunnelManager').TunnelManager;

//some vars that are used later on
var cfg = {
	host: 'localhost',
	port: 8080
};

var node2Auth = {
	node_id: '2',
	username: 'node2',
	password: 'abc123'
};

var tunnelManager = new TunnelManagerDef({
	debug: true,
	sender: '1', //the id number of this tunnel manager
	allowed: function(action, tunnel, topic, message){ //the function to determine if a connected node can do stuff
		if(!tunnel.isLoggedIn){
			tunnel.isLoggedIn = false;
		}
		var isAllowed = true;
		if(action=='recieve'){
			switch(topic){
				case 'init':
					//leave well enough alonel
					break;
				case 'auth': //the other end is attempting to login
					var authGood =  (message.message.username==node2Auth.username && message.message.password==node2Auth.password);
					if(authGood){
						tunnel.isLoggedIn = true;
						console.log(tunnel);
						tunnelManager.send(tunnel, 'LoginSuccessful', {'Welcome Back': 'Welcome Back'});
					}
					return authGood;
					break;
				default:
					if(!tunnel.isLoggedIn){
						tunnelManager.send(tunnel, 'MustLogin', {message: 'This server requires authentication, please log in.'})
					}
					return tunnel.isLoggedIn;
					break;
			}
		}
		return isAllowed;
	}
});

/*
 * create a tcp server to use to accept connections
 */

	//get the TCP Tunnel definition
	var tcpTunnel = tunnelManager.factory('TCP').Tunnel;
	
	//create the server
	var server = net.createServer(function(socket) { //'connection' listener
		console.log('connection recieved');
		
		//create a new TCP Tunnel and register it with the manager
		var newTunnel = new tcpTunnel();
		newTunnel.setSocket(socket);
		tunnelManager.registerTunnel(false, newTunnel); //the false means we don't already know the remote id of the tunnel, and that an "INIT" should be performed
	});
	
	server.listen(cfg.port, cfg.host, function(){
		console.log('TCP Server Listening');
	});

/*
 * Create a websocket tunnel to accept connections
 */
	var io = require('socket.io').listen(cfg.port+1);
				
	io.sockets.on('connection', function (socket) {
		//register a tunnel with the tunnel manager
		var wsTunnel = tunnelManager.factory('Websocket').Tunnel;
		var newTunnel = new wsTunnel();
		newTunnel.setSocket(socket);
		tunnelManager.registerTunnel(false, newTunnel);
	});
