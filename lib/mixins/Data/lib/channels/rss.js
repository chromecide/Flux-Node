;!function(exports, undefined) {
	var articleModelFields = [
		{
			name:'title',
			label: 'Title',
			type: 'Text',
			required: true
		},
		{
			name:'description',
			label: 'Description',
			type: 'Text',
			required: true
		},
		{
			name:'summary',
			label: 'Summary',
			type: 'Text'
		},
		{
			name:'link',
			label: 'Title',
			type: 'Text',
			required: true
		}
	];
	
	var channel = {
		name: 'rss',
		url: false
	};
	
	channel.init = function(callback){
		var self = this;
		//late load the required modules
		var request = require('request');
		var zlib = require('zlib');		
		var fpObj = require('feedparser');
		
		this.Models.Article = new this._Model({
			name: 'Article',
			fields: articleModelFields
		});
		
		var name = self.name;
		var url = self.url;
		
		if(!url){
			throw new Error('No Feed URL Supplied');	
		}
		
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
					var articleEntity = new self._Entity(self.Models.Article, article);
					self.emit('insert', articleEntity);
				});
				
				feedParser.parseString(body);
		    });
	    });
	    if(callback){
	    	callback(this);
	    }
	}
	
	if (typeof define === 'function' && define.amd) {
		define(function() {
			return channel;
		});
	} else {
		exports.Channel = channel;
	}

}(typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);