Flux-Node/lib/mixins/Ticker
=========

Interval Ticker
---------
Provides functionality for creating Tickers that emit _Tick_ events at a predetermined interval


### Mixin

```javascript
	new FluxNode({
		listeners: {
			'Ticker.Tick': function(){
				console.log('TICK');
			}
		},
		mixins: [
			{
				name: 'ticker'
			}
		]
	}, function(myNode){
		//myNode is now ready and running with a ticker that fires a Ticker.Tick event every 1 second
		console.log(myNode);
	});
	
	//OR
	
	new FluxNode({}, function(myNode){
		myNode.mixin('ticker', {}, function(mixinInfo){
			//myNode is now ready and running with a ticker that fires a Ticker.Tick event every 1 second
		});
		
		myNode.on('Ticker.Tick', function(){
			console.log('TICK');
		});
	});
```

#### Configuration Options

All configuration parameters are optional, with default values listed below

* __name__ (String, defaults to "_default_")

	The name for the defaut Ticker
	
* __interval__ (Number, defaults to 1000) 

	The duration for the default Ticker
	
* __tickers__ (Array, defaults to [])

	An array of Ticker configuration objects.  See the documentation for the _Ticker.Create_ event below for Ticker config format.
	
## Methods

### Tickers_createTicker(name, [interval], [options], [callback])

Creates a new Ticker

* __name__ (String, required)

	The name of the new Ticker

* __interval__ (Number, optional)

	The time, in milliseconds, between Tick events.  Defaults to 1000 (1 second).
	
* __options__ (Object, optional)

	Additional configuration options:
	
	__autoStart__ (Boolean), defaults to true
	
	If not supplied, the new Ticker will be started automatically.  Set to false to disable auto starting.
		
	
* __callback(err, TickerConfig)__ (function, optional)

	Called when the creation of the Ticker has been completed
	
	__err__ (Boolean) 
	
	false if creation was successful, true if an error occurred
	
	__TickerConfig__ 
	
	If err is false, this will be the Ticker Configuration object for the new ticker. If err is true, _TickerConfig_ will be an array of error objects.

### Tickers_startTicker(name,[callback])

Start a Ticker by name.

* __name__ (String, required)

	The name of the Ticker to start.

* __callback(err, TickerCfg)__ (function, optional)

	Called when the Ticker has been started.
	
	__err__ (Boolean) 
	
	false if starting was successful, true if an error occurred
	
	__TickerConfig__ 
	
	If err is false, this will be the Ticker Configuration object for the started ticker. If err is true, _TickerConfig_ will be an array of error objects.



### Tickers_stopTicker(name, [callback])

Stop a Ticker by name.

* __name__ (String, required)

	The name of the Ticker to stop.

* __callback(err, TickerCfg)__ (function, optional)

	Called when the Ticker has been stopped.
	
	__err__ (Boolean) 
	
	false if stopping was successful, true if an error occurred
	
	__TickerConfig__ 
	
	If err is false, this will be the Ticker Configuration object for the stopped ticker. If err is true, _TickerConfig_ will be an array of error objects.
	
### Tickers_removeTicker(name, [callback])

Remove a Ticker by name.

* __name__ (String, required)

	The name of the Ticker to remove.

* __callback(err, TickerCfg)__ (function, optional)

	Called when the Ticker has been removed.
	
	__err__ (Boolean) 
	
	false if removal was successful, true if an error occurred
	
	__TickerConfig__ 
	
	If err is false, this will be the Ticker Configuration object for the removed ticker. If err is true, _TickerConfig_ will be an array of error objects.
	
### Tickers_clearTickers()

Clear all Tickers.  This is a convenience function that will loop through the list of tickers, and call Tickers_removeTicker

## Events

All of the topics below, with the exception of the _Tick_ event, are emitted with the following object format as the single argument to a listener:

```javascript
var TickerCfg = {
	name: 'TickerName', //the name of the ticker that emitted the event
	interval: 5000, //the current interval for the ticker
	options:{} //an object containing any additional options for the ticker
}
```

### Tickers.[TickerName].Tick

Emitted when a Ticker, with the name _TickerName_, reaches its configured interval.

This event is emitted with the following object format as the single argument to a listener:

```javascript
var TickEvent = {
	config: TickerCfg, //a Ticker config object as outlined above
	time: TickerTime //the time the event was fired
}
```

### Tickers.[TickerName].Ready

Emitted when a new Ticker, with the name _TickerName_, has been added and is ready for use.

### Tickers.[TickerName].Started

Emitted when a Ticker, with the name _TickerName_, has been Started.

### Tickers.[TickerName].Stopped

Emitted when a Ticker, with the name _TickerName_, has been stopped.

### Tickers.[TickerName].Removed

Emitted when a Ticker, with the name _TickerName_, has been removed.

## Listeners

The following topics provide access to the built in methods listed above.

### Tickers.Create

__Message Format__

```javascript
var TickerCfg = {
	name: 'TickerName',
	interval: 5000,
	options:{
		autoStart: false //if not === false, this ticker will auto start
	}
}
```

### Tickers.Start

__Message Format__

```javascript
var TickerCfg = {
	name: 'TickerName'
};
```

### Tickers.Stop

__Message Format__

```javascript
var TickerCfg = {
	name: 'TickerName'
};
```

### Tickers.Remove

__Message Format__

```javascript
var TickerCfg = {
	name: 'TickerName'
};
```

### Tickers.Clear

__Message Format__

```javascript
var TickerCfg = {};
```
### Tickers.[TickerName].Start

Starts the ticker with the name _TickerName_

__Message Format__

```javascript
var TickerCfg = {};
```

__Example__

```javascript
myNode.sendEvent(destination, 'Tickers.MyTicker.Start', {});
```

### Tickers.[TickerName].Stop

Stops the ticker with the name _TickerName_

__Message Format__

```javascript
var TickerCfg = {};
```

__Example__

```javascript
myNode.sendEvent(destination, 'Tickers.MyTicker.Stop', {});
```

### Tickers.[TickerName].Remove

Removes the ticker with the name _TickerName_

__Message Format__

```javascript
var TickerCfg = {};
```

__Example__

```javascript
myNode.sendEvent(destination, 'Tickers.MyTicker.Remove', {});
```