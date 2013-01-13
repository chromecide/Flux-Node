var examplePath = process.cwd();

var FluxNode = require('../../../FluxNode.js').FluxNode;
	
new FluxNode({
	name: 'File System Example',
	listeners:{
		'FileManager.Directory.Created': function(pathCfg){
			console.log('DIR CREATED: '+pathCfg.path);
		}
	},
	mixins:[
		{
			name: 'FileManager'
		}
	]
}, function(thisNode){
	console.log('Starting File Example');
	
	thisNode.FileManager_createDirectory(
		examplePath+'/FluxNodeTest/SubDir1/SubDir2/Subdir3',
		function(err, errors){
			if(!err){
				console.log('DIRECTORY CREATED');
				thisNode.FileManager_copyDirectory(
					examplePath+'/FluxNodeTest',
					examplePath+'/FluxNodeTest2',
					function(err, errors){
						if(!err){
							console.log('DIRECTORY COPIED');
							thisNode.FileManager_deleteDirectory(examplePath+'/FluxNodeTest', function(err, errors){
								console.log(arguments);
								if(!err){
									console.log('DIRECTORY DELETED');
									thisNode.FileManager_moveDirectory(
										examplePath+'/FluxNodeTest2/SubDir1/SubDir2', 
										examplePath+'/FluxNodeTest2/SubDir2',
										function(err, errors){
											if(!err){
												console.log('DIRECTORY MOVED');
												thisNode.FileManager_createFile(examplePath+'/FluxNodeTest2/', 'test.txt', function(err, errors){
													if(!err){
														console.log('FILE CREATED');
														thisNode.FileManager_copyFile(examplePath+'/FluxNodeTest2/test.txt', examplePath+'/FluxNodeTest2/SubDir1/test.txt', function(err, errors){
															if(!err){
																console.log('FILE COPIED');
																thisNode.FileManager_moveFile(examplePath+'/FluxNodeTest2/test.txt', examplePath+'/FluxNodeTest2/SubDir1/test2.txt', function(err, errors){
																	if(!err){
																		console.log('FILE MOVED');
																		thisNode.FileManager_deleteFile(examplePath+'/FluxNodeTest2/SubDir1/test.txt', function(err, errors){
																			if(!err){
																				console.log('FILE REMOVED');
																				thisNode.FileManager_watch('Test', examplePath+'/FluxNodeTest2/SubDir1/test2.txt', function(err, errors){
																					thisNode.on('FileManager.Watch.Test.Accessed', function(){
																						console.log('FILE ACCESSED');
																					});
																					
																					thisNode.on('FileManager.Watch.Test.Changed', function(){
																						console.log('FILE CHANGED');
																					});
																					
																					thisNode.on('FileManager.Watch.Test.FileAdded', function(){
																						console.log('FILE ADDED');
																					});
																					
																					thisNode.on('FileManager.Watch.Test.FileDeleted', function(){
																						console.log('FILE DELETED');
																					});
																					
																					thisNode.on('FileManager.Watch.Test.Deleted', function(){
																						console.log('FILE DELETED');
																					});
																					
																				});
																				
																			}else{
																				console.log(errors);
																			}
																		});
																	}else{
																		console.log(errors);
																	}
																});
															}else{
																console.log(errors);
															}
														});
													}else{
														console.log(errors);
													}
												});
											}else{
												console.log(errors);
											}
										}
									);
								}else{
									console.log(errors);
								}
							});
						}else{
							console.log(errors);
						}
					}
				);
			}else{
				console.log(errors);
			}
		}
	);
});
