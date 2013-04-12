var request = require('request');
var zlib = require('zlib');		
var fpObj = require('feedparser');
		
var mixinFunctions = {
	init: function(cfg, callback){
		var thisNode = this;
		
		if(!cfg){
			cfg = {};
		}
		
		if(!cfg.feeds){
			cfg.feeds = [];
		}
		
		if(!cfg.defaultInterval){
			cfg.defaultInterval = 60;
		}
		
		thisNode.setSetting('RSSEmitter.config', cfg);
		

		for(var i=0;i<cfg.feeds.length; i++){
			var feedCfg = cfg.feeds[i];
			console.log(feedCfg);
			thisNode.RSSEmitter_createFeed(feedCfg.id, feedCfg.name, feedCfg.url, feedCfg.interval, feedCfg.options);
		}
		
		thisNode.on('RSSEmitter.Feed.Create', function(message, rawMessage){
			thisNode.RSSEmitter_createFeed(message.id);
		});
		
		thisNode.on('RSSEmitter.Feed.Start', function(message, rawMessage){
			thisNode.RSSEmitter_startFeed(message.id);
		});
		
		thisNode.on('RSSEmitter.Feed.Stop', function(message, rawMessage){
			thisNode.RSSEmitter_stopFeed(message.id);
		});
		
		thisNode.on('RSSEmitter.Feed.Remove', function(message, rawMessage){
			thisNode.RSSEmitter_removeFeed(message.id);
		});
		
		thisNode.on('RSSEmitter.Feed.Fetch', function(message, rawMessage){
			thisNode.RSSEmitter_fetchFeed(message.id);
		});
		
		
		thisNode.emit('Mixin.Ready', {
			name: 'RSSEmitter',
			config: cfg
		});
		
		if(callback){
			callback(false, {
				name: 'RSSEmitter',
				config: cfg
			});
		}
	},
	RSSEmitter_createFeed: function(id, name, url, interval, options, callback){
		var thisNode = this;
		
		var err = false;
		var errors = [];
		
		if(!id){
			err = true;
			errors.push({
				message: 'No ID supplied'
			});
		}
		
		if(!name){
			err = true;
			errors.push({
				message: 'No name supplied'
			});
		}
		
		if(!url){
			err = true;
			errors.push({
				message: 'No URL supplied'
			});
		}
		
		if((typeof interval)=='function'){
			callback = interval;
			interval = thisNode.getSetting('RSSEmitter.config.defaultInterval');
		}
		
		if((typeof options)=='function'){
			callback = options;
			options = {};
		}
		
		var feed = {
			id:id,
			name: name,
			url: url,
			interval: interval,
			autoStart: (options && options.autoStart)?options.autoStart:true
		}
		
		if(!err){
			thisNode.setSetting('RSSEmitter.feeds.'+id, {
				config: feed
			});
			
			function feedStarter(feedID){
				return function(msg, rawMsg){
					thisNode.RSSEmitter_onStartById(feedID, msg, rawMsg);	
				}
			}
			
			function feedStopper(feedID){
				return function(msg, rawMsg){
					thisNode.RSSEmitter_onStopById(feedID, msg, rawMsg);
				}
			}
			
			function feedRemover(feedID){
				return function(msg, rawMsg){
					thisNode.RSSEmitter_onRemoveById(feedID, msg, rawMsg);
				}
			}
			
			function feedFetcher(feedID){
				return function(msg, rawMsg){
					thisNode.RSSEmitter_onFetchById(feedID, msg, rawMsg);
				}
			}
			
			thisNode.on('RSSEmitter.Feeds.'+id+'.Start', feedStarter(id));
			thisNode.on('RSSEmitter.Feeds.'+id+'.Stop', feedStopper(id));
			thisNode.on('RSSEmitter.Feeds.'+id+'.Remove', feedRemover);
			thisNode.on('RSSEmitter.Feeds.'+id+'.Fetch', feedFetcher);
			
			thisNode.emit('RSSEmitter.'+id+'.Ready', feed);
			
			if(options && options.autoStart){
				thisNode.RSSEmitter_fetchFeed(id);
			}
		}else{
			console.log(errors);
			thisNode.emit('RSSEmitter.Create.Error', {
				config: feed,
				errors: errors
			});
		}
		
		if(callback){
			callback(err, err?errors:feed);
		}
	},
	RSSEmitter_startFeed: function(id, callback){
		var thisNode = this;
		
		var err = false;
		var errors = [];
		
		if(!id){
			err = true;
			errors.push({
				message: 'No ID supplied'
			});
		}
		
		var feed = thisNode.getSetting('RSSEmitter.feeds.'+id);
		
		if(!feed){
			err = true;
			errors.push({
				message: 'Feed not found: '+id
			});
		}
		
		if(!err){
			thisNode.RSSEmitter_fetchFeed(id);
			
			thisNode.emit('RSSEmitter.'+id+'.Started', feed.config);
		}else{
			thisNode.emit('RSSEmitter.'+id+'.StartError', feed.config);
		}
		
		if(callback){
			callback(err, err?errors:feed.config);
		}
	},
	RSSEmitter_stopFeed: function(id, callback){
		var thisNode = this;
		
		var err = false;
		var errors = [];
		
		if(!id){
			err = true;
			errors.push({
				message: 'No ID supplied'
			});
		}
		
		var feed = thisNode.getSetting('RSSEmitter.feeds.'+id);
		
		if(!feed){
			err = true;
			errors.push({
				message: 'Feed not found: '+id
			});
		}
		
		if(!err){
			clearTimeout(thisNode.getSetting('RSSEmitter.feeds.'+id+'.timeout'));
			thisNode.setSetting('RSSEmitter.feeds.'+id+'.timeout', false)
			thisNode.emit('RSSEmitter.'+id+'.Stopped', feed.config);
		}else{
			thisNode.emit('RSSEmitter.'+id+'.StopError', {
				config: feed.config,
				errors: errors
			});
		}
		
		if(callback){
			callback(err, err?errors:feed.config);
		}
	},
	RSSEmitter_removeFeed: function(id, callback){
		var thisNode = this;
		
		var err = false;
		var errors = [];
		
		if(!name){
			err = true;
			errors.push({
				message: 'No ID supplied'
			});
		}
		
		var feed = thisNode.getSetting('RSSEmitter.feeds.'+id);
		
		if(!feed){
			err = true;
			errors.push({
				message: 'Feed not found: '+ID
			});
		}
		
		if(!err){
			clearTimeout(thisNode.getSetting('RSSEmitter.feeds.'+id+'.timeout'));
			thisNode.removeSetting('RSSEmitter.feeds.'+id);
			thisNode.emit('RSSEmitter.'+id+'.Removed', feed.config);
		}else{
			thisNode.emit('RSSEmitter.'+id+'.RemoveError', {
				config: feed.config,
				errors: errors
			});
		}
		
		if(callback){
			callback(err, err?errors:feed.config);
		}
	},
	RSSEmitter_fetchFeed: function(id, callback){
		console.log('FETCHING FEED: '+id);
		var thisNode = this;
		
		var err = false;
		var errors = [];
		var feed = thisNode.getSetting('RSSEmitter.feeds.'+id);
		
		if(!feed){
			err = true;
			errors.push({
				message: 'Feed not found: '+id
			});
		}
		
		if(!err){
			clearTimeout(thisNode.getSetting('RSSEmitter.feeds.'+id+'.timeout'));
			
			var name = feed.config.name;
			var url = feed.config.url;
			
			var urlParts = require('url').parse(url);
			
			var reqObj = urlParts;
			
			require('http').get(reqObj, function (res, body){
				var body = "";
				
			    res.on('error', function(err) {
			       next(err);
			    });
			
			    var output;
			    if( res.headers['content-encoding'] == 'gzip' ) {
			    	var gzip = zlib.createGunzip();
			    	res.pipe(gzip);
			    	output = gzip;
			    } else {
			    	output = res;
			    }
			
			    output.on('data', function (data) {
			       data = data.toString('utf-8');
			       body += data;
			    });
			
			    output.on('end', function() {
					var feedParser = new fpObj({});
					
					feedParser.on('error', function(){
						console.log(arguments);
					});		
					
					feedParser.on('article', function(article){
						
						thisNode.emit('RSSEmitter.'+id+'.Article.Received', {
							feed: feed.config,
							article: article
						});
						
						thisNode.emit('RSSEmitter.Article.Received', {
							feed: feed.config,
							article: article
						});
					});
					
					feedParser.parseString(body);
					
					if(feed.config.interval){
						var feedTimeout = setTimeout(function(){
							thisNode.RSSEmitter_fetchFeed(id);
						}, feed.config.interval*1000);
						
						thisNode.setSetting('RSSEmitter.feeds.'+id+'.timeout', feedTimeout);
					}
			    });
		    });
		}
	},
	RSSEmitter_onStartById: function(id, message, rawMessage){
		var thisNode = this;
		thisNode.RSSEmitter_startFeed(id);
	},
	RSSEmitter_onStopById: function(id, message, rawMessage){
		var thisNode = this;
		thisNode.RSSEmitter_stopFeed(id);
	},
	RSSEmitter_onRemoveById: function(id, message, rawMessage){
		var thisNode = this;
		thisNode.RSSEmitter_removeFeed(id);
	},
	RSSEmitter_onFetchById: function(id, message, rawMessage){
		var thisNode = this;
		thisNode.RSSEmitter_fetchFeed(id);
	}
}

if (typeof define === 'function' && define.amd) {
	define(mixinFunctions);
} else {
	module.exports = mixinFunctions;
}
	