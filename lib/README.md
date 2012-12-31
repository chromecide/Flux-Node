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

* __name__

The name of the path to be added.

* __path__

The path to be used

__Example__

The example below will allow you to "require" files within the supplied directory using the format "MyApp/MyFile". (RequireJS will automatically add the ".js")

```javascript
	myNode.addPath('MyApp', '/path/to/myapp/files)
```

### addSetting(name, initialValue, validator, callback)

This method provides the ability to add a validated setting to the current FluxNode.

* __name__ (String, required)

The name of the setting	.  This can be in the form of "ObjectName.AttributeName".

* __initialValue__ (Any, optional)

The starting value of the new setting

* __validator__ (function, optional)

A function that returns a true or false value indictating the validity of a supplied value when using getSetting(see getSetting below). The validator function will be passed a single argument, being the new value.

```javascript
function (newValue)
```

* __callback__ (function, optional)

This function, if supplied, will be called when the process of adding the setting has been completed. 

```javascript
function (settingName)
```

__Example__

```javascript
myNode.addSetting(
	'MyApp.MySetting', 
	null, 
	function(newValue){
		if(newValue>10){
			return true;
		}else{
			return false;
		}
	},
	function(settingName){
		console.log('Setting Added: '+settingName);
	}
);
```

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


