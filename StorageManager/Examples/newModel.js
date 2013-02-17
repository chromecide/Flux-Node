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
		validators: {
			required: {},
			string: {}
		}
	},
	attributes: {
		validators: {
			object: {
				fields: {
					dateofbirth:{
						validators:{
							date:{}
						}
					},
					gender:{
						validators:{
							string:{}
						}
					}
				}
			}
		}
	}
});


var rec = new Record({
	model: newModel
});

rec.set('FirstName', 'Justin');
rec.set('Surname', 'Pradier');
rec.set('attributes', {
	dateofbirth: new Date(),
	gender: 'M'
});
console.log(rec);
console.log(newModel);

