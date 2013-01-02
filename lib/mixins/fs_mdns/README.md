Flux-Node/lib/mixins/fs_mdns
=========

MDNS based Automatic FluxNode Discovery
---------
Provides functionality and events for monitoring and broadcasting a FluxNode service via MDNS.


### Mixin

```javascript
	new FluxNode({
		mixins: [
			{
				name: 'fs_mdns'
			}
		]
	}, function(myNode){
		//myNode is now ready and running with fs_mdns functionality available
		console.log(myNode);
	});
	
	//OR
	
	new FluxNode({}, function(myNode){
		myNode.mixin('fs_mdns', {}, function(mixinInfo){
			//fs_mdns functionality is now available for myNode
		});
	});
```

#### Configuration Options

All configuration parameters are optional, with default values listed below

* __ads__ (Array of ad configuration objects, defaults to [])

* __browsers__ (Array of browser configuration objects, defaults to [])

## Settings

### MDNS.ads

### MDNS.browsers

## Methods


### MDNS_createAdvert(name, serviceProtocol, serviceType, port, [options], [callback])

### MDNS_startAdvert(name, [callback])

### MDNS_stopAdvert(name, [callback])

### MDNS_removeAdvert(name, [callback])

### MDNS_listAdverts(query, [callback])

### MDNS_createBrowser(name, serviceType, port, [options], [callback])

### MDNS_listBrowsers(query, [callback])



## Events

### MDNS.Listening

### MDNS.Service.Up

### MDNS.Service.Down

### MDNS.Ad.Ready

Fired when an advert has been created and is ready to be started

__Arguments__

An object is passed to the listener with the following properties:

* name - (String) The name of the advert created
* protocol - (String) The protocol of the advert created (currently either "tcp" or "udp")
* type - (String) The type of advert created.  Examples: FluxNode, http
* port - (Number) The port for the advertised service
* options - (Object) All options that were supplied when creating the advert

### MDNS.Ad.Started

Fired when an advert has been started

__Arguments__

An object is passed to the listener with the following properties:

* name - (String) The name of the advert created
* protocol - (String) The protocol of the advert created (currently either "tcp" or "udp")
* type - (String) The type of advert created.  Examples: FluxNode, http
* port - (Number) The port for the advertised service
* options - (Object) All options that were supplied when creating the advert

### MDNS.Ad.StartError

Fired when there is an error starting an advert.

__Arguments__

An array of error objects is passed to the listener.

### MDNS.Ad.Stopped

Fired when an advert has been started

__Arguments__

An object is passed to the listener with the following properties:

* name - (String) The name of the advert created
* protocol - (String) The protocol of the advert created (currently either "tcp" or "udp")
* type - (String) The type of advert created.  Examples: FluxNode, http
* port - (Number) The port for the advertised service
* options - (Object) All options that were supplied when creating the advert

### MDNS.Ad.StopError

Fired when there is an error stopping an advert.

__Arguments__

An array of error objects is passed to the listener.

### MDNS.Ad.Removed

Fired when an advert has been removed

__Arguments__

An object is passed to the listener with the following properties:

* name - (String) The name of the advert created
* protocol - (String) The protocol of the advert created (currently either "tcp" or "udp")
* type - (String) The type of advert created.  Examples: FluxNode, http
* port - (Number) The port for the advertised service
* options - (Object) All options that were supplied when creating the advert

### MDNS.Ad.RemoveError

Fired when there is an error removing an advert.

__Arguments__

An array of error objects is passed to the listener.

### Mixin.Ready

Fired when a Mixin has been added and all initialisation for that mixin has been completed.

## Listeners

The following Events are listened for when mixed into a FluxNode instance.

### MDNS.StartAd

### MDNS.StopAd

### MDNS.ListAds

### MDNS.StartBrowser

### MDNS.StopBrowser

### MDNS.ListBrowsers
