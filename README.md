Flux-Node
=========

# Flux Singularity Core for Javascript

At it's core, a FluxNode is an enhanced event emitter.  The built in Message Manager allows connections between FluxNodes(called Tunnels), within the same script, on the same machine, 
or even on entirely seperate machines communicating via the internet.  These other FluxNodes can Subscribe to events emitted by the local node, and can be Subscribed to.

## Current Status

### Major TODOs


## Requirements

### Browser

RequireJS - [http://requirejs.org/](http://requirejs.org/) 
	

### NodeJS
	
EventEmitter2 - [https://github.com/hij1nx/EventEmitter2](https://github.com/hij1nx/EventEmitter2)


## Flux Singularity Terminology

### FluxNodes

FluxNodes (or Nodes) form the basis of Flux Singularity.  On their own they are capable of very little, but when "Mixins" are added, the posibilities are endless.

FluxNodes, whether in the browser or NodeJS, have built in Storage and Tunnel Managers that allow simple methods for saving and retrieving data, as well as communicating with other FluxNodes
 
#### FluxNode Network

This term is used to describe a network of interconnected FluxNodes.  This can be a network of FluxNodes all running in the same process, on the same machine, on seperate machines, or a combination of the three.

### Events

Events are what allows the flexibility and expandability of FluxNodes.  Almost everything that happens within a FluxNode will emit an event.  These events can be listened for, and additional functionality can be added.

### The TunnelManager

The TunnelManager handles the processing of Messages to and from FluxNodes, and translating them into events that can be emitted by the recieving FluxNode.

#### Tunnels

Tunnels are the connections between FluxNodes.  They enable a simple method of sending messages between FluxNodes, without having to worry about the technicalities of the commucation method, whether it be Websockets, TCP or something else entirely.

### The Storage Manager

The StorageManager, as the name implies, handles the data storage and retrieval for a FluxNode.  It enables data managament to be a simple and consistent activity, irespective of the Database Engine used.

#### Stores

Stores are the connectors between the data manager and a Database engine.  They provide a consistent interface for saving and retrieving complex objects.

#### Channels

Channels can be thought of like tables within a traditional database engine.  They allow records of similar types to be grouped together.

#### Collections

Collections are similar to Channels, but operate at the StorageManager Level and are read only.  They can be queried in the same way as a Store, but may span multiple actual Stores.

#### Models

The Model system used by the StorageManager does not use a traditional method of defining data.  Instead it uses the idea of validating data instead of defining it.  Standard style field configurations can be supplied, but are simply translated into a validation function.

These validations for fields can be used to both validate data before saving to a store, as well as for querying the same data.

#### Queries 

Queries can be performed in a number of ways.

### Mixins

Mixins are at the heart of Flux Singularity.  They extend the basic functionality of a FluxNode and include everything from Group Based Security to POP3 email functionality, and many many more.

## Installing Flux Singularity

### Pre-requisites

The following applications and libraries need to be installed before setting up Flux Singularity.

#### NodeJS


### Flux Singularity Core

#### NPM

```
Flux-Node will not be published to the npm repository until the first beta release.  Please see manual installation instructions below

```

####  Manual Installation




## Using Flux Singularity

### Basics

FluxNode can be used both in NodeJS and the browser, although some mixins may only work in one or the other (such as the TCP mixin, which only works in NodeJS)

#### Creating a Node
```javascript
var myNode = new FluxNode({});
```

#### Mixins

FluxNode provides a basic core of functionality for a distributed event system.  Mixins Provide a simple mechanism for extending that functionality with custom properties and methods.

```javascript
var myNode = new FluxNode({
	mixins:[
		{
			name: 'TCPServer',
			options:{
				host: 'localhost',
				port: 8080
			}
		}
	]
});
```

#### Tunnels

Tunnels are the communication connections between FluxNodes.  They provide a wrapper around different communication methods to allow uniform messages to be sent, whether the remote FluxNode
is connected via TCP, or Websockets. 

```javascript
var myNode = new FluxNode({
	tunnels:{
		"RemoteNodeIDHere":{
			type: "TCP",
			host: "localhost",
			port: 8080
		}
	}
});
```

#### Stores



## More Information

More Examples for using FluxNode can be found in the Examples and Apps folders.

More detailed information about the API can be found in the README in the lib folder

Information about mixins can be found in READMEs for the individual mixins found in '/lib/mixins'


Twitter: @chromecide