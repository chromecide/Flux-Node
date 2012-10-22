var FluxNode = require('../../../../FluxNode').FluxNode;

new FluxNode({
	mixins: [{
		name: 'RSSEmitter',
		options:{
			feeds:[
				{
					name: 'Twitter - Search "Australia"',
					url: 'http://search.twitter.com/search.atom?q=Australia'
				}
			]
		}
	}]
}, function(myNode){
	console.log('STARTING RSS');
	
	myNode.on('error', function(){
		console.log('ERROR');
	});
	
	console.log('Listeing for articles');
	myNode.on('FeedParser.ArticleReceived', function(article, rawMessage){
		console.log(' - '+article.title);
	});
});
