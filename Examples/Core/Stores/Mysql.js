var FluxNode = require('../../../FluxNode').FluxNode;

new FluxNode(
	{
		
		stores:[
			{
				type: 'mysql',
				id: 'TestDB',
				options:{
					host: 'localhost',
					user: 'myuser',
					password: 'mypass',
					database: 'TestDB'
				},
				isDefault: true
			}
		]	
	}, 
	function(thisNode){
		thisNode.on('Store.Ready', function(err, store){
			if(store.id=='TestDB'){
				store.getChannel('test_table', function(err, channel){
					var model = channel.getModel();
					var newRec = channel.newRecord({
						id_field: model.generateId(),
						name: 'test insert',
						description: 'testing a description insert',
						created_by: 1,
						created_at: new Date()
					});
					console.log('------------');
					newRec.save(function(err, savedRecs){
						var record = savedRecs[0].record;
						
						record.set('name', 'test update');
						record.set('description', 'modified description here');
						
						record.save(function(){
							console.log('saved');
						});
					});
				
				});
			}
		});
	}
);
