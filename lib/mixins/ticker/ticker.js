var mixinFunctions = {
	init: function(cfg, callback){
		var thisNode = this;
		//add properties that are needed by this mixin
	
		//add Events that are emitted by this mixin
		if(!cfg){
			cfg = {};
		}
		
		
		if(!cfg.interval){
			cfg.interval = 1000;
		}
		
		thisNode.once('FluxNode.Ready', function(){
			thisNode.setSetting('Tickers.Count', thisNode.getSetting('Tickers.Count')+1);
			
			setInterval(function(){
				thisNode.emit('Ticker.Tick', {
					ticker: cfg.name?cfg.name:'Ticker-'+cfg.interval,
					time: (new Date()).getTime()
				});
			}, cfg.interval);
		});
		//should be called when the mixin is actually ready, not simp;y at the end of the init function
		thisNode.emit('Mixin.Ready', {
			name: 'MyMixinName'
		});
		
		if(callback){
			callback(thisNode);
		}
	},
	Ticker_StartTicker: function(options, rawMessage, callback){
		var thisNode = this;
		var tickers = thisNode.getSetting('Ticker.Tickers');
		if(!tickers){
			tickers = {
				_count:0
			};
		}
		
		var tickerName = options.name?options.name: 'Ticker+'+tickers._count++;
		var tickerInterval = options.interval?options.interval:1000;
		
		tickers[tickerName] = setInterval(function(){
			thisNode.emit('Ticker.Tick', {
				ticker: tickerName,
				time: (new Date()).getTime()
			});
		}, tickerInterval);
	},
	Ticker_StopTicker: function(options, rawMessage, callback){
		//TODO: stop ticker by name
	},
	Ticker_ClearTickers: function(){
		//TODO: clear all tickers from the list
	}
}

if (typeof define === 'function' && define.amd) {
	define(mixinFunctions);
} else {
	module.exports = mixinFunctions;
}
	