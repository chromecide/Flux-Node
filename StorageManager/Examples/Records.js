var StorageManagerObj = require('../StorageManager').StorageManager;
var seedData = require('./lib/SeedData.js');

// core object validation types

// attribute configuration

var personModel = {
	FirstName: {
		type: 'string',
	},
	Surname: {
		type: 'string'
	},
	'Date of Birth': {
		type: 'date',
		required: true
	}
}

var userModel = {
	FirstName: {
		type:'string',
		required: true
	},
	Surname: {
		type:'string',
		required: true,
	},
	Gender: /[M|F]/i,
	Position: {
		type:'string',
		required: true,
		validations:[
			function(val){
				if(val=='CEO' || val=='CTO' || val=='Developer'){
					return true;
				}
				return false;
			}
		]
	}
};

var storageManager = new StorageManagerObj({});

storageManager.createStore({
	type: 'Memory',
	name: 'MyDatabase'
}, function(err, MyStore){
	if(!err){
		console.log('Store Created');
		//validate the data records against the userModel object
		for(var recIdx in seedData.Users){
			var recordValid = MyStore.validateRecord(seedData.Users[recIdx], userModel);
			console.log('Validating Record('+recIdx+'):'+(recordValid?'Passed':'Failed'));
		}
	}else{
		console.log(err);
	}
	
});





