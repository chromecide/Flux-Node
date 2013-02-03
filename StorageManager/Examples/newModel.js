var Model = require('../model.js').Model;
var Record = require('../Record.js').Record;

var newModel = new Model('person', {
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


var rec = new Record({
	model: newModel
});

rec.set('FirstName', 'Justin');
rec.set('Surname', 'Pradier');

console.log(rec);
console.log(newModel);

