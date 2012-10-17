Flux-Node.StoreManager
=========

Flux Singularity Storage Manager
---------

The Flux Singularity Storage Manager provides a consistent interface for the storage and retrieval of complex data objects.

## Basic Data Functions

### Saving Data

``` javascript

    var data = [
    	{
    		FirstName: 'Joe',
    		Surname: 'Citizen'
    	},
    	{
    		FirstName: 'Jane',
    		Surname: 'Citizen'
    	},
    	{
    		FirstName: 'John',
    		Surname: 'Doe'
    	},
    	{
    		FirstName: 'Jane',
    		Surname: 'Doe'
    	}
    ];
    
	MyNode.StoreManager.save(data, function(err, records){
		if(!err){ //no errors, all records are fine
			for(var recordIndex in records){
				var record = records[recordIndex].record;
				console.log(record.id+': '+record.FirstName+' '+record.Surname);
			}
		}else{
			//an error ocurred, but not all records may have had an error, so let's check
			for(var recordIndex in records){
				var record = records[recordIndex].record;
				if(record.err!==false){ //uh-oh
					console.log(err);
				}else{
					console.log(record.id+': '+record.FirstName+' '+record.Surname);
				}
			}
		}
	});
```


### Retrieving Data


``` javascript

	// find all users with the surname "Citizen"
    var query = {
    	Surname: 'Citizen'
    };
    
	MyNode.StoreManager.find(query, function(err, records){
		if(!err){
			for(var recordIndex in records){
				var record = records[recordIndex].record;
				
				console.log(record.id+': '+record.Surname+', '+record.FirstName);
			}
		}else{
			console.log(err);
		}
	});
	
	// find the first user with the first name "Jane"
    var query = {
    	FirstName: 'Jane'
    };
    
	MyNode.StoreManager.findOne(query, function(err, records){
		if(!err){
			for(var recordIndex in records){
				var record = records[recordIndex].record;
				
				console.log(record.id+': '+record.Surname+', '+record.FirstName);
			}
		}else{
			console.log(err);
		}
	});
```

### Queries

The following table provides details on using queries within Flux Singularity.  The query language provides a consistent method of querying data across store types.

<table width="100%">
	<tr>
		<th>Operator</th><th>Syntax</th><th>Example</th>
	</tr>
	<tr>
		<td>Equals</td><td>{<br/>&nbsp;&nbsp;&nbsp;eq: <i>value</i> <br/>}</td><td>{<br/>&nbsp;&nbsp;&nbsp;username: "user1" <br/>}<br/><br/><b>OR</b><br/><br/>{<br/>&nbsp;&nbsp;&nbsp;username: {<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;eq: "user1" <br/>&nbsp;&nbsp;&nbsp;}<br/>}</td>
	</tr>
	<tr>
		<td>Does Not Equal</td><td>{<br/>&nbsp;&nbsp;&nbsp;neq: <i>value</i> <br/>}</td><td>{<br/>&nbsp;&nbsp;&nbsp;active: {<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;neq: false <br/>&nbsp;&nbsp;&nbsp;}<br/>}</td>
	</tr>
	<tr>
		<td>Less Than</td><td>{<br/>&nbsp;&nbsp;&nbsp;lt: <i>value</i> <br/>}</td><td>{<br/>&nbsp;&nbsp;&nbsp;user_age: {<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;lt: 14 <br/>&nbsp;&nbsp;&nbsp;}<br/>}</td>
	</tr>
	<tr>
		<td>Greater Than</td><td>{<br/>&nbsp;&nbsp;&nbsp;gt: <i>value</i> <br/>}</td><td>{<br/>&nbsp;&nbsp;&nbsp;user_age: {<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;gt:13 <br/>&nbsp;&nbsp;&nbsp;}<br/>}</td>
	</tr>
	<tr>
		<td>Less Than or Equal to</td><td>{<br/>&nbsp;&nbsp;&nbsp;lte: <i>value</i> <br/>}</td><td>{<br/>&nbsp;&nbsp;&nbsp;user_age: {<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;lte: 13 <br/>&nbsp;&nbsp;&nbsp;}<br/>}</td>
	</tr>
	<tr>
		<td>Greater Than or Equal to</td><td>{<br/>&nbsp;&nbsp;&nbsp;gte: <i>value</i> <br/>}</td><td>{<br/>&nbsp;&nbsp;&nbsp;user_age: {<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;gte: 14 <br/>&nbsp;&nbsp;&nbsp;}<br/>}</td>
	</tr>
	<tr>
		<td>Contains</td><td>{<br/>&nbsp;&nbsp;&nbsp;ct: <i>value</i> <br/>}</td><td>{<br/>&nbsp;&nbsp;&nbsp;blog_title: {<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ct: "Flux Singularity Update:" <br/>&nbsp;&nbsp;&nbsp;}<br/>}</td>
	</tr>
	<tr>
		<td>Does not Contain</td><td>{<br/>&nbsp;&nbsp;&nbsp;dct: <i>value</i> <br/>}</td><td>{<br/>&nbsp;&nbsp;&nbsp;blog_title: {<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;dct: "Flux Singularity Update:" <br/>&nbsp;&nbsp;&nbsp;}<br/>}</td>
	</tr>
	<tr>
		<td>Attribute Exists</td><td>{<br/>&nbsp;&nbsp;&nbsp;ae: <i>true/false</i> <br/>}</td><td>{<br/>&nbsp;&nbsp;&nbsp;object_type: {<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ae: true<br/>&nbsp;&nbsp;&nbsp;}<br/>}</td>
	</tr>
</table>

#### AND & OR Queries

"AND" queries are the default in Flux Singularity.  If you provide an query object with multiple attribute keys, it is assumed that all key criteria supplied must match.

```

var mediumCategoryQueue = {
	outstanding_tickets:[
		{
			gte: 10
		},
		{
			lte: 20
		}
	]
}

```

"OR" queries can be performed by supplying an array of standard queries to the search functions.

```

var query = [
	{
		user_dept: "HR"
	},
	{
		user_dept: "IT"
	}
]

```

### Deleting Data

## Stores and the Storage Manager

Stores are the objects that allow the StoreManager to provide a consistent interface for data within Flux Singularity, providing a link between the Flux Singularity functions and the equivalent functionality of the associated database engine.

## StorageManager Events

As with everything else in FluxSingularity, the StoreManager is an instance of the event emitter.  The following events may be emitted by the StoreManager.

### Store.Connected

Fired when a registered Store has connected to it's host database engine.

### Store.Disconnected

Fired when a registered Store has been disconnected from it's host database engine.

### Store.RecordSaved

Fired When a Record has been saved in any of the registered Stores.

### Store.RecordDeleted

Fired when a record has been deleted from any of the registered Stores.

### Channel.Saved

Fired when the configuration for a Channel has been saved in any of the registered Stores.

### Channel.Deleted

Fired when a Channel has been deleted from any of the registered Stores.

### Channel.RecordsModified

Fired when any records associated with a channel have been saved or removed.

## StorageManager API

### configure(config, [callback(err, storeConfig)])

__Parameters__

* config: object

An object containing the configuration options for the StoreManager

* callback(err, storeConfig)

An optional function that will be called when the configuration process is complete, where _err_ is either _false_ or an _object_ containing the information of any errors that occurred and _storeConfig_ is the current configuration options for the StoreManager.

__Configuration Options__

The config object can be made up of any combination of the following keys.

* name

### createCollection(config, [callback(err, collection)])

Not Yet Implemeted

### createStore(config, [callback(err, newStore)])

Creates a store.

__Parameters__

* config

An object containing the options for the store that is to be created.

* callback

An optional function that will be executed when the store has been created, where _err_ is either _false_ or an _object_ containing the infortmation of any errors that occurred, and _newStore_ is the newly created store.  Any store created using _createStore_ will automatically be registered with the StoreManager if no errors ocurred.

### factory(type, [callback(err, driverClass)])

Retrieve the driver for a type of Store.  When used in the browser, a callback __must__ be defined.

__Parameters__

* type

A string that represents the name of an installed Store Driver.

* callback

An optional function that will be called when the driver class has been retrieved, or an error has occurred, where _err_ is either _false_ or an _object_ containing the information of any errors that occurred and _driverClass_ is the constructor for the Store.  Due to the asynchronous nature of the _require()_ mechanism used in web browsers, this parameter is required.

### find(query [stores], [channels], [callback(err, records)])

Finds records that matches the supplied query.

### NOT YET IMPLEMENTED - findAndUpdate(query, update, [channels], [callback(err, records)])

### findOne(query, [stores], [channels], [callback(err, record)])

Finds the first record that matches the supplied query.

### getDefaultStore()

Returns the default store for the StoreManager.

### getStore(query, [callback(err, store)])

Retrieves the first instance of a Store that matches the supplied criteria.

### registerStore(storeID, store, [callback])

Registers a Store with the StoreManager.

### remove(query, [stores], [channels], [callback(err, records)])

Removes any records that match the supplied criteria.

### save(records, [stores], [channels], [callback(err, records)])

Saves an array of records

## Store API

### find(query, [channels], [callback(err, records)])

Finds records that matches the supplied query.

### NOT YET IMPLEMENTED - findAndUpdate(query, update, [channels], [callback(err, records)])

Finds any records that match the supplied query, and updates them with the data in the _update_ parameter.

### findOne(query, [channels], [callback(err, record)])

Finds the first record that matches the supplied query.

### remove(query, [channels], [callback(err, records)])

Removes any records that match the supplied criteria.

### save(records, [channels], [callback(err, records)])

Saves an array of records
