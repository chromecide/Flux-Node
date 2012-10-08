var seedData = {
	Users:[
		{
			FirstName: 'Joe',
			Surname: 'Roberts',
			Position: 'CEO',
			Gender: 'M',
			'Date of Birth': new Date()
		},
		{
			FirstName: 'Jane',
			Surname: 'Smith',
			Position: 'CTO',
			Gender: 'F'
		},
		{
			FirstName: 'John',
			Surname: 'Cooper',
			Position: 'Developer',
			Gender: 'M'
		},
		{
			FirstName: 'Invalid',
			Surname: 'Record',
			Position: 'Developer',
			Gender: 'Z' //the value in this field does not make sense, we should make sure we have validations that ensure a correct input value
		}
	]
};

if (typeof define === 'function' && define.amd) {// browser
	return seedData;
} else {//node js
	module.exports = seedData;
}