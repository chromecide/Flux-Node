/*
 * MouseTrack Messages
 * 	TOPIC												Parameters
 * ----------------------------------------------------------------------
 * 	[Destination|*].Discovery.Announce						{id:'Broadcasting Node ID', Events:['Move', 'Click', 'DoubleClick']}
 *  [Destination].Discovery.Subscribe					{Events:[]}
 *  [Destination].MouseTrack.Subscribe.Response			{allowed: Boolean, Events:[]}
 *  [Destination|*].MouseTrack.Start					{id: 'Broadcasting Node ID'}
 *  [Destination|*].MouseTrack.Stop						{id: 'Broadcasting Node ID'}
 * 	[Destination|*].MouseTrack.Move						{X: Number, Y: Number}
 *  [Destination|*].MouseTrack.Click					{X: Number, Y: Number}
 *  [Destination|*].MouseTrack.DoubleClick				{X: Number, Y: Number}
 */
var mixinFunctions = {
	init: function(cfg){
		var self = this;
		console.log('--------');
		console.log('Discovery Manager');
		console.log('--------');
		//add properties that are needed by this mixin
		self.Discovery.Directory = {};
		if(!cfg){
			return false;
		}
		
		//when the FluxNode sends it's ready event
		
		//add Events that are emitted by this mixin
	
		//add Event Handlers required by this mixin
		
		//add the client connection to the announce server
		self.on('tunnelready', function(destinationId, tunnel){
			self.on('Discovery.Announce', function(message){
				if(data.id.toString()!=self.id.toString()){
					for(var nodeId in data){
						self.KnownNodes[nodeId] = data[nodeId];
					}
					console.log('Announce Recieved');
				}
			});
			
			self.emit('*.Discovery.Announce', {
				id: self.id,
				name: cfg.name
			});
		});
	}
}

module.exports = mixinFunctions;