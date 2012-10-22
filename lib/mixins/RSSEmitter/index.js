var request = require('request');
var zlib = require('zlib');

var mixinFunctions = {
	init: function(cfg, callback){
		var thisNode = this;
		console.log('INITTING RSS READER');
		//add properties that are needed by this mixin
		thisNode.FeedParser_Settings = {
			feeds: [],
			pollInterval: 60		// default 60 seconds
		};
		
		var FeedParser = require('feedparser');
		thisNode.FeedParser_Parser = new FeedParser({});
		thisNode.FeedParser_Parser.on('error', function(){
			console.log(arguments);
		});		
		
		thisNode.FeedParser_Parser.on('article', function(article){
			
			thisNode.emit('FeedParser.ArticleReceived', article);
		 });
		//add Events that are emitted by this mixin
		
		if(cfg){
			if(cfg.feeds){
				thisNode.FeedParser_Settings.feeds = cfg.feeds;
			}
			
			if(cfg.pollInterval){
				thisNode.FeedParser_Settings.pollInterval = cfg.pollInterval;
			}
		}
		
		console.log('creating timeout');
		thisNode.FeedParser_Timer = setTimeout(function(){
			thisNode.FeedParser_FetchFeeds();
		}, thisNode.pollInterval*1000);
		
		thisNode.emit('Mixin.Ready', {
			name: 'FeedParser'
		});
		if(callback){
			callback();
		}
	},
	FeedParser_FetchFeeds: function(message, rawMessage){
		var thisNode = this;
		console.log('firing timeout');
		console.log(thisNode.FeedParser_Settings.feeds);
		for(var i=0;i<thisNode.FeedParser_Settings.feeds.length;i++){
			var name = thisNode.FeedParser_Settings.feeds[i].name;
			var url = thisNode.FeedParser_Settings.feeds[i].url;
			console.log('processing: '+name+'('+url+')');
			var urlParts = require('url').parse(url);
			
			var reqObj = urlParts;
			
			require('http').get(reqObj, function (res, body){
				console.log('BACK');
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
			    	thisNode.FeedParser_Parser.parseString(body);
			    });

		    });
		}
		
		if(thisNode.FeedParser_Settings.pollInterval>0){
			thisNode.FeedParser_Timer = setTimeout(function(){
				thisNode.FeedParser_FetchFeeds();
			}, thisNode.FeedParser_Settings.pollInterval*1000);
		}
	}
}

if (typeof define === 'function' && define.amd) {
	define(mixinFunctions);
} else {
	module.exports = mixinFunctions;
}
	