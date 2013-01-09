var FluxNode = require('../../../FluxNode').FluxNode;

new FluxNode({
	id: 'RSSEmitter1',
	mixins: [
		{
			name: 'RSSEmitter',
			options:{
			feeds: [
					{
						id: 'TwitterFluxSingularity',
						name: 'Twitter Search - FluxSingularity',
						url: 'http://search.twitter.com/search.atom?q=#FluxSingularity',
						interval: 60, //every 60 seconds
						options:{
							autoStart: true
						}
					},
					{
						id: 'SlashdotGames',
						name: 'Slashdot - Games',
						url: 'http://rss.slashdot.org/Slashdot/slashdotGames',
						interval: 1800, //every 30 minutes
						options:{
							autoStart: true
						}
					}
				]
			}
		}
	]
}, function(myNode){
	console.log('RSS Emitter Started');
	myNode.on('RSSEmitter.*.Article.Received', function(eventInfo){
		console.log('ARTICLE RECIEVED FROM: '+eventInfo.feed.name+'('+eventInfo.article.title+')');
	});
});
