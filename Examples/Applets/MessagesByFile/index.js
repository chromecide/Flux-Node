var FluxNode = require('../../../FluxNode').FluxNode;
var fs = require('fs');
new FluxNode({
	listeners:{
		'test.tester': function(data){
			console.log(data.customVal);
		},
		'FileManager.Watch.MQ.FileAdded': function(file){
			var thisNode = this;
			fs.readFile(file.path, function(err, data){
				if(!err){
					console.log(data.toString());
					if(data.toString()!=''){
						try{
							var message = JSON.parse(data.toString());
							if(message.topic && message.message){
								thisNode.emit(message.topic, message.message);
								thisNode.FileManager_deleteFile(file.path);
							}
						}catch (e){
							console.log(e);
						}
					}	
				}else{
					console.log(err);
				}
			});
		}
	},
	mixins:[
		{
			name: 'FileManager'
		}
	]
}, function(thisNode){
	thisNode.FileManager_watch('MQ', __dirname+'/mq/');
});
