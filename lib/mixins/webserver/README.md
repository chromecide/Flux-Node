Flux-Node/lib/mixins/Webserver
=========

Static HTTP Server
---------
Provides functionality to server static files via http.


### Mixin

```javascript
	new FluxNode({
		mixins: [
			{
				name: 'webserver',
				options: {
					autoStart: true,
					webroot: '/path/to/webroot',
					namedPaths: {
						MyApp: '/path/to/directory/outside/of/webroot' //these files can be included in html by using the path "MyApp/my.file"
					}
				}
			}
		]
	}, function(myNode){
		//myNode is now ready and running with a webserver ready to accept http requests
		console.log(myNode);
	});
	
	//OR
	
	new FluxNode({}, function(myNode){
		myNode.mixin('webserver', {autoStart: true}, function(mixinInfo){
			//myNode is now ready and running with a webserver ready to accept http requests
		});
	});
```

#### Configuration Options

All configuration parameters are optional, with default values listed below

* host (String, defaults to "localhost")

* port (Number, defaults to 8080)

* autoStart (Boolean, defaults to false)

## Methods

### Webserver_startServer()

Starts the Webserver.

### Webserver_stopServer()

Stops the Webserver.

## Events

### Webserver.Started

Emitted when the Webserver has been Started.

### Webserver.Stopped

Emitted when the Webserver has been Stopped.

### Webserver.RequestRecieved

Emitted when the Webserver recieves a http request

### Webserver.ResponseSent

Emitted when the Webserver has sent a response.

## Listeners

### Webserver.Start

### Webserver.Stop