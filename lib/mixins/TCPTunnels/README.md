Flux-Node/lib/mixins/TCPTunnels
=========

TCP Tunnel FluxNode Connections
---------
Provides functionality to allow remote nodes to connect and communicate with a node via TCP


### Mixin

```javascript
	new FluxNode({
		mixins: [
			{
				name: 'TCPTunnels'
			}
		]
	}, function(myNode){
		//myNode is now ready and running with a listener for FluxNode Tunnels via TCP
		console.log(myNode);
	});
	
	//OR
	
	new FluxNode({}, function(myNode){
		myNode.mixin('TCPTunnels', {}, function(mixinInfo){
			//myNode is now listening for FluxNode TCP connections
		});
	});
```

#### Configuration Options

All configuration parameters are optional, with default values listed below

* host (String, defaults to "localhost")

* port (Number, defaults to 9000)

## Settings

## Methods

## Events

## Listeners
