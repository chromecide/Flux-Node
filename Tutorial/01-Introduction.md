FluxNode Tutorial
=========

Introduction to FluxNode
---------

## Creating a FluxNode

```
	var FluxNode = require('Flux-Node').FluxNode;
	
	new FluxNode({}, function(thisNode){
		//thisNode is now Ready for use
	});

```

## Settings

``` 
	var FluxNode = require('Flux-Node').FluxNode;
	
	new FluxNode({
		settings: {
			MyCustomSetting: 'MyCustomValue'
		}
	}, function(thisNode){
		console.log(thisNode.getSetting('MyCustomSetting'));
		
		thisNode.setSetting('MyCustomSetting', 'New Custom Value');
		
		console.log(thisNode.getSetting('MyCustomSetting'));
	});
```

## Events

```
	//Listen for a Custom Event
	var FluxNode = require('Flux-Node').FluxNode;
	
	new FluxNode({
		listeners:{
			'MyCustomEvent': function(message, rawMessage){
				var thisNode = this; //this is always the FluxNode instance
				console.log('My Custom Event was Emitted');
			}
		}
	}, function(thisNode){
		//an event can also be added after the FluxNode is Ready
		/*
		thisNode.on('MyCustomEvent', function(message, rawMessage){
			console.log('My Custom Event was Emitted');
		});
		*/
	});
	
	//Emit a Custom Event
	var FluxNode = require('Flux-Node').FluxNode;
	
	new FluxNode({
		listeners:{
			'MyCustomEvent': function(message, rawMessage){
				console.log('My Custom Event was Emitted');
			}
		}
	}, function(thisNode){
		thisNode.emit('MyCustomEvent', {
			customParam: 'CustomParamValue'
		})
	});
```

## Mixins

``` 
	var FluxNode = require('Flux-Node').FluxNode;
	
	new FluxNode({
		mixins:[
			{
				name: 'tickers'
			}
		]
	}, function(thisNode){
		//thisNode is now running with a ticker called "default"
		thisNode.on('Tickers.default.Tick', function(){
			console.log('TICK');
		});
	});
```