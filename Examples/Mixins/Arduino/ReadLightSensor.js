var FluxNode = require('../../lib/FluxNode.js').FluxNode;
var arduinoBoardName = 'Arduino1';
 
var arduinoBoard = new FluxNode({
	mixins:[
		{
			name: 'arduino-firmata'
		}
	]
}, function(nd){
	var ledVal = 255;
	nd.on('ArduinoFirmata.AddBoardError', function(message, rawMessage){
		console.log('Arduino Board not Ready: '+message);
	});
	
	nd.on('ArduinoFirmata.SetPinModeError', function(message){
		console.log(message);
	});
	
	nd.on('ArduinoFirmata.SetPinModeDone', function(message){
		console.log('PIN MODE SET');
		switch(message.pin){
			case 13:
			
				break;
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
			nd.emit('ArduinoFirmata.DigitalWrite',{
				name: arduinoBoardName,
				pin: 13,
				value: 255
			});
		}else{//turn the led off
			nd.emit('ArduinoFirmata.DigitalWrite',{
				name: arduinoBoardName,
				pin: 13,
				value: 0
			});
		}
	});
	
	nd.on('ArduinoFirmata.AnalogReadError', function(message){
		console.log('ERROR');
		console.log(arguments);	
	});
	
	nd.on('ArduinoFirmata.BoardReady', function(board){
		console.log('Arduino Board Ready: '+board.name);
		
		//set the pin mode for the LED
		nd.emit('ArduinoFirmata.SetPinMode', {
			name: arduinoBoardName,
			pin: 13, 
			mode: 'OUTPUT'
		});
		
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
