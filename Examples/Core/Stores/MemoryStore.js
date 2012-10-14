var FluxNode = require('../../../FluxNode').FluxNode;

var sepLine = '--------------------------------------------';

new FluxNode({}, function(myNode){
	myNode.on('error', function(){
		console.log('ERR');
		console.log(arguments);
	});
	
	myNode.StorageManager.createStore({
		name: 'default',
		type: 'Memory'
	}, function(err, store){
		if(!err){
			if(store.status=='ready'){
				doStoreOperations(store);
			}else{
				store.on('ready', function(err, str){
					doStoreOperations(store);
				});	
			}
		}
	});
});

function doStoreOperations(store){
	console.log(sepLine);
	console.log('Commencing Store Operations');
	console.log(sepLine);
	printStoreStats(store);
	console.log(sepLine);
	seedRecords(store, function(err, records){
		doSearchOperations(store, records, function(){
			process.exit();
		});
	});
}

function doSearchOperations(store, seedRecords, callback){
	console.log(sepLine);
	console.log('Searching');
	console.log(sepLine);
	
	store.find(seedRecords[0].record.id, function(err, records){
		console.log('Find Person By ID: ');
		console.log(' - Found: '+(records?'1':'0'));
		console.log('--- '+records[0].record.FirstName+' '+records[0].record.Surname);
		store.find({
				Gender: 'F'
			}, function(err, records){
				if(err){
					console.log(err);
				}
			console.log('Find Females by Attribute: ');
			console.log(' - Found: '+records.length);
			for(var recIndex in records){
				var record = records[recIndex].record;
				console.log('--- '+record.FirstName+' '+record.Surname);
			}
			store.find(function(rec){
				if(rec){
					if(rec.Position=='Developer'){
						return true;
					}	
				}
				
				return false;
			}, function(err, records){
				console.log('Find Developers by Function: ');
				console.log(' - Found: '+records.length);
				for(var recIndex in records){
					var record = records[recIndex].record;
					console.log('--- '+record.FirstName+' '+record.Surname);
				}
				callback();
			});
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
		callback(err, records);
	});
}

function printStoreStats(store){
	console.log(sepLine);
	console.log('Collections: ');//+store.getChannels().length);
	console.log('Records: ');//+store.records.length);
	console.log(sepLine);
}
