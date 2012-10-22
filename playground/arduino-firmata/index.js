if (typeof define === 'function' && define.amd) {
	define(mixinFunctions);
} else {
	var firmata = require('firmata');
	var serialport = require("serialport");
}

var mixinFunctions = {
	init: function(){
		var thisNode = this;
		//add properties that are needed by this mixin
		thisNode.ArduinoFirmata = {
			boards: {}
		};
		
		//load the available
		
		//add Events that are emitted by this mixin
		//  ArduinoFirmata.BoardAdded
		//  ArduinoFirmata.BoardRemoved
		//  ArduinoFirmata.SetPinMode
		//  ArduinoFirmata.SetPinModeDone
		//  ArduinoFirmata.SetPinModeError
		//  ArduinoFirmata.DigitalWrite
		//  ArduinoFirmata.DigitalWriteDone
		//  ArduinoFirmata.DigitalWriteError
		//  ArduinoFirmata.DigitalRead
		//  ArduinoFirmata.DigitalReadDone
		//  ArduinoFirmata.DigitalReadError
		//  ArduinoFirmata.AnalogRead
		//  ArduinoFirmata.AnalogReadDone
		//  ArduinoFirmata.ServoWrite
		//  ArduinoFirmata.ServoWriteDone
		//  ArduinoFirmata.ServoWriteFailed
		//  ArduinoFirmata.SendI2CConfig
		//  ArduinoFirmata.SendI2CConfigDone
		//  ArduinoFirmata.SendI2CConfigError
		//  ArduinoFirmata.SendI2CWriteRequest
		//  ArduinoFirmata.SendI2CWriteRequestDone
		//  ArduinoFirmata.SendI2CWriteRequestError
		//  ArduinoFirmata.SendI2CReadRequest
		//  ArduinoFirmata.SendI2CReadRequestDone
		//  ArduinoFirmata.SendI2CReadRequestFailed
		
		thisNode.on('ArduinoFirmata.AddBoard', function(message, rawMessage){
			thisNode.ArduinoFirmata_doAddBoard(message);
		});
		
		thisNode.on('ArtduinoFirmata.ListPorts', function(message, rawMessage){
			console.log('listing ports');
			thisNode.ArduinoFirmata_doListPorts(message, rawMessage._message.sender);	
		});
		
		thisNode.on('ArduinoFirmata.SetPinMode', function(message, rawMessage){
			thisNode.ArduinoFirmata_doSetPinMode(message.name, message.pin, message.mode);
		});
		
		thisNode.on('ArduinoFirmata.DigitalWrite', function(message, rawMessage){
			thisNode.ArduinoFirmata_doDigitalWrite(message.name, message.pin, message.value);
		});
		
		thisNode.on('ArduinoFirmata.DigitalRead', function(message, rawMessage){
			thisNode.ArduinoFirmata_doDigitalWrite(message.name, message.pin);
		});
		
		thisNode.on('ArduinoFirmata.AnalogWrite', function(message, rawMessage){
			thisNode.ArduinoFirmata_doAnalogWrite(message.name, message.pin, message.value);
		});
		
		thisNode.on('ArduinoFirmata.AnalogRead', function(message, rawMessage){
			thisNode.ArduinoFirmata_doAnalogRead(message.name, message.pin);
		});
		
		thisNode.on('ArduinoFirmata.ServoWrite', function(message, rawMessage){
			thisNode.ArduinoFirmata_doServoWrite(message.name, message.pin, message.value);
		});
		
		
		serialport.list(function(err, ports){
			if(!err){
				thisNode.ArduinoFirmata.ports = ports;
			}
		});
	},
	ArduinoFirmata_doAddBoard: function(cfg){
		var thisNode = this;
		var boardName = cfg.name;
		var boardPort = cfg.port;
		try{
			var newBoard = new firmata.Board(boardPort, function(){
				if(arguments.length==1){
					thisNode.emit('ArduinoFirmata.AddBoardError', arguments[0]);
				}else{
					thisNode.ArduinoFirmata.boards[boardName] = newBoard;
					thisNode.emit('ArduinoFirmata.BoardReady', {
						name: boardName,
						board: newBoard
					});
				}
				
			});
		}catch(e){
			thisNode.emit('ArduinoFirmata.AddBoardError', e);
		}
	},
	ArduinoFirmata_getBoard: function(boardName){
		var thisNode = this;
		
		var board = thisNode.ArduinoFirmata.boards[boardName];
		 
		return board;
	},
	ArduinoFirmata_doListPorts: function(message, sender){
		var thisNode = this;
		console.log('Listing Ports');
		console.log(thisNode.ArduinoFirmata.ports);
	},
	ArduinoFirmata_doSetPinMode: function(boardName, pin, mode){
		var thisNode = this;
		
		var board = thisNode.ArduinoFirmata_getBoard(boardName);
		
		var pinMode = board.MODES.OUTPUT;
		switch(mode){
			case 'INPUT':
				pinMode = board.MODES.INPUT;
				break;
			case 'OUTPUT':
				pinMode = board.MODES.OUTPUT;
				break;
			case 'ANALOG':
				pinMode = board.MODES.ANALOG;
				break;
			case 'PWM':
				pinMode = board.MODES.PWM;
				break;
			case 'SERVO':
				pinMode = board.MODES.SERVO;
				break;
		}
		
		try{
			board.pinMode(pin, pinMode);
			thisNode.emit('ArduinoFirmata.SetPinModeDone', {
				board: boardName,
				pin: pin,
				mode: mode
			});
		}catch(e){
			thisNode.emit('ArduinoFirmata.SetPinModeError', {
				board: boardName,
				pin: pin,
				mode: mode,
				error:e
			});
			thisNode.emit('ArduinoFirmata.Error', e);
		}
	},
	ArduinoFirmata_doDigitalWrite: function(boardName, pin, value){
		var thisNode = this;
		
		var board = thisNode.ArduinoFirmata_getBoard(boardName);
		try{
			board.digitalWrite(pin, value);
			thisNode.emit('ArduinoFirmata.DigitalWriteDone', {
				board: boardName,
				pin: pin,
				mode: value
			});
		}catch(e){
			thisNode.emit('ArduinoFirmata.DigitalWriteError', {
				board: boardName,
				pin: pin,
				error:e
			});
			thisNode.emit('ArduinoFirmata.Error', e);
		}
	},
	ArduinoFirmata_doDigitalRead: function(){
		var thisNode = this;
		
		var board = thisNode.ArduinoFirmata_getBoard();
		try{
			board.digitalRead(pin, function(value){
				thisNode.emit('ArduinoFirmata.DigitalReadDone', {
					board: boardName,
					pin: pin,
					value: value
				});
			});
		}catch(e){
			thisNode.emit('ArduinoFirmata.DigitalReadError', {
				board: boardName,
				pin: pin,
				error:e
			});
			thisNode.emit('ArduinoFirmata.Error', e);
		}
	},
	ArduinoFirmata_doAnalogWrite: function(){
		var thisNode = this;
		
		var board = thisNode.ArduinoFirmata_getBoard();
		try{
			board.digitalWrite(pin, value);
			thisNode.emit('ArduinoFirmata.AnalogWriteDone', {
				board: boardName,
				pin: pin,
				mode: value
			});
		}catch(e){
			thisNode.emit('ArduinoFirmata.AnalogWriteError', {
				board: boardName,
				pin: pin,
				error:e
			});
			thisNode.emit('ArduinoFirmata.Error', e);
		}
	},
	ArduinoFirmata_doAnalogRead: function(boardName, pin){
		var thisNode = this;
		
		var board = thisNode.ArduinoFirmata_getBoard(boardName);
		
		try{
			board.analogRead(pin, function(value){
				
				thisNode.emit('ArduinoFirmata.AnalogReadDone', {
					board: boardName,
					pin: pin,
					value: value
				});
			});
			
		}catch(e){
			thisNode.emit('ArduinoFirmata.AnalogReadError', {
				board: boardName,
				pin: pin,
				error:e
			});
			thisNode.emit('ArduinoFirmata.Error', e);
		}
	},
	ArduinoFirmata_doServoWrite: function(boardName, pin, degree){
		
		var thisNode = this;
		
		var board = thisNode.ArduinoFirmata_getBoard(boardName);
		try{
			board.servoWrite(pin, degree);
			thisNode.emit('ArduinoFirmata.ServoWriteDone', {
				board: boardName,
				pin: pin,
				degree: degree
			});
		}catch(e){
			thisNode.emit('ArduinoFirmata.ServoWriteError', {
				board: boardName,
				pin: pin,
				error:e
			});
			thisNode.emit('ArduinoFirmata.Error', e);
		}
	},
	/*
	 *	i don't really understand how the arduino I2C stuff works, so for the moment i'm not
	 *  going to support it as opposed to creating buggy functions 
	 */
	ArduinoFirmata_doSendI2CConfig: function(){
		
	},
	ArduinoFirmata_doSendI2CWriteRequest: function(){
		
	},
	ArduinoFirmata_doSendI2CReadRequest: function(){
		
	}
}

if (typeof define === 'function' && define.amd) {
	define(mixinFunctions);
} else {
	module.exports = mixinFunctions;
}
	