Flux-Node
=========

# Flux Singularity Core for Javascript

Flux Singularity is a distributed event messaging system

## Current Status

### Major TODOs

* Add Some Form Security to the Tunnel Manager
* Move the Require System to an Internal Function within FluxNode

## Requirements

### Browser - (Experimental)

The Browser Support is Extremely limited and I wouldn't rely on it at all

RequireJS - [http://requirejs.org/](http://requirejs.org/) 
	

### NodeJS
	
EventEmitter2 - [https://github.com/hij1nx/EventEmitter2](https://github.com/hij1nx/EventEmitter2)

## Using Flux Singularity

### Browser (Experimental)

The Browser Support is Extremely limited and I wouldn't rely on it at all

### NodeJS

#### Create a Basic Node that does nothing

    var FluxNode = require('/lib/FluxNode_0.0.1').FluxNode;
    
    new FluxNode({
    	
    }, function(myFluxNode){
    	console.log(myFluxNode);
    });
    
#### Create a Basic Node that does nothing, but can accept connections via TCP

    var FluxNode = require('/lib/FluxNode_0.0.1').FluxNode;
    
    new FluxNode({
    	id: '8298e3fc-7265-4d08-a100-4a8714ad1dc3', //if this isn't supplied, it'll be auto generated, but we're going to re-use this one below
    	mixins:{
    		type: 'TCPServer',
    		options:{
    			host: '127.0.0.1',
    			port:8081
    		}
    	}
    }, function(myFluxNode){
    	console.log(myFluxNode);
    });
    
You can now telnet to 127.0.0.1:8081 (not tat you could do anything effectively, but you should see an init message from the server)
    
### Create a Basic Node does nothing, but connects to another Node

Create and run the the example above, then create and rn this in a seperate process (or on a seperate machine, but you'll have to change the options)

    var FluxNode = require('/lib/FluxNode_0.0.1').FluxNode;
    
    new FluxNode({
    	id: '8298e3fc-7265-4d08-a100-4a8714ad1dc3', //if this isn't supplied, it'll be auto generated, but we're going to re-use this one below
    	tunnels:[ //the tunnels configuration is only for making connections to nodes that you know the id for
		{
			destination: '8298e3fc-7265-4d08-a100-4a8714ad1dc3', //connect to the server we made above
			type: 'TCP',
			options:{
				host: '10.0.0.8',
				port: 8080
			}
		}
	],
    }, function(myFluxNode){
    	console.log(myFluxNode);
    });

## More Information

### Flux Singularity Website

http://www.fluxsingularity.com

### Examples

More Examples can be found in the Examples Folder
