var os = require('os');
var mixinFunctions = {
	init: function(cfg, callback){
		var thisNode = this;
		//add properties that are needed by this mixin
	
		//add Events that are emitted by this mixin
		if(!cfg){
			cfg = {};
		}
		
		if(!cfg.interval){
			cfg.interval = 5000;
		}
		//should be called when the mixin is actually ready, not simp;y at the end of the init function
		
		thisNode.setSetting('SystemMonitor.Callback', function(){
			thisNode.SystemMonitor_HeartBeat();
		});
		
		
		setInterval(thisNode.getSetting('SystemMonitor.Callback'), cfg.interval);
		if(callback){
			callback({
				name: 'SystemMonitor',
				config: cfg
			});
		}
		
		thisNode.emit('Mixin.Ready', {
			name: 'SystemMonitor',
			config: cfg
		});
	},
	SystemMonitor_HeartBeat: function(){
		var thisNode = this;
		
		var monitoredSettings = thisNode.getSetting('SystemMonitor.Monitor');
		if(!monitoredSettings){
			monitoredSettings = {
				Type: true,
				Platform: true,
				Release: true,
				Arch: true,
				LoadAvg: true,
				HostName: true,
				UpTime: true,
				TotalMem: true,
				FreeMem: true,
				CPUs: true
			};
		}
		for(var key in monitoredSettings){
			monitoredSettings[key] = thisNode.SystemMonitor_getValue(key);
		}
		thisNode.emit('SystemMonitor.Heartbeat', monitoredSettings);
		return true;
	},
	SystemMonitor_getValue: function(name, callback){
		var returnVal;
		
		switch(name){
			case 'Type':
				returnVal = os.type();
				break;
			case 'Platform':
				return os.platform();
				break;
			case 'Release':
				return os.release();
				break;
			case 'Arch':
				return os.arch();
				break;
			case 'LoadAvg':
				return os.loadavg();
				break;
			case 'HostName':
				returnVal = os.hostname();
				break;
			case 'UpTime':
				returnVal = os.uptime();
				break;
			case 'TotalMem':
				returnVal = os.totalmem();
				break;
			case 'FreeMem':
				returnVal = os.freemem();
				break;
			case 'CPUs':
				returnVal = os.cpus(); 
				break;
		}
		
		if(callback){
			callback(false, returnVal);
		}
		return returnVal;
	}
}

if (typeof define === 'function' && define.amd) {
	define(mixinFunctions);
} else {
	module.exports = mixinFunctions;
}
	