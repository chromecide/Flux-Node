var FluxNode = require('../../lib/FluxNode.js').FluxNode;
var arduinoBoardName = 'Arduino1';
var arduinoBoardPort = '/dev/cu.usbmodem411';

var arduinoBoard = new FluxNode({
	mixins:[
		{
			name:'Websockets'
		},
		{
			name: 'arduino-firmata'
		}
	]
}, function(nd){
	var ledVal = 255;
	nd.on('ArduinoFirmata.AddBoardError', function(message, rawMessage){
		console.log('Arduino Board not Ready: '+message);
	});
	
	nd.on('ArduinoFirmata.BoardReady', function(board){
		nd.emit('ArduinoFirmata.SetPinMode', {
			name: arduinoBoardName,
			pin: 13,
			mode: 'OUTPUT'
		});
	});
	
	nd.emit('ArduinoFirmata.AddBoard', {
		name: arduinoBoardName,
		port: arduinoBoardPort
	});
});
