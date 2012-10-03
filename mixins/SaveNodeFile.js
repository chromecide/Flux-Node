var mixinFunctions = {
	init: function(){
		var self = this;
		
		//add properties that are needed by this mixin
	
		//add Events that are emitted by this mixin
		
		self.on('fluxnode.datachanged', function(){
			self.SaveNodeFile.Save();
		})
	},
	SaveNodeFile: {
		Save: function(){
			console.log('saving node file');
			console.log(process.mainModule.filename);
			console.log(this);
		}
	}
}

	module.exports = mixinFunctions;