var fs = require('fs');
var path = require('path');

var asyncfs = require('async-fs')
var _ = require('underscore')
var mixinFunctions = {
	init: function(cfg, callback){
		var thisNode = this;
		
		if(!cfg){
			cfg = {};
		}
		
		if(cfg.watch){
			for(var i=0;i<watch.length;i++){
				var watchItem = watch[i];
				thisNode.watch(
					watchItem.id,
					watchItem.path
				);
			}
		}
		
		thisNode.on('FileManager.Watch', function(message, rawMessage){
			thisNode.FileManager_watch(message.id, message.path);	
		});
		
		thisNode.on('FileManager.Unwatch', function(message, rawMessage){
			thisNode.FileManager_unwatch(message.id, message.path);	
		});
		
		thisNode.on('FileManager.Directory.Create', function(message, rawMessage){
			thisNode.FileManager_createDirectory(message.path);
		});
		
		thisNode.on('FileManager.Directory.Copy', function(message, rawMessage){
			thisNode.FileManager_copyDirectory(message.sourcePath, message.targetPath);
		});
		
		thisNode.on('FileManager.Directory.Move', function(message, rawMessage){
			thisNode.FileManager_MoveDirectory(message.sourcePath, message.targetPath);
		});
		
		thisNode.on('FileManager.Directory.Delete', function(message, rawMessage){
			thisNode.FileManager_deleteDirectory(message.path);
		});
		
		thisNode.on('FileManager.File.Create', function(message, rawMessage){
			thisNode.FileManager_createDirectory(message.path, message.fileName);
		});
		
		thisNode.on('FileManager.File.Copy', function(message, rawMessage){
			thisNode.FileManager_copyDirectory(message.sourcePath, message.targetPath);
		});
		
		thisNode.on('FileManager.File.Move', function(message, rawMessage){
			thisNode.FileManager_MoveDirectory(message.sourcePath, message.targetPath);
		});
		
		thisNode.on('FileManager.File.Delete', function(message, rawMessage){
			thisNode.FileManager_deleteDirectory(message.path);
		});
		
		thisNode.emit('Mixin.Ready', {
			name: 'FileManager'
		});
		
		if(callback){
			callback({
				name: 'FileManager',
				config: cfg
			});
		}
	},
	FileManager_watchFileCallbackCreator: function(id, filePath){
		var thisNode = this;
		return function(curr, prev){
			if (curr.nlink === 0) {
				thisNode.emit('FileManager.Watch.'+id+'.Deleted', {
					id: id, 
					path: filePath, 
					curr: curr, 
					prev: prev
				});
				thisNode.FileManager_unwatch(id, path);
		    }else{
		    	if(curr.mtime.getTime()>prev.mtime.getTime()){
					if (curr.isDirectory() && prev.isDirectory()) {
						
						var watcher = thisNode.getSetting('FileManager.Watchers.'+id);
						
						if (curr.nlink > prev.nlink) { //files were added
		        			if(watcher.FileList){
		        				fs.readdir(filePath, function(err, files) {
		        					var addedFiles = _.difference(files, watcher.FileList);
		        					_.each(addedFiles, function(filename){
		        						thisNode.emit(
		        							'FileManager.Watch.'+id+'.FileAdded', 
			        						{
			        							id: id, 
			        							path: filePath+'/'+filename, 
			        							curr: curr, 
			        							prev: prev
			        						}
		        						);
		        					});
		        				});
		        			}else{
		        				thisNode.emit('FileWatcher.Watch.'+id+'.FileAdded', {path: filePath, curr: curr, prev: prev});	
		        			}
		        		} else if (curr.nlink < prev.nlink) { // files were removed
		        			
	        				var watcher = thisNode.getSetting('FileManager.Watchers.'+id);
	        				var files = fs.readdirSync(filePath);
        					thisNode.setSetting('FileManager.Watchers.'+id+'.FileList', files);
        					
        					thisNode.emit('FileManager.Watch.'+id+'.FileDeleted', {id: id,path: filePath, curr: curr, prev: prev});
	        			
	        			}else{ //files were added and removed(or one was renamed)
	        				fs.readdir(filePath, function(err, files) {
	        					var addedFiles = _.difference(files, watcher.FileList);
	        					var removedFiles = _.difference(watcher.FileList, files);
	        					
	        					_.each(addedFiles, function(filename){
	        						thisNode.emit(
	        							'FileManager.Watch.'+id+'.FileAdded', 
		        						{
		        							id: id, 
		        							path: filePath+'/'+filename, 
		        							curr: curr, 
		        							prev: prev
		        						}
	        						);
	        					});
	        					
	        					_.each(removedFiles, function(filename){
	        						thisNode.emit(
	        							'FileManager.Watch.'+id+'.FileDeleted', 
		        						{
		        							id: id, 
		        							path: filePath+'/'+filename, 
		        							curr: curr, 
		        							prev: prev
		        						}
	        						);
	        					});
	        					
	        				});
	        			}
		        		
		      		}else{ //file
		      			
		      			if(curr.size!=prev.size){
							thisNode.emit('FileManager.Watch.'+id+'.Changed', {
								id: id,
								path: filePath,
								time: curr.mtime,
								curr:curr,
								prev:prev
							});	
						}
		      		}
				}else{
					if(curr.atime.getTime()!=prev.atime.getTime()){
						thisNode.emit('FileManager.Watch.'+id+'.Accessed', {
							id: id,
							path: filePath,
							time: curr.mtime,
							curr:curr,
							prev:prev
						});		
					}
				}	
		    }
		}
	},
	FileManager_watchDirectoryCallbackCreator: function(id, path){
		return function(action){
			console.log(id+': '+path);
			console.log(arguments);
			switch(action){
				case 'change':
					
					break;
			}
		}
	},
	FileManager_watch: function(id, filepath, callback){
		var thisNode = this;
		console.log('CALLING');
		var err = false;
		var errors = [];
		
		if(!id){
			id = filepath.replace(path.sep, '_');
		}
		
		if(id){
			if(filepath){
				try{
					var fStat = fs.statSync(filepath);
					var watcher = fs.watchFile(filepath, thisNode.FileManager_watchFileCallbackCreator(id, filepath));
					if(fStat.isDirectory){
						//build a cache of the file list
						var files = fs.readdirSync(filepath);
						watcher.FileList = files;
					}
					
					
					watcher.fileManagerId = id;
					watcher.fileManagerPath = filepath;
					thisNode.setSetting('FileManager.Watchers.'+id, watcher);
				}catch(e){
					console.log('FILEMANAGER_WATCH');
					console.log(e);
					err = true; 
				}
			}
		}
		
		var returnObj = {
			id:id,
			path: path	
		};
		
		if(!err){
			thisNode.emit('FileManager.Watching', returnObj);
		}else{
			returnObj.errors = errors;
			thisNode.emit('FileManager.WatchError', returnObj);
		}
		
		if(callback){
			callback(err, err?errors: returnObj);
		}
	},
	FileManager_unwatch: function(id, filepath, callback){
		var thisNode = this;
		
		var err = false;
		var errors = [];
		
		if(!id){
			if(path){
				id = filepath.replace(path.sep, '_');	
			}else{
				err = true;
				errors.push({
					message: 'Invalid Criteria Supplied'
				});
			}
		}
		
		if(id){
			var watcher = thisNode.getSetting('FileManager.Watchers.'+id);
			if(watcher){
				try{
					thisNode.setSetting('FileManager.Watchers.'+id, false);
				}catch(e){
					err = true;
					console.log(e);
				}
			}
		}
		
		if(!err){
			thisNode.emit('FileManager.Watchers.'+id+'.Unwatched', {
				id: id,
				path: filepath
			});
		}else{
			thisNode.emit('FileManager.Watchers.'+id+'.UnwatchError', {
				id: id,
				path: filepath
			});
		}
		
		if(callback){
			callback(err, err?errors:{id: id, path: filepath});
		}
	},
	FileManager_watchTree: function(id, path){
		var thisNode = this;
		
		return true;
	},
	FileManager_unwatchTree: function(id, callback){
		var thisNode = this;
		
		return true;
	},
	FileManager_createDirectory: function(directoryPath, mode, callback){
		var thisNode = this;
		
		var err = false;
		var errors = [];
		if((typeof mode)=='function'){
			callback = mode;
			mode = false;
		}
		
		if(!mode){
			mode = '0777';
		}
		
		if(!directoryPath){
			err = true;
			errors.push({
				message: 'No Path supplied'
			});
		}
		
		if(!err){
			var pathParts = directoryPath.split(path.sep);
			var pathIndex = 0;
			
			for(var partIdx=0;partIdx<=pathParts.length;partIdx++){
				if(!err){
					var pathPart = pathParts[partIdx];
					var pathSlice = pathParts.slice(0, partIdx);
					var checkPath = pathSlice.join(path.sep);
					if(!checkPath==''){
						if(!fs.existsSync(checkPath)){
							try{
								var mkErr = fs.mkdirSync(checkPath, mode);
								thisNode.emit('FileManager.Directory.Created', {
									path: checkPath
								});
							}catch(e){
								err = true;
								switch(e.code){
									case 'EACCES':
										errors.push({
											message: 'Permission Denied to create Directory: '+checkPath
										});
										break;
									default:
										errors.push({
											message: 'Unhandled Exception for FileManager_createDirectory: '+checkPath
										});
										thisNode.emit('error', new Exception('Unhandled Exception for FileManager_createDirectory'));
										break;
								}
							}
						}	
					}
				}
			}
		}
		
		if(callback){
			callback(err, errors);
		}
		
		return errors.length>0?errors:true;
	},
	FileManager_moveDirectory: function(sourcePath, targetPath, callback){
		var thisNode = this;
		
		var err = false;
		var errors = [];
		//copy directory
		var filesCopied = thisNode.FileManager_copyDirectory(sourcePath, targetPath);
		if(filesCopied!==true){
			err = true;
			errors = errors.concat(filesCopied);
		}else{
			//then delete directory
			var filesRemoved = thisNode.FileManager_deleteDirectory(sourcePath);
			if(filesRemoved!==true){
				err = true;
				errors = errors.concat(filesRemoved);
			}
		}
		
		if(!err){
			thisNode.emit('FileManager.Directory.Moved', {
				sourcePath: sourcePath,
				targetPath: targetPath
			});
		}else{
			thisNode.emit('FileManager.Directory.MoveError', {
				errors: errors,
				sourcePath: sourcePath,
				targetPath: targetPath
			});
		}
		
		if(callback){
			callback(err, err?errors: {
				sourcePath: sourcePath,
				targetPath: targetPath
			});
		}
	},
	FileManager_copyDirectory: function(sourcePath, targetPath, callback){
		var thisNode = this;
		
		var err = false;
		var errors = [];
		if(fs.existsSync(sourcePath)){
			if(!fs.existsSync(targetPath)){
				//create the target path
				var targetCreated = thisNode.FileManager_createDirectory(targetPath); 
				if(targetCreated!==true){
					err = true;
					errors = errors.concat(targetCreated);
				}
			}
			
			if(!err){
				var fileList = fs.readdirSync(sourcePath);
				for(var fileIdx=0;fileIdx<fileList.length;fileIdx++){
					var fileName = fileList[fileIdx];
					var stat = fs.statSync(sourcePath+path.sep+fileName);
					if(stat){
						if(stat.isDirectory() || stat.isFile()){
							if(stat.isDirectory()){
								//first create the directory
								var dirCreated = thisNode.FileManager_createDirectory(targetPath+path.sep+fileName);
								if(dirCreated===true){
									var filesCopied = thisNode.FileManager_copyDirectory(sourcePath+path.sep+fileName, targetPath+path.sep+fileName);
									if(filesCopied!==true){
										err = true;
										errors = errors.concat(filesCopied);
									}
								}
							}else{//file
								var fileCopied = thisNode.FileManager_copyFile(sourcePath+path.sep+fileName, targetPath);
								if(fileCopied!==true){
									err = true;
									errors = errors.concat(fileCopied);
								}
							}
						}
					}	
				}
			}
		}else{
			err = true;
			errors.push({
				message: 'Path not found: '+sourcePath
			});
		}
		
		if(!err){
			thisNode.emit('FileManager.Directory.Copied', {
				sourcePath: sourcePath,
				targetPath: targetPath
			});
		}else{
			thisNode.emit('FileManager.Directory.CopyError', errors);
		}
		
		if(callback){
			callback(err, err? errors: {sourcePath:sourcePath, targetPath: targetPath});
		}
		
		return err?errors:true;
	},
	FileManager_deleteDirectory: function(sourcePath, callback){
		var thisNode = this;
		
		var err = false;
		var errors = [];
		
		if(fs.existsSync(sourcePath)){
			if(!err){
				var fileList = fs.readdirSync(sourcePath);
				
				var doRemove = true;
				for(var fileIdx=0;fileIdx<fileList.length;fileIdx++){
					var fileName = fileList[fileIdx];
					
					var stat = fs.statSync(sourcePath+path.sep+fileName);
					if(stat){
						if(stat.isDirectory() || stat.isFile()){
							if(stat.isDirectory()){
								var filesDeleted = thisNode.FileManager_deleteDirectory(sourcePath+path.sep+fileName);
								if(filesDeleted!==true){
									err = true;
									errors = errors.concat(filesDeleted);
									doRemove = false;
								}
							}else{//file
								var fileDeleted = thisNode.FileManager_deleteFile(sourcePath+path.sep+fileName);
								if(fileDeleted!==true){
									doRemove = false;
									err = true;
									errors = errors.concat(fileDeleted);
								}
							}
						}
					}	
				}
			}
				
			if(doRemove){
				try{
					fs.rmdirSync(sourcePath);	
				}catch(e){
					doRemove = false;
					err = true;
					switch(e.code){
						case 'EACCES':
							errors.push({
								message: 'Permission denied for: '+sourcePath+path.sep+fileName
							})
							break;
					}	
				}	
			}
		}else{
			err = true;
			errors.push({
				message: 'Path not found: '+sourcePath
			});
		}
		
		if(!err){
			thisNode.emit('FileManager.Directory.Removed', {
				sourcePath: sourcePath
			});
		}else{
			thisNode.emit('FileManager.Directory.RemoveError', errors);
		}
		
		if(callback){
			
			callback(err, err? errors: {sourcePath:sourcePath});
		}
		
		return err?errors:true;
	},
	FileManager_watchFile: function(id, path){
		var thisNode = this;
		
		return true;
	},
	FileManager_unwatchFile: function(id, callback){
		var thisNode = this;
		
		return true;
	},
	FileManager_createFile: function(targetPath, fileName, callback){
		var thisNode = this;
		
		var err = false;
		var errors = [];
		
		if(targetPath){
			if(fileName){
				try{
					var fd = fs.openSync(targetPath+path.sep+fileName, 'a');
					fs.closeSync(fd); 
				}catch (e){
					err = true;
					console.log(e);
				}
			}else{
				err = true;
				errors.push({
					message: 'No Path supplied'
				});
			}
		}else{
			err = true;
			errors.push({
				message: 'No Path supplied'
			});
		}
		
		var returnObj = {
			path: targetPath,
			filename: fileName
		};
		
		if(!err){
			thisNode.emit('FileManager.File.Created', returnObj);
		}else{
			returnObj.errors = errors;
			thisNode.emit('FileManager.File.CreateError', returnObj);
		}
		
		if(callback){
			callback(err, err?errors:returnObj);
		}
	},
	FileManager_moveFile: function(sourcePath, targetPath, callback){
		var thisNode = this;
		
		var err = false;
		var errors = [];
		
		if(sourcePath){
			if(targetPath){
				try{
					fs.rename(sourcePath, targetPath);
				}catch (e){
					err = true;
					console.log(e);
				}
			}else{
				err = true;
				errors.push({
					message: 'No Path supplied'
				});
			}
		}else{
			err = true;
			errors.push({
				message: 'No Path supplied'
			});
		}
		
		var returnObj = {
			sourcePath: sourcePath,
			targetPath: targetPath
		};
		
		if(!err){
			thisNode.emit('FileManager.File.Moved', returnObj);
		}else{
			returnObj.errors = errors;
			thisNode.emit('FileManager.File.MoveError', returnObj);
		}
		
		if(callback){
			callback(err, err?errors:returnObj);
		}
	},
	FileManager_copyFile: function(sourcePath, targetPath, callback){
		var thisNode = this;
		
		var err = false;
		var errors = [];
		
		if(sourcePath){
			if(targetPath){
				try{
					fs.createReadStream(sourcePath).pipe(fs.createWriteStream(targetPath));
				}catch (e){
					err = true;
					errors.push(e);
					console.log(e);
				}
			}else{
				err = true;
				errors.push({
					message: 'No Target Path supplied'
				});
			}
		}else{
			err = true;
			errors.push({
				message: 'No Source Path supplied'
			});
		}
		
		var returnObj = {
			sourcePath: sourcePath,
			targetPath: targetPath
		};
		
		if(!err){
			thisNode.emit('FileManager.File.Copied', returnObj);
		}else{
			returnObj.errors = errors;
			thisNode.emit('FileManager.File.CopyError', returnObj);
		}
		
		if(callback){
			callback(err, err?errors:returnObj);
		}
	},
	FileManager_deleteFile: function(filePath, callback){
		var thisNode = this;
		
		var err = false;
		var errors = [];
		
		if(filePath){
			try{
				fs.unlink(filePath);
			}catch (e){
				err = true;
				errors.push(e);
				console.log(e);
			}
		}else{
			err = true;
			errors.push({
				message: 'No File Path supplied'
			});
		}
		
		var returnObj = {
			filePath: filePath
		};
		
		if(!err){
			thisNode.emit('FileManager.File.Deleted', returnObj);
		}else{
			returnObj.errors = errors;
			thisNode.emit('FileManager.File.DeleteError', returnObj);
		}
		
		if(callback){
			callback(err, err?errors:returnObj);
		}
	}
}

if (typeof define === 'function' && define.amd) {
	define(mixinFunctions);
} else {
	module.exports = mixinFunctions;
}
	