Flux-Node/lib/mixins/fs_mdns
=========

MDNS based Automatic FluxNode Discovery
---------
Provides functionality and events for monitoring and broadcasting a FluxNode service via MDNS.


### Mixin

__Usage__

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

A list of ads that have been created.

### MDNS.browsers

A list of browsers that have been created.

### MDNS.services

A list of services that have been found on the network.

## Methods

### MDNS_createAdvert(name, serviceProtocol, serviceType, port, [options], [callback])

Create an MDNS advertisment.

### MDNS_startAdvert(name, [callback])

Start an MDNS advertisment.

### MDNS_stopAdvert(name, [callback])

Stop an MDNS advertisment.

### MDNS_removeAdvert(name, [callback])

Remove an MDNS advertisment.

### MDNS_listAdverts(query, [callback])

Retrieve a list of the Adverts that have been created.

### MDNS_clearAdverts([callback])

A convenience function to loop through the adverts and call MDNS_removeAdvert

### MDNS_createBrowser(name, serviceType, port, [options], [callback])

Create an MDNS browser.

### MDNS_startBrowser(name, [callback])

Start an MDNS Browser

### MDNS_stopBrowser(name, [callback])

Stop an MDNS Browser

### MDNS_removeBrowser(name, [callback])

Remove an MDNS Browser

### MDNS_listBrowsers(query, [callback])

Retrieve a list of the Browsers that have been created.

### MDNS_clearBrowsers([callback])

A convenience function to loop through the browsers and call MDNS_browserAdvert

## Events

### MDNS.Browser.Ready

Fired when a browser has been created and is ready to be started

### MDNS.CreateBrowser.Error

Fired when an error occurs while attempting to create a browser

### MDNS.Browser.Started

Emitted when a browser has been started

### MDNS.Browser.StartError

Emitted when an error occurs while attempting to start a browser

### MDNS.Browser.Stopped

Emitted when a browser is stopped

### MDNS.Browser.StopError

Emitted when an error occurs while attempting to stop a browser

### MDNS.Browser.Removed

Emitted when a browser has been removed

### MDNS.Browser.RemoveError

Emitted when an error occurs while attempting to remove a browser.

### MDNS.Service.Up

Emitted when a browser recieves a notification of a service being started.

### MDNS.Service.Down

Emitted when a browser recieves a notification of a service being down, or no longer advertising.

### MDNS.Ad.Ready

Fired when an advert has been created and is ready to be started

__Arguments__

An object is passed to the listener with the following properties:

* name - (String) The name of the advert created
* protocol - (String) The protocol of the advert created (currently either "tcp" or "udp")
* type - (String) The type of advert created.  Examples: FluxNode, http
* port - (Number) The port for the advertised service
* options - (Object) All options that were supplied when creating the advert

### MDNS.CreateAd.Error

Fired when there was an error attempting to create an advert.

__Arguments__

An array of error objects is passed to the listener.

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

The following Topics are listened for when this mixin has been added to a FluxNode Instance.

### MDNS.Ad.Create

Creates a new Advert.

__Message Format__

```javascript
var advertCfg = {
	name: '', //(String) The name for the advert
	protocol: '', //(String)  The protocol for the advert.  Currently supports "tcp" or "udp"
	type: '', //(String)  The type of advert to create, this can be a max of 14 characters
	port: 0000, //(Number)  The port for the advert.	options: { //optional additional parameters
		autoStart: true //(Boolean) If not set to false, the advert will be auto started after creation
	}
}
```

### MDNS.Ad.Start

Starts an Advert

__Message Format__

```javascript
var advertCfg = {
	name: '', //(String) The name of the advert to start
};
```

### MDNS.Ad.Stop

Stops an Advert

__Message Format__

```javascript
var advertCfg = {
	name: '', //(String) The name of the advert to stop
};
```

### MDNS.Ad.Remove

Removes an Advert

__Message Format__

```javascript
var advertCfg = {
	name: '', //(String) The name of the advert to remove
};
```

### MDNS.Ads.List

Retrieves a list of the

__Message Format__

```javascript
var advertListCfg = {};
```

### MDNS.Ads.Clear

Stops and removes all Adverts

__Message Format__

```javascript
var clearCfg = {};
```

### MDNS.Browser.Create

Creates a new Browser

### MDNS.Browser.Start

Starts a Browser

__Message Format__

```javascript
var browserCfg = {
	name: '', //(String) The name of the browser to start
};
```

### MDNS.Browser.Stop

Stops a Browser

__Message Format__

```javascript
var browserCfg = {
	name: '', //(String) The name of the browser to stop
};
```
### MDNS.Browser.Remove

Removes a Browser.

__Message Format__

```javascript
var browserCfg = {
	name: '', //(String) The name of the browser to remove
};
```

### MDNS.Browsers.List

Retrieves a list of all Browsers

__Message Format__

```javascript
var browserListCfg = {};
```

### MDNS.Browsers.Clear

Stops and removes all Browsers.

__Message Format__

```javascript
var  browserListCfg = {};
```

