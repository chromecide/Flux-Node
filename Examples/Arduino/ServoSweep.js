var FluxNode = require('../../lib/FluxNode.js').FluxNode;
var arduinoBoardName = 'Arduino1';
 
var arduinoBoard = new FluxNode({
	mixins:[
		{
			name: 'arduino-firmata'
		}
	]
}, function(nd){
	var servoPos = 0;
	var increment = 10;
	nd.on('ArduinoFirmata.AddBoardError', function(message, rawMessage){
		console.log('Arduino Board not Ready: '+message);
	});
	
	nd.on('ArduinoFirmata.SetPinModeError', function(message){
		console.log(message);
	});
	
	nd.on('ArduinoFirmata.SetPinModeDone', function(message){
		switch(message.pin){
			case 11:
				nd.emit('ArduinoFirmata.ServoWrite', {
					name: arduinoBoardName,
					pin: 11,
					value: servoPos
				});
				
				setInterval(function(){
					servoPos+=increment;
					if(servoPos>=180 || servoPos<=0){
						increment*=-1;
					}
					
					nd.emit('ArduinoFirmata.ServoWrite', {
						name: arduinoBoardName,
						pin: 11,
						value: servoPos
					});
				}, 1000);
				break;
			default:
				
				//we're not doing anything with the other pins
				break;
		}
	});
	
	nd.on('ArduinoFirmata.ServoWriteError', function(){
		console.log(arguments);
	});
	
	nd.on('ArduinoFirmata.BoardReady', function(board){
		console.log('Arduino Board Ready: '+board.name);
		
		//set the pin mode for the LED
		nd.emit('ArduinoFirmata.SetPinMode', {
			name: arduinoBoardName,
			pin: 11, 
			mode: 'SERVO'
		});
		
	});
	
	// add the arduino board 
	nd.emit('ArduinoFirmata.AddBoard', {
		name: arduinoBoardName,
		port: '/dev/cu.usbmodem411' 
	});
});
