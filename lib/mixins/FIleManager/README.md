Flux-Node/lib/mixins/FileManager
=========

File Manager
---------
Provides functionality for basic Directory and File manipulation.


### Mixin

```javascript
	new FluxNode({
		mixins: [
			{
				name: 'FileManager'
			}
		]
	}, function(myNode){
		//myNode is now ready and running with File Manipulation Functions
		console.log(myNode);
	});
	
	//OR
	
	new FluxNode({}, function(myNode){
		myNode.mixin('FileManager', {}, function(mixinInfo){
			//myNode is now ready and running with File Manipulation Functions
		});
	});
```

#### Configuration Options

None

## Settings

None

## Methods

### FileManager_createDirectory

Creates a directory

### FileManager_copyDirectory

Copies a directory

### FileManager_moveDirectory

Moves a directory

### FileManager_deleteDirectory

Deletes a directory

### FileManager_createFile

Creates a file

### FileManager_copyFile

Copies a file

### FileManager_moveDirectory

Moves a file

### FileManager_deleteDirectory

Deletes a file

## Events

### FileManager.Directory.Created

### FileManager.Directory.CreatError

### FileManager.Directory.Copied

### FileManager.Directory.CopyError

### FileManager.Directory.Moved

### FileManager.Directory.MoveError

### FileManager.Directory.Deleted

### FileManager.Directory.DeleteError

### FileManager.File.Created

### FileManager.File.CreatError

### FileManager.File.Copied

### FileManager.File.CopyError

### FileManager.File.Moved

### FileManager.File.MoveError

### FileManager.File.Deleted

### FileManager.File.DeleteError

## Listeners

### FileManager.Directory.Create

### FileManager.Directory.Copy

### FileManager.Directory.Move

### FileManager.Directory.Delete

### FileManager.File.Create

### FileManager.File.Copy

### FileManager.File.Move

### FileManager.File.Delete
