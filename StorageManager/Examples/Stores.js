var storeCtr = require('../Store.js').Store;
var channelCtr = require('../Channel.js').Channel;
var modelCtr = require('../Model.js').Model;

var myModel = new modelCtr('person', {
	FirstName: {
		validators: {
			required: {},
			string: {
				maxLength: 200,
				minLength: 2
			}
		}
	},
	Surname: {
		validators:{
			required: {},
			string: {}
		}
	}
});

var myChan = new channelCtr({
	name: 'default',
	model: myModel
});

var myStore = new storeCtr();

myStore.addChannel(myChan);

var newRecord = myChan.newRecord({
	FirstName: 'Justin',
	Surname: 'Pradier'
});

console.log(newRecord);

newRecord.save();
