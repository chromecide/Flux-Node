var storageManagerCtr = require('../../StorageManager.js').StorageManager;
var storageManager = new storageManagerCtr();

var userModel = new storageManager.Model({
	name: 'user',
	fields:{
		'DisplayName': {
			validators:{
				required: {},
				string: {
					minLength: 3,
					maxLength: 50
				}
			}
		},
		'emailAddress': {
			validators:{
				required: {},
				email: {}
			}
		},
		'password': {
			validators:{
				required: {},
				string:{}, //password: {}
			}
		},
		'enabled': {
			validators:{
				boolean: {}
			}
		}
	}	
});



storageManager.createStore({
	type: 'Memory'
}, function(err, MemStore){
	MemStore.addChannel({
		name: 'default',
		model: userModel
	});
	
	MemStore.save({
		DisplayName: 'JPR',
		emailAddress: 'chromecide@gmail.com',
		password: 'abc123',
		enabled:true
	}, 'default');
	
	MemStore.findOne({emailAddress: 'chromecide@gmail.com', password: 'abc123'}, {}, 'default', function(err, records){
		for(var i=0;i<records.length;i++){
			var record = records[i].record;
			console.log(record.get('DisplayName')+ ' - '+record.get('emailAddress'));
			record.remove();
			MemStore.find({emailAddress: 'chromecide@gmail.com'}, {}, 'default', function(err, records){
				console.log(arguments);	
			});
		}
	});
});

