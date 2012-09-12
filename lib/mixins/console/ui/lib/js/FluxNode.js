var FluxNode = new EventEmitter2({
  wildcard: true, // should the event emitter use wildcards.
  delimiter: '.', // the delimiter used to segment namespaces, defaults to `.`.
  maxListeners: 20, // the max number of listeners that can be assigned to an event, defaults to 10.
});

FluxNode.start = function(){
	FluxNode.socket = io.connect();
	
	FluxNode.socket.on('message', function(data){
		var self = FluxNode;
		var message = JSON.parse(data);
		FluxNode.emit(message.topic, message.payload);
	});
	
}

FluxNode.loadUIFramework = function(libName){
	switch (libName){
		case 'jquery-ui':
			
			break;
	}
}

FluxNode.sendEmit = function(topic, payload){
	FluxNode.socket.emit(topic, payload);	
}

FluxNode.send = function(topic, payload){
	var self = this;
	var message = {
		topic: topic,
		payload: payload
	};
	console.log('SENDING');
	console.log(JSON.stringify(message));
	FluxNode.socket.send(JSON.stringify(message));
}

