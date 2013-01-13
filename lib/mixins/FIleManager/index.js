var fs = require('fs');
var path = require('path');

var mixinFunctions = {
	init: function(cfg, callback){
		var thisNode = this;
		
		//should be called when the mixin is actually ready, not simp;y at the end of the init function
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
	FileManager_watchDirectory: function(id, path){
		var thisNode = this;
		
		return true;
	},
	FileManager_unwatchDirectory: function(id, callback){
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
	