;!function(exports, undefined) {
	var fs = require('fs');
	
	var services = {};
	
	var history = {
		
	};
	
	var pingTypes = {};
	
	var intervalStore = {};
	
	var mixinFunctions = {
		init: function(cfg, callback){
			var thisNode = this;
			//add properties that are needed by this mixin
			
			//add Events that are emitted by this mixin
			
			//add listeners
			thisNode.on('ServiceMonitor.ListServices', function(message, rawMessage){
				thisNode.ServiceMonitor_listServices(message, function(err, services){
					thisNode.doCallback('ServiceMonitor.ListServices', services, rawMessage);
				});
			});
			
			fs.readdir(__dirname+'/pings/', function(err, files){
				for(var f=0;f<files.length;f++){
					var fileName = files[f];
					var pingName = fileName.replace('.js', '');
					
					pingTypes[pingName] = require(__dirname+'/pings/'+fileName);
				}
				
				if(cfg.services){
					var serviceList = [];
					for(var i=0;i<cfg.services.length;i++){
						serviceList.push(cfg.services[i]);
					}
					
					//add the services to be monitored
					function addLoop(){
						if(serviceList.length==0){
							//should be called when the mixin is actually ready, not simp;y at the end of the init function
							var mixinReturn = {
								name: 'ServiceMonitor',
								config: cfg
							}
							
							if(callback){
								callback(mixinReturn);
							}
							
							thisNode.emit('Mixin.Ready', mixinReturn);
							return;
						}
						
						var service = serviceList.shift();
						
						thisNode.ServiceMonitor_addService(service, function(){
							addLoop();
						});
					}
					
					//call teh first iteration 
					addLoop();
				}else{
					//should be called when the mixin is actually ready, not simp;y at the end of the init function
					var mixinReturn = {
						name: 'ServiceMonitor',
						config: cfg
					}
					
					if(callback){
						callback(mixinReturn);
					}
					
					thisNode.emit('Mixin.Ready', mixinReturn);
				}
			});
		},
		ServiceMonitor_addService: function(sCfg, callback){
			var thisNode = this;
			services[sCfg.name] = sCfg;
			if(sCfg.autoStart==true){
				thisNode.ServiceMonitor_startService(sCfg.name, function(){
					if(callback){
						callback(false, sCfg);
					}
					thisNode.emit('ServiceManager.ServiceAdded', sCfg);	
				});
			}else{
				if(callback){
					callback(false, sCfg);
				}
				thisNode.emit('ServiceManager.ServiceAdded', sCfg);
			}
		},
		ServiceMonitor_startService: function(name, callback){
			var thisNode = this;
			
			services[name].enabled = true;
			var service = services[name];
			
			if(!service.interval){
				service.interval = 5000;
			}
			
			intervalStore[name] = setInterval(function(serviceName){
				thisNode.ServiceMonitor_doPing(services[serviceName]);
			}, service.interval, name);
			
			
			if(callback){
				callback(false, service);
			}
			
			thisNode.emit('ServiceManager.PollStarted', service);
		},
		ServiceMonitor_stopService: function(name, callback){
			var thisNode = this;
			
			services[name].enabled = false;
			var service = services[name];
			
			clearTimeout(intervalStore[name]);
			delete intervalStore[name];
			
			if(callback){
				callback(false, service);
			}
			
			thisNode.emit('ServiceManager.PollStopped', service);
		},
		ServiceMonitor_doPing: function(pingCfg, callback){
			var thisNode = this;
			pingTypes[pingCfg.type](pingCfg.options, function(err, status){
				thisNode.emit('ServiceMonitor.StatusReceived', status);
				var serviceName = pingCfg.name;
				
				if(!history[serviceName]){
					history[serviceName] = [];
				}
				
				history[serviceName].push(status);
				
				//housekeeping
				if(history[serviceName].length>100){
					history[serviceName].shift();
				}
				var oldStatus = services[serviceName].status; 
				services[serviceName].status = status;
				
				if(oldStatus){
					if(oldStatus.running!=status.running){
						if(status.running){
							thisNode.emit('ServiceMonitor.Service.Up', pingCfg);
						}else{
							thisNode.emit('ServiceMonitor.Service.Down', pingCfg);
						}
					}	
				}else{
					if(status.running){
						thisNode.emit('ServiceMonitor.Service.Up', pingCfg);
					}
				}
				
				
				
				if(callback){
					callback(err, status);
				}
			});
		},
		ServiceMonitor_listServices: function(message, callback){
			var thisNode = this;
			var returnObject={};
			
			for(var key in services){
				if(message.names || (message.names && inArray(message.names, key))){
					returnObject[key]=services[key];
					//calculate the average ping time
					var itemHistory = history[key];
					var totalTime=0;
					for(var i=0;i<itemHistory.length;i++){
						totalTime+=itemHistory[i].time;
					}
					var avgTime = totalTime/itemHistory.length;
					returnObject[key].status.avg = avgTime;
				}
			}
			if(callback){
				callback(false, services);
			}
		}
	}
	
	function inArray(arr, value){
		for(var i=0;i<arr.length;i++){
			if(value==arr[i]){
				return true;
			}
		}
		return false;
	}
	
	module.exports = exports = mixinFunctions;

}(typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);