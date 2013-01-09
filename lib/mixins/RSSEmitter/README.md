Flux-Node/lib/mixins/RSSEmitter
=========

RSS Polling Emitter
---------
Polls RSS Feeds and emits Article events when new articles are recieved.


### Mixin

```javascript
	new FluxNode({
		mixins: [
			{
				name: 'RSSEmitter',
				options: {
					feeds:[
						{
							id: 'SlashdotYRO', //this is used in the event name e.g. "RSSEmitter.SlashdotYRO.Article.Received"
							name: 'Slashdot - Your Rights Online',
							url: 'http://rss.slashdot.org/Slashdot/slashdotYourRightsOnline',
							interval: 1800, //check every 30 minutes
							options: {
								autoStart: true
							}
						}
					]
				}
			}
		]
	}, function(myNode){
		//myNode is now ready and running and will emit a "RSSEmitter.SlashdotYRO.Article.Received" when a new article is recieved
		myNode.on("RSSEmitter.SlashdotYRO.Article.Received", function(article){
			console.log(article.article.title+' (from '+article.feed.name+')');
		});
	});
	
	//OR
	
	new FluxNode({}, function(myNode){
		myNode.mixin('RSSEmitter', {
			feeds:[
				{
					id: 'SlashdotYRO', //this is used in the event name e.g. "RSSEmitter.SlashdotYRO.Article.Received"
					name: 'Slashdot - Your Rights Online',
					url: 'http://rss.slashdot.org/Slashdot/slashdotYourRightsOnline',
					interval: 1800, //check every 30 minutes
					options: {
						autoStart: true
					}
				}
			]
		}, function(mixinInfo){
			//myNode is now ready and running and will emit a "RSSEmitter.SlashdotYRO.Article.Received" when a new article is recieved
			myNode.on("RSSEmitter.SlashdotYRO.Article.Received", function(article){
				console.log(article.article.title+' (from '+article.feed.name+')');
			});
		});
	});
```

#### Configuration Options

All configuration parameters are optional, with default values listed below

* feeds (Array, defaults to [])

* defaultInterval(Number, defaults to 60)

## Methods

### RSSEmitter_createFeed(id, name, url, [interval], [options], [callback])

Creates a new Feed.

### RSSEmitter_startFeed(id)

Starts a Feed.

### RSSEmitter_stopFeed(id)

Stops a Feed.

### RSSEmitter_removeFeed(id)

Removes a Feed.

### RSSEmitter_fetchFeed(id)

Checks for new messages for a Feed.
## Events

### Feed.Create.Error

Emitted when there is an error when attempting to create a Feed.

### Feed.[FeedID].Ready

Emitted when the Feed with id _FeedID_ has been created and is ready.

### Feed.[FeedID].Started

Emitted when the Feed with id _FeedID_ has been started.

### Feed.[FeedID].StartError

Emitted when there is an error when attempting to start the Feed with id _FeedID_.

### Feed.[FeedID].Stopped

Emitted when the Feed with id _FeedID_ has been stopped.

### Feed.[FeedID].StopError

Emitted when there is an error when attempting to stop the Feed with id _FeedID_.

### Feed.[FeedID].Removed

Emitted when the Feed with id _FeedID_ has been removed.

### Feed.[FeedID].StartError

Emitted when there is an error when attempting to remove the Feed with id _FeedID_.

### Feed.[FeedID].Article.Received

Emitted when an article has been recieved from the Feed with id _FeedID_.

## Listeners

### RSSEmitter.Feed.Create

### RSSEmitter.Feed.Start

### RSSEmitter.Feed.Stop

### RSSEmitter.Feed.Remove

### RSSEmitter.Feeds.[FeedID].Start

### RSSEmitter.Feeds.[FeedID].Stop

### RSSEmitter.Feeds.[FeedID].Remove

### RSSEmitter.Feeds.[FeedID].Fetch