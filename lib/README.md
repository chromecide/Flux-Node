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

#### Configuration Options

* __debug__
* __id__
* __listeners__
* __stores__
* __tunnels__
* __mixins__
* __paths__

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
	'MyApp.MySetting',  	//Setting Name
	null, 					//Initial Value		
	function(newValue){		// Validator function
		if(newValue>10){
			return true;
		}else{
			return false;
		}
	},
	function(settingName){ //Callback function
		console.log('Setting Added: '+settingName);
	}
);
```

### setSetting(name, newValue, callback)

This method provides the ability to set the value of a FluxNode Setting.  If the setting was created using the addSetting function, and a validator function was supplied, the value will be validated before changing the current setting value.

* __name__ (String, required)

The name of the setting that is to be updated

* __newValue__ (Any, optional)

The new value to update the setting value to

* __callback__ (function, optional)

An optional optional callback function to be called when the process of changing the setting has been completed

```javascript
function(err, settingName, newValue, oldValue)
```

__Example__

```javascript
var isSet = myNode.setSetting('MyApp.MySetting', 11); //isSet is true or false
	
//OR
	
myNode.setSetting(
	'MyApp.MySetting', 	//Setting Name
	11, 				//New Value
	function(err, settingName, newValue, oldValue){ //callback function
		console.log('Setting "'+settingName+'" '+(err?'Failed':'Succeeded'));
		console.log('New Value: ', newValue);
		console.log('Old Value: ', oldValue);
	}
);
```

### getSetting(name, callback)

Retrieve the value of a FluxNode Setting.

* __name__ (String, required)

The name of the setting to retrieve

* __callback__ (function, optional)

Optional function to be called when retrieval has been completed.

```javascript
function (currentValue)
```

__Example__

```javascript

var settingValue = myNode.getSetting('MyApp.Setting');
console.log(settingValue);

// OR

myNode.getSetting('MyApp.Setting', function(settingValue){
	console.log(settingValue))
});
```
### addTunnel(tunnelDef, callback)

Add a Tunnel to the current FluxNode instance.

* __tunnelDef__ (Object, required)

The definition of the tunnel to add.  For more information about Tunnel configuration, please see the readme in the TunnelManager directory.

* __callback__ (function, optional)

An optional function to be called when the process of adding the tunnel has been completed.

### doSubscribe(subscriber, eventList)

Subscribe a remote FluxNode instance to events on the current FluxNode instance.  Events in _eventList_ will be forwarded to the remote FluxNode.

### doUnsubscribe(subscriber, eventList)

Remove a subscription by remote FluxNode instance

### getDataValueByString(dataObject,name)

Return a value from an object, using the path as a string to the value. (i.e. 'MyObject.Attribute')

### setDataValueByString(dataObject, name, value)

Set the value of an object, using the path to the attribute name (i.e. 'MyObject.Attribute')

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

### emit(topic, message);

Emit an event that can be subscribed to

```
	var myNode = new FluxNode({}, function(myNode){
		myNode.on('MyEvent', function(message, rawMessage){
			console.log('My Event Fired: '+message.subject);
		});
	
		myNode.emit('MyEvent', {
			subject: 'Hello World'
		});
	});
```

### on(topic, function(message, rawMessage))

Subscribe to an event on a local FluxNode

```
new FluxNode({}, function(myNode){
	myNode.on('MyEvent', function(message, rawMessage){
		console.log('My Event Fired');
		console.log(message); //this is the message as sent by the original caller
		console.log(rawMessage); //this is the raw Message object as used by FluxNode and may include sender and destination information
	});
	
	myNode.emit('MyEvent', 'Hello World');
});
```

### off(topic, function)

stop listening to an event on a local FluxNode

```
	new FluxNode({}, function(myNode){
		
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
	});
	
```

## Events

The following Events are emitted by a default instance of a FluxNode (no mixins).  Other events and functionality are provided by mixins.

### error

### FluxNode.Error

### FluxNode.Ready

### StorageManager.Ready

### Store.Ready

### TunnelManager.Ready

### Tunnel.Ready

### Tunnel.Closed

### Mixin.Ready

Fired when a Mixin has been added and all initialisation for that mixin has been completed.

## Listeners

The following Events are listened for by a default instance of a FluxNode.

### FluxNode.Mixin

### Subscribe

### Unsubscribe


