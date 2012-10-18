var FluxNode = require('../../../FluxNode').FluxNode;

var sepLine = '--------------------------------------------';

new FluxNode({
	debug:true,
	stores:[
		{
			type: 'mongodb',
			options:{
				host: 'localhost',
				port: 27017,
				databaseName: 'query_test'
			},
			isDefault: true
		}
	],
	mixins:[
		{
			name: __dirname+'/installDataMixin.js'
		}
	]
}, function(myNode){
	
	myNode.on('error', function(){
		console.log('ERR');
		console.log(arguments);
	});
	
	console.log('Find the CEO');
	myNode.StorageManager.find({
		Position: {
			eq: 'CEO'
		}
	}, function(err, records){
		if(records  && records.length>0){
			var ceo = records[0].record;
			console.log(' - '+ceo.FirstName+' '+ceo.Surname);	
			
			console.log('Find all non-CEOs');
			myNode.StorageManager.find({
				Position:{
					neq: 'CEO'
				}
			}, function (err, records){
				if(records  && records.length>0){
					for(var recIdx in records){
						var nonCeo = records[recIdx].record;
						console.log(' - '+nonCeo.FirstName+' '+nonCeo.Surname+': '+nonCeo.Position);
					}
					
					console.log('Find anyone under 40');
					myNode.StorageManager.find({
						Age:{
							lte: 40
						}
					}, function (err, records){
						if(records  && records.length>0){
							for(var recIdx in records){
								var nonCeo = records[recIdx].record;
								console.log(' - '+nonCeo.FirstName+' '+nonCeo.Surname+': '+nonCeo.Position);
							}
							
							console.log('Find anyone over 30');
							myNode.StorageManager.find({
								Age:{
									gt: 30
								}
							}, function (err, records){
								if(records  && records.length>0){
									for(var recIdx in records){
										var nonCeo = records[recIdx].record;
										console.log(' - '+nonCeo.FirstName+' '+nonCeo.Surname+': '+nonCeo.Position);
									}
									
									console.log('Find anyone whose Surname contains "Smith"');
									myNode.StorageManager.find({
										Surname:{
											ct: "Smith",
											ignoreCase:true
										}
									}, function (err, records){
										if(records  && records.length>0){
											for(var recIdx in records){
												var nonCeo = records[recIdx].record;
												console.log(' - '+nonCeo.FirstName+' '+nonCeo.Surname+': '+nonCeo.Position);
											}
											
											console.log('Find anyone whose Surname doesn\'t contain "Smith"');
											myNode.StorageManager.find({
												Surname:{
													dct: "Smith",
													ignoreCase: true
												}
											}, function (err, records){
												if(records  && records.length>0){
													for(var recIdx in records){
														var nonCeo = records[recIdx].record;
														console.log(' - '+nonCeo.FirstName+' '+nonCeo.Surname+': '+nonCeo.Position);
													}
													
													console.log('Find anyone whose Surname contains "Smith but is not "Smithson""');
													myNode.StorageManager.find({
														Surname:[
															{
																ct: "Smith",
																ignoreCase: true
															},
															{
																neq: 'Smithson'
															}
														]
													}, function (err, records){
														for(var recIdx in records){
															var nonCeo = records[recIdx].record;
															console.log(' - '+nonCeo.FirstName+' '+nonCeo.Surname+': '+nonCeo.Position);
														}
													});
												}else{
													console.log('FIND FAILED');
												}
											});
										}else{
											console.log('FIND FAILED');
										}
									});
								}else{
									console.log('FIND FAILED');
								}
							});
						}else{
							console.log('FIND FAILED');
						}
					});
				}else{
					console.log('FIND FAILED');
				}
			});
		}else{
			console.log('FIND FAILED');
		}
	});
});

