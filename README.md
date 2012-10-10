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

### Nodes

### Tunnels

#### The TunnelManager

#### Tunnels

### Stores

#### The StorageManager

#### Stores

#### Channels

#### Collections

#### Models

#### Queries 

### Mixins


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

## More Information

More Examples for using FluxNode can be found in the Examples and Apps folders.

More detailed information about the API can be found in the README in the lib folder

Information about mixins can be found in READMEs for the individual mixins found in '/lib/mixins'


Twitter: @chromecide