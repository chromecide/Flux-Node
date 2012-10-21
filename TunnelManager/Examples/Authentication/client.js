var net = require('net');
var TunnelManagerDef = new require('../../TunnelManager').TunnelManager;
var loggedIn = false;
//some vars that are used later on
var serverTunnelCfg = {
	host: 'localhost',
	port: 8080
};

var tunnelManager = new TunnelManagerDef({
	debug:true,
	sender: '2', //the id number of this tunnel manager
});

tunnelManager.on('Tunnel.Ready', function(tunnel){
	console.log('ready');
	tunnelManager.send('1', 'auth', {
		username:'node2',
		password: 'abc123'
	});
});
//we already know the configuration of the server so let's create a connection and register the socket
var tcpTunnel = tunnelManager.factory('TCP').Tunnel;
var newTunnel = new tcpTunnel();
var socket = net.connect(serverTunnelCfg.port, serverTunnelCfg.host);
newTunnel.setSocket(socket);

tunnelManager.registerTunnel(false, newTunnel);
