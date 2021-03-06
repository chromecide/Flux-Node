var mixinFunctions = {
	Tickers_TickerObjects: [],
	init: function(cfg, callback){
		var thisNode = this;
		
		/*
		 * Setting info
		 */
		
		thisNode.addSetting('Tickers', {
			defaultInterval: 1000,
			tickers:[]
		}, {
			object:{
				fields: {
					'defaultInterval': {
						name: 'Default Interval',
						description: 'The default interval for Tickers'
					},
					'tickers':{
						name: 'Tickers List',
						Description: 'A list of the registered Tickers',
						validators: {
							hasMany: {
								validators: {
									object:{
										fields: {
											name: {},
											interval: {},
											status: {}
										}
									}
								}
							}
						}
					}
				}
			}
		});
		
		//add properties that are needed by this mixin
		thisNode.addListenerInfo('Tickers', 'Tickers.Create', 'Creates a new Ticker', {
			name: {
				name: 'name',
				description: 'The name of the Ticker to create'
			},
			interval: {
				name: 'interval',
				description: 'The number of milliseconds between ticks'
			}
		});
		
		thisNode.addListenerInfo('Tickers', 'Tickers.Start', 'Starts a Ticker by Name', {
			name: {
				name: 'name',
				description: 'The name of the Ticker to start'
			}
		});
		
		thisNode.addListenerInfo('Tickers', 'Tickers.Stop', 'Stops a Ticker by Name', {
			name: {
				name: 'name',
				description: 'The name of the Ticker to stop'
			}
		});
		
		thisNode.addListenerInfo('Tickers', 'Tickers.Remove', 'Removes a Ticker by Name', {
			name: {
				name: 'name',
				description: 'The name of the Ticker to remove'
			}
		});
		
		thisNode.addListenerInfo('Tickers', 'Tickers.Clear', 'Removes all Tickers', {});
		
		//add Events that are emitted by this mixin
		if(!cfg){
			cfg = {};
		}
		
		if(!cfg.defaultInterval){
			cfg.defaultInterval = 1000;
		}
		
		thisNode.setSetting('Tickers.defaultInterval', cfg.defaultInterval);
		
		if(!cfg.tickers || cfg.tickers.length==0){
			console.log('adding default ticker');
			//add the default ticker
			cfg.tickers = [{
				name: cfg.name?cfg.name:'default',
				interval: cfg.interval?cfg.interval:thisNode.getSetting('Tickers.defaultInterval'),
				options: cfg.options?cfg.options: {}
			}];
		}
		
		for(var i=0;i<cfg.tickers.length;i++){
			var tickerCfg = cfg.tickers[i];
			thisNode.Tickers_createTicker(tickerCfg.name, tickerCfg.interval, tickerCfg.options);
		}
		
		thisNode.on('Tickers.Create', function(message, rawMessage){
			thisNode.Tickers_createTicker(message.name, message.interval, message.options);
		});
		
		thisNode.on('Tickers.Start', function(message, rawMessage){
			thisNode.Tickers_startTicker(message.name);
		});
		
		thisNode.on('Tickers.Stop', function(message, rawMessage){
			thisNode.Tickers_stopTicker(message.name);
		});
		
		thisNode.on('Tickers.Remove', function(message, rawMessage){
			thisNode.Tickers_removeTicker(message.name);
		});
		
		thisNode.on('Tickers.Clear', function(message, rawMessage){
			thisNode.Tickers_clearTickers();
		});
		
		var returnObject = {
			name: 'Tickers',
			meta: require(__dirname+'/package.json'),
			config: cfg
		}
		
		thisNode.emit('Mixin.Ready', returnObject);
		
		if(callback){
			callback(false, returnObject);
		}
	},
	Tickers_getTicker: function(name, callback){
		var thisNode = this;
		var tickerList = thisNode.getSetting('Tickers.tickers');
		var returnTicker = false;
		
		for(var i=0;i<tickerList.length;i++){
			var ticker = tickerList[i];
			if(ticker.name==name){
				returnTicker = ticker;
				break;
			}
		}
		if(callback){
			callback(false, returnTicker);
		}
		return returnTicker;
	},
	Tickers_createTicker: function(name, interval, options, callback){
		
		var thisNode = this;
		
		var err = false;
		var errors = [];
		if(!name){
			err = true;
			errors.push({
				message: 'No Name Supplied'
			});
		}
		
		if((typeof interval)=='function'){
			callback = interval;
			interval = 1000;
		}else{
			if(!interval){
				interval = 1000;
			}else{
				if(interval<0){
					err = true;
					errors.push('Cannot create Tickers with a negative interval');
				}
			}
		}
		
		if((typeof options)=='function'){
			callback = options;
			options = {};
		}
		
		var existing = thisNode.getSetting('Tickers.tickers.'+name);
		
		if(existing || name=='Clear' || name=='Create' || name=='Start' || name=='Stop' || name=='Remove'){
			err = true;
			errors.push({
				message: 'Name in use'
			});
		}
		
		if(!err){
			var ticker = {
				name: name,
				interval: interval,
				status: 'stopped'
			}
			
			var tickerList = thisNode.getSetting('Tickers.tickers');
			tickerList.push(ticker);
			
			
			console.log(thisNode.getSetting('Tickers.tickers'));
			/*thisNode.setSetting('Tickers.tickers.'+name, {
				config: ticker,
				object: false
			});*/
			
			thisNode.on('Tickers.'+name+'.Start', thisNode.Tickers_onStartByName);
			thisNode.on('Tickers.'+name+'.Stop', thisNode.Tickers_onStopByName);
			thisNode.on('Tickers.'+name+'.Remove', thisNode.Tickers_onRemoveByName);
			
			thisNode.addListenerInfo('Tickers', 'Tickers.'+name+'.Start', 'Starts the "'+name+'" Ticker', {});
			thisNode.addListenerInfo('Tickers', 'Tickers.'+name+'.Stop', 'Stops the "'+name+'" Ticker', {});
			thisNode.addListenerInfo('Tickers', 'Tickers.'+name+'.Remove', 'Removes the "'+name+'" Ticker', {});
			
			
			thisNode.addEventInfo('Tickers', 'Tickers.'+name+'.Tick', {
				time: {
					name: 'time',
					description: 'The time at which the Ticker Ticked'
				}
			});
			
			thisNode.addEventInfo('Tickers', 'Tickers.'+name+'.Started', {
				time: {
					name: 'time',
					description: 'The time at which the Ticker was Started'
				}
			});
			
			thisNode.addEventInfo('Tickers', 'Tickers.'+name+'.Stopped', {
				time: {
					name: 'time',
					description: 'The time at which the Ticker was Stopped'
				}
			});
			
			thisNode.addEventInfo('Tickers', 'Tickers.'+name+'.Removed', {
				time: {
					name: 'time',
					description: 'The time at which the Ticker was Removed'
				}
			});
			thisNode.emit('Tickers.'+name+'.Ready', ticker);
		}
		
		if(callback){
			callback(err, err?errors:ticker);
		}
		
		if(!options || (!options.autoStart && options.autoStart!==false)){
			
			thisNode.Tickers_startTicker(name);
		}
	},
	Tickers_startTicker: function(name, callback){
		console.log('STARTING: ', name);
		var thisNode = this;
		var ticker = thisNode.Tickers_getTicker(name);//thisNode.getSetting('Tickers.tickers.'+name);
		
		var err = false;
		var errors = [];
		if(!ticker){
			err = true;
			errors.push({
				message: 'Ticker not found: '+name
			});
		}else{
			var intervalObj = setInterval(function(){
				thisNode.emit('Tickers.'+name+'.Tick', {
					config: ticker,
					time: (new Date()).getTime()
				});
			}, ticker.interval);
			
			thisNode.Tickers_TickerObjects[name] = intervalObj;
			ticker.status = 'running';
			//thisNode.setSetting('Tickers.tickers.'+name+'.config.status', 'running');
			
			thisNode.emit('Tickers.'+name+'.Started', ticker);
		}
		
		if(callback){
			callback(err, err?errors:ticker.config);
		}
	},
	Tickers_stopTicker: function(name, callback){
		console.log('STOPPING: '+name);
		var thisNode = this;
		var ticker = thisNode.Tickers_getTicker(name);//thisNode.getSetting('Tickers.tickers.'+name);
		
		var err = false;
		var errors = [];
		if(!ticker){
			err = true;
			errors.push({
				message: 'Ticker not found: '+name
			});
		}else{
			clearInterval(thisNode.Tickers_TickerObjects[name]);
			delete thisNode.Tickers_TickerObjects[name];
			thisNode.setSetting('Tickers.tickers.'+name+'.object', false);
			thisNode.setSetting('Tickers.tickers.'+name+'.config.status', 'stopped');
			
			thisNode.emit('Tickers.'+name+'.Stopped', ticker.config);
		}
		
		if(callback){
			callback(err, err?errors:ticker.config);
		}
	},
	Tickers_removeTicker: function(name, callback){
		var thisNode = this;
		var ticker = thisNode.Tickers_getTicker(name);//thisNode.getSetting('Tickers.Tickers.'+name);
		
		var err = false;
		var errors = [];
		if(!ticker){
			err = true;
			errors.push({
				message: 'Ticker not found: '+name
			});
		}else{
			if(thisNode.Tickers_TickerObjects[name]){
				clearInterval(thisNode.Tickers_TickerObjects[name]);
				delete thisNode.Tickers_TickerObjects[name];
			}
			thisNode.off('Tickers.'+name+'.Start', thisNode.Tickers_onStartByName);
			thisNode.off('Tickers.'+name+'.Stop', thisNode.Tickers_onStopByName);
			thisNode.off('Tickers.'+name+'.Remove', thisNode.Tickers_onRemoveByName);
			
			//need to figure out how to remove an item from a hasMany object
			//thisNode.removeSetting('Tickers.tickers.'+name);
			var tickerList = thisNode.getSetting('Ticker.tickers');
			for(var i=0;i<tickerList.length;i++){
				if(tickerList[i].name==name){
					tickerList.splice(i, 1);
					break;
				}
			}
			
			console.log(thisNode.getSetting('Ticker.tickers'));
			thisNode.emit('Tickers.'+name+'.Removed', ticker.config);
		}
		
		if(callback){
			callback(err, err?errors:ticker.config);
		}
	},
	Tickers_clearTickers: function(){
		var tickers = thisNode.getSetting('Tickers.tickers');
		for(var name in tickers){
			thisNode.Tickers_removeTicker(name);
		}
	},
	//internal functions
	Tickers_onStartByName: function(tickerCfg){
		var thisNode = this;
		
		var eventName = thisNode.event;
		var tickerName = eventName.replace('Tickers.', '').replace('.Start', '');
		thisNode.Tickers_startTicker(tickerName);
	},
	Tickers_onStopByName: function(tickerCfg){
		var thisNode = this;
		var eventName = thisNode.event;
		var tickerName = eventName.replace('Tickers.', '').replace('.Stop', '');
		thisNode.Tickers_stopTicker(tickerName);
	},
	Tickers_onRemoveByName: function(tickerCfg){
		var thisNode = this;
		var eventName = thisNode.event;
		var tickerName = eventName.replace('Tickers.', '').replace('.Remove', '');
		thisNode.Tickers_removeTicker(tickerName);
	}
}

if (typeof define === 'function' && define.amd) {
	define(mixinFunctions);
} else {
	module.exports = mixinFunctions;
}
	