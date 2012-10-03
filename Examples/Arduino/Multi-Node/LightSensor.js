var FluxNode = require('../../../lib/FluxNode.js').FluxNode;
var arduinoBoardName = 'Arduino With Light Sensor';
 
var arduinoBoard = new FluxNode({
	id: '1ac63cd7-15ce-4240-85f0-9fae1ddfb319',
	mixins:[
		{
			name: 'arduino-firmata'
		},
		{
			name: 'TCPServer',
			options:{
				host: '10.0.0.16',
				port: 8081
			}
		}
	]
}, function(nd){
	console.log(nd.id);
	var ledVal = 255;
	nd.on('ArduinoFirmata.AddBoardError', function(message, rawMessage){
		console.log('Arduino Board not Ready: '+message);
	});
	
	nd.on('ArduinoFirmata.SetPinModeError', function(message){
		console.log(message);
		process.exit();
	});
	
	nd.on('ArduinoFirmata.SetPinModeDone', function(message){
		console.log('PIN MODE SET');
		switch(message.pin){
			case 14:
				nd.emit('ArduinoFirmata.AnalogRead', {
					name: arduinoBoardName,
					pin: 0
				});
				break;
			default:
				
				//we're not doing anything with the other pins
				break;
		}
	});
	
	nd.on('ArduinoFirmata.AnalogReadDone', function(message){
		if(message.value>500){// turn the led on
			nd.emit('LightSensor.On', {});
		}else{//turn the led off
			nd.emit('LightSensor.Off', {});
		}
	});
	
	nd.on('ArduinoFirmata.AnalogReadError', function(message){
		console.log('ERROR');
		console.log(arguments);	
	});
	
	nd.on('ArduinoFirmata.BoardReady', function(board){
		console.log('Arduino Board Ready: '+board.name);
		
		//set the pin mode for the light sensor
		nd.emit('ArduinoFirmata.SetPinMode', {
			name: arduinoBoardName,
			pin: 14, //Analog pins are mapped 14-19
			mode: 'ANALOG'
		});
	});
	
	// add the arduino board 
	nd.emit('ArduinoFirmata.AddBoard', {
		name: arduinoBoardName,
		port: '/dev/cu.usbmodem411'
	});
});
