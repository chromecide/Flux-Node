var FluxNode = require('../../FluxNode').FluxNode;

var sepLine = '--------------------------------------------';

new FluxNode({}, function(myNode){
	myNode.StorageManager.createStore({
		name: 'default',
		type: 'Memory'
	}, function(err, store){
		if(!err){
			doStoreOperations(store);
			doManagerFunctions();
		}
	});
});

function doStoreOperations(store){
	console.log(sepLine);
	console.log('Commencing Store Operations');
	console.log(sepLine);
	printStoreStats(store);
	console.log(sepLine);
	seedRecords(store, function(){
		printStoreStats(store);
		doSearchOperations(store);
	});
}

function doSearchOperations(store){
	console.log(sepLine);
	console.log('Searching');
	console.log(sepLine);
	store.find(function(rec){
		if(rec.Position=='Developer'){
			return true;
		}
		return false;
	}, function(err, records){
		console.log('Find Developers by Function: '+records.length);
		store.find({
				Gender: 'F'
			}, function(err, records){
			
			console.log('Find Females by Attribute: '+records.length);
		});
	});
}

function seedRecords(store, callback){
	console.log(sepLine);
	console.log('Seeding Records');
	console.log(sepLine);
	store.save([
		{
			FirstName: 'Joe',
			Surname: 'Roberts',
			Position: 'CEO',
			Gender: 'M'
		},
		{
			FirstName: 'Jane',
			Surname: 'Smith',
			Position: 'CTO',
			Gender: 'F'
		},
		{
			FirstName: 'John',
			Surname: 'Cooper',
			Position: 'Developer',
			Gender: 'M'
		},
		{
			FirstName: 'Ronald',
			Surname: 'Citizen',
			Position: 'Developer',
			Gender: 'M'
		}
	], function(err, records){
		callback();
	});
}

function printStoreStats(store){
	console.log(sepLine);
	console.log('Collections: '+store.collections.length);
	console.log('Records: '+store.records.length);
	console.log(sepLine);
}
