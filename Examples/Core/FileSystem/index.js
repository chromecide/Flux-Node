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
