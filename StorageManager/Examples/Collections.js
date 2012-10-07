var StorageManagerObj = require('../StorageManager').StorageManager;


var userModel = {
	FirstName: {
		type:'string',
		required: true,
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

var storageManager = new StorageManagerObj({
	stores: [
		{
			type: 'Memory',
			name: 'TechDatabase',	
			channels:[
				'master',
				{
					name: 'Users',
					model: userModel
				}
			],
			defaultChannel: 'master'
		},
		{
			type: 'Memory',
			name: 'HRDatabase',
			channels:[
				'master',
				{
					name: 'Users',
					model: userModel
				}
			],
			defaultChannel: 'master'
		}
	],
	collections:[
		{
			name: 'AllDevelopers',
			query: {
				Position: 'Developers'
			}
		},
		{
			name: 'ITStaff',
			query: [
				{
					Position: 'Developers'
				},
				{
					Position: 'CTO'
				}
			]
		}
	]
});


var ITStore = storageManager.getStore({
	name: /TechDatabase/i
});


var seedData = [
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
];

for(var i in seedData){
	console.log(ITStore.validateRecord(seedData[i], userModel));
}
process.exit();

var query = {
	Position: 'Developer'
}

storageManager.on('error', function(){
	console.log('StorageManager Error');
	
	console.log(arguments);
});

storageManager.on('StorageManager.RecordSaved', function(err, record){
	console.log('Record Saved: '+record.id);
});

storageManager.save(seedData, function(){
	console.log('Seed Data Saved');
});

var allDevelopers = storageManager.createCollection({
	query: {
		Position: 'Developer'
	},
	autoSync: true,
	listeners:{
		'Collection.Updated': function(records){
			console.log(records.length+' records Modified in collection');
		}
	}
}, [], 'Position:Developers');

var allIT = storageManager.createCollection(
	{
		query: [
			{
				Position: 'Developer'
			},
			{
				Position: 'CTO'
			}
		]
	}, 
	[], 
	'Position:Developers'
);

allIT.on('Collection.Updated', function(records){
	console.log(records.length+' records Modified in collection');
});

allIT.sync(function(){
	//console.log(allIT);
});

storageManager.save({
	FirstName: 'Sue',
	Surname: 'Citizen',
	Position: 'Senior Developer',
}, function(){
	console.log('USER ADDED');
});


