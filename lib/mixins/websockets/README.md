Flux-Node/lib/mixins/WebsocketTunnels
=========

Websocket Tunnel FluxNode Connections
---------
Provides functionality to allow Web browser based nodes to connect and communicate with a node via Websockets


### Mixin

```javascript
	new FluxNode({
		mixins: [
			{
				name: 'WebsocketTunnels'
			}
		]
	}, function(myNode){
		//myNode is now ready and running with a listener for FluxNode Tunnels via TCP
		console.log(myNode);
	});
	
	//OR
	
	new FluxNode({}, function(myNode){
		myNode.mixin('WebsocketTunnels', {}, function(mixinInfo){
			//myNode is now listening for FluxNode TCP connections
		});
	});
```

#### Configuration Options

All configuration parameters are optional, with default values listed below

* host (String, defaults to "localhost")

* port (Number, defaults to 8080)

## Methods

This mixin does not expose any additional methods

## Events

This mixin does not emit any additional events

## Listeners

This mixin does not listen for any topics.