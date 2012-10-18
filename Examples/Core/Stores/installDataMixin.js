var mixinFunctions = {
	init: function(cfg, callback){
		var thisNode = this;
		//add properties that are needed by this mixin
		
		//first let's see if the data has already been installed
		thisNode.StorageManager.findOne({
			FirstName: 'Joe'
		}, function(err, rec){
			if(!rec || rec.length==0){
				console.log('Installing test data');
				thisNode.StorageManager.save([
					{
						FirstName: 'Joe',
						Surname: 'Roberts',
						Position: 'CEO',
						Gender: 'M',
						Age: 50
					},
					{
						FirstName: 'Jane',
						Surname: 'Smith',
						Position: 'CTO',
						Gender: 'F',
						Age: 40
					},
					{
						FirstName: 'John',
						Surname: 'Cooper',
						Position: 'Developer',
						Gender: 'M',
						Age: 30
					},
					{
						FirstName: 'Ronald',
						Surname: 'Citizen',
						Position: 'Developer',
						Gender: 'M',
						Age: 20
					},
					{
						FirstName: 'Jason',
						Surname: 'Smithson',
						Position: 'Developer',
						Gender: 'M',
						Age: 20
					},
					{
						FirstName: 'Danielle',
						Surname: 'Westsmith',
						Position: 'Developer',
						Gender: 'F',
						Age: 20
					}
				], function(){
					console.log('all data saved');
					thisNode.emit('Mixin.Ready', {
						name: 'initDataMixins'
					});
					if(callback){
						callback();
					}
				});
			}
		})
		//add Events that are emitted by this mixin
			
	}
}

if (typeof define === 'function' && define.amd) {
	define(mixinFunctions);
} else {
	module.exports = mixinFunctions;
}
	