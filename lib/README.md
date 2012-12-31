Flux-Node/lib
=========

Flux Singularity Library
---------

### FluxNode(config, callback)

```javascript
	new FluxNode({}, function(myNode){
		//myNode is now ready and running
		console.log(myNode);
	});
```

## Methods


### addPath(name, path)

This method can be used when using FluxNode in a browser environment, to add paths for use by RequireJS.

#### name

The name of the path to be added.

#### path

The path to be used


```javascript
	myNode.addPath('MyApp', '/path/to/myapp/files)
```

The example above would allow you to "require" files within the supplied directory using the format "MyApp/MyFile". (RequireJS will automatically add the ".js")

### addSetting(name, initialValue, validator, callback)



### setSetting(name, newValue, callback)


### getSetting(name, callback)


### addTunnel(tunnelDef, callback)

### doSubscribe(subscriber, eventList)

### doUnsubscribe(subscriber, eventList)

### getDataValueByString(dataObject,name)

### setDataValueByString(dataObject, name, value)

### clipDataByField(data, fieldList, notFieldList)

### copyDataFields(source, target, map, parent)

### deleteDataFields(data, fieldList)

### generateID()

### mixin(name, params, callback)

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
	new FluxNode({}, function(){
	
	});

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

The following Events are emitted by a default instance of a FluxNode (no mixins).  Other events and functionality are provided by mixins.

### error

### FluxNode.Error

### Store.Ready

### Tunnel.Ready

### Tunnel.Closed

### Mixin.Ready

## Listeners

The following Events are listened for by a default instance of a FluxNode.

### FluxNode.Mixin

### Subscribe

### Unsubscribe


