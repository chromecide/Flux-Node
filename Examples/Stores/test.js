
var FluxNode;
var myNode = null;

if (typeof define === 'function' && define.amd) {
	require(['../../lib/FluxNode_0.0.1'], function(FN){
		FluxNode = FN;
		run();
	});
} else {
	FluxNode = require('../../lib/FluxNode_0.0.1').FluxNode;
	run();
}

function run(){
	myNode = new FluxNode({
		delimiter:'.',
		wildcard:true,
	});
		
	myNode.mixin('FluxNodeUI_0.0.1', {}, function(){
		//now we need to do some work with the stores for the example
		console.log('Building Stores');
		console.log(this.StorageManager);
		//Create a User "Memory Store"
		var newStore = myNode.StorageManager.createStore({
			type: 'Memory',
			name: 'Users'
		});
		
		newStore.save({
			username: 'justin',
			pass: 'abc123'
		}, function(err, rec){
			console.log(rec.id);
			newStore.find(rec.id, function(err, recs){
				console.log(recs);
			});
		});
		
		
	})
}

