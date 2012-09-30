var FluxNode = require('../../lib/FluxNode.js').FluxNode;
var arduinoBoardName = 'Arduino1';
 
 
//Create the Flux Node
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
	
	nd.on('ArduinoFirmata.SetPinModeDone', function(message){
		
		switch(message.pin){
			case 13:
				if(message.mode=='OUTPUT'){//just checkin....
					//set the initial state of the LED
					nd.emit('ArduinoFirmata.DigitalWrite', {
						name: arduinoBoardName,
						pin: 13,
						value: ledVal//fully on
					});
					
					console.log('Starting Blink');
					
					//create the timer to blink the LED
					setInterval(function(){
						ledVal = ledVal==255?0:255;
						nd.emit('ArduinoFirmata.DigitalWrite', {
							name: arduinoBoardName,
							pin: 13,
							value: ledVal
						});
					}, 1000);
				}
				break;
			default:
				//we're not doing anything with the other pins
				break;
		}
	});
	
	nd.on('ArduinoFirmata.DigitalWriteError', function(message){
		console.log(arguments);	
	});
	
	nd.on('ArduinoFirmata.BoardReady', function(board){
		console.log('Arduino Board Ready: '+board.name);
		var ledOn = false;
		nd.emit('ArduinoFirmata.SetPinMode', {
			name: arduinoBoardName,
			pin: 13,
			mode: 'OUTPUT'
		});
	});
	
	nd.emit('ArduinoFirmata.AddBoard', {
		name: arduinoBoardName,
		port: '/dev/cu.usbmodem411' 
	});
});
