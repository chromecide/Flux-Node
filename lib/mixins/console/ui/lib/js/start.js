
var socket = io.connect('http://localhost');
socket.on('Ready', function (data) {
	socket.emit('my other event', { my: 'data' });
});

function doLogin(username, password){
	
}

function doLogout(){
	
}

