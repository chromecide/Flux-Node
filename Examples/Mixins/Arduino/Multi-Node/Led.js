var FluxNode = require('../../../lib/FluxNode.js').FluxNode;
var arduinoBoardName = 'Arduino with LED';
 
var sensorBoardNodeID = '1ac63cd7-15ce-4240-85f0-9fae1ddfb319';
//Create the Flux Node
var arduinoBoard = new FluxNode({
	tunnels:[
		{
			destination: sensorBoardNodeID,
			type: 'TCP',
			options:{
				host: '10.0.0.16',
				port: 8081
			}
		}
	],
	mixins:[
		{
			name: 'arduino-firmata'
		}
	]
}, function(nd){
	var ledVal = 255;
	
	nd.on('tunnelready', function(destination, destTunnel){
		if(destination==sensorBoardNodeID){
			nd.sendEvent(destination, 'Subscribe', {eventName: ['LightSensor.On', 'LightSensor.Off']});
		}
	});
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
		port: '/dev/cu.usbserial-A7007bIv'
		//port: '/dev/cu.usbmodem411' 
	});
});
