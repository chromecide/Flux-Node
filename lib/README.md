Flux-Node/lib
=========

Flux Singularity Library
---------

## Methods

### sendEvent(destinationNodeID, topic, message) 

Send a message directly to another FluxNode

```javascript
	var myOtherNodeID = '12345';
	myNode.sendEvent(myOtherNodeID, 'Subscribe', {events:[]})
```

### on(topic, function(message, rawMessage))

Subscribe to an event on a local FluxNode

```
	var myNode = new FluxNode({});
	
	myNode.on('MyEvent', function(message, rawMessage){
		console.log('My Event Fired');
		console.log(message); //this is the message as sent by the original caller
		console.log(rawMessage); //this is the raw Message object as used by FluxNode and may include sender and destination information
	});
```

### off(topic, function)

stop listening to an event on a local FluxNode

```
	var myNode = new FluxNode({});
	
	function printMessage(message){
		console.log('My Event Fired: '+message.subject);
	}
	
	myNode.on('MyEvent', printMessage);
	
	myNode.emit('MyEvent', {
		subject: 'Hello World'
	});
	
	myNode.off('MyEvent', printMessage);
	
	myNode.emit('MyEvent', {
		subject: 'Hello World'
	});
```

### emit(topic, message);

Emit an event that can be subscribed to

```
	var myNode = new FluxNode({});
	
	myNode.on('MyEvent', function(message, rawMessage){
		console.log('My Event Fired: '+message.subject);
	});
	
	myNode.emit('MyEvent', {
		subject: 'Hello World'
	});
```

## Events

The following Events are emitted by a default instance of a FluxNode (no mixins).  Other events and functionality are provided by mixins

### tunnelready

### tunnelclosed

### Subscribe

### Unsubscribe

### MixinAdded


