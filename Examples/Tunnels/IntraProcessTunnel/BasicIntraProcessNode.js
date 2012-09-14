var FluxNode;
FluxNode = require('../../../lib/FluxNode_0.0.1').FluxNode;


//create the first node
var Node_One = new FluxNode({});

//listen for our custom event
Node_One.on('My.Message', function(message, rawMsg){
	console.log('My.Message Recieved from '+rawMsg._message.sender+': '+message.SomeData);
});

//create the second node
var Node_Two = new FluxNode({});

//Add a Tunnel between the two nodes
Node_Two.addTunnel({ //we only need to add it to one node, the tunnel will handle registering with the other node
	destination: Node_One.id,//connect to the server we made above
	type: 'IntraProcessNode',
	options:{
		Node1: Node_One,
		Node2: Node_Two
	}
});

console.log('SENDING FROM Node_Two TO Node_One');
//send an event from Node_Two to Node_One
Node_Two.sendEvent(Node_One.id, 'My.Message', {SomeData: 'Goes Here'});

//if nothing is added here to prevent the process form ending, it'll end
