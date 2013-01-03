Flux-Node/lib/mixins/Ticker
=========

Interval Ticker
---------
Provides functionality to for a Tick event to be emitted at a preset interval


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

* interval (Number, defaults to 1000) 

The duration for the default ticker

## Settings

## Methods

## Events

## Listeners
