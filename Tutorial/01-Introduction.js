var FluxNode = require('../FluxNode.js').FluxNode;

new FluxNode({
	listeners:{
		'FluxNode.Ready': function(thisNode){
			console.log('Node ID: '+thisNode.id);
		}
	},
	mixins: [
		{
			name: 'tickers'
		}
	]
}, function(thisNode){
	console.log('Node Ready');
	var numTicks=0;
	/*thisNode.on('Tickers.default.Tick', function(ticker){
		numTicks++;
		console.log('Server has been running for '+numTicks+' ticks');
	});*/
	
	thisNode.getEventInfo(function(err, eventInfo){
		console.log('--------------------');
		console.log('EVENTS');
		console.log('--------------------');
		for(var mixinName in eventInfo){
			var mixinEvents = eventInfo[mixinName];
			console.log(mixinName);
			for(var eventName in mixinEvents){
				console.log('\t'+eventName);
			}
		}
		
		thisNode.getListenerInfo(function(err, eventInfo){
			console.log('--------------------');
			console.log('LISTENERS');
			console.log('--------------------');
			for(var mixinName in eventInfo){
				var mixinEvents = eventInfo[mixinName];
				console.log(mixinName);
				for(var eventName in mixinEvents){
					console.log('\t'+eventName);
				}
			}
		});
	});
});