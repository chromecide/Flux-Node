var FluxNode;

FluxNode = require('../../lib/FluxNode_0.0.1').FluxNode;

var DataTransformation = new FluxNode({});

var originalObject = {
	MyString: 'MyAttribute1Value',
	MyNumber: 123,
	MyDate: new Date(),
	MyObject: {
		MySubString: 'MyAttribute1Value',
		MySubNumber: 123,
		MySubDate: new Date(),
		MySubObject: {
			AttributeName: 'Sub Sub Value'
		},
		MyFunction: function(){
			console.log('SubObject Function Called');
		} 	
	},
	MyFunction: function(){
		console.log('Object Function Called');
	}
}

//get the value of an attribute
console.log('Getting Values');
console.log('--------------------------');
console.log(DataTransformation.getDataValueByString(originalObject, 'MyString'));
console.log(DataTransformation.getDataValueByString(originalObject, 'MyNumber'));
console.log(DataTransformation.getDataValueByString(originalObject, 'MyObject.MySubString'));
console.log(DataTransformation.getDataValueByString(originalObject, 'MyObject.MySubObject.AttributeName'));
console.log(' ');
//set some values
console.log('Setting Values');
console.log('--------------------------');
originalObject = DataTransformation.setDataValueByString(originalObject, 'MyString', 'Hello World');
console.log(DataTransformation.getDataValueByString(originalObject, 'MyString'));
originalObject = DataTransformation.setDataValueByString(originalObject, 'MyObject.MySubObject.AttributeName', 'Hello Again');
console.log(DataTransformation.getDataValueByString(originalObject, 'MyObject.MySubObject.AttributeName'));
console.log(' ');

console.log('Transforming - Deleteing');
console.log('--------------------------');
var objectByDelete = DataTransformation.deleteDataFields(originalObject, ['MyFunction', 'MyObject.MyFunction']);
console.log(' ');

console.log(objectByDelete);
console.log('Transforming - Copying');
console.log('--------------------------');
var anotherOriginalObject = {
	MyOwnProperty: 'Well, Hello!'
};

var objectByCopy = DataTransformation.copyDataFields(originalObject, anotherOriginalObject);
console.log(objectByCopy);
console.log(' ');

console.log('Transforming - Copying with Map');
console.log('--------------------------');
var objectByCopyWithMap = DataTransformation.copyDataFields(originalObject, {}, {
	MyFunction: false, //we don't want this one
	MyString: 'MyOwnProperty',
	MyObject: {
		MyFunction: false,//we don't want this one either,
		MySubString: 'MyNewSubString',
		MySubObject: '_.MyNewObject._original',//map to parent.MyNewObject
	}
});

console.log(objectByCopyWithMap);
console.log(' ');