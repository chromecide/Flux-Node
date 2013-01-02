var mdns = require('mdns');
var mixinFunctions = {
	init: function(cfg, callback){
		var thisNode = this;
		//add properties that are needed by this mixin
		thisNode.addSetting('MDNS.ads', {});
		thisNode.addSetting('MDNS.browsers', {});
		thisNode.addSetting('MDNS.services', {});
		thisNode.addSetting('MDNS.initialSettings', false);
		
		//add Events that are emitted by this mixin
		
		if(!cfg){
			cfg = {
				ads: [],
				browsers: []
			};
		}else{
			if((typeof cfg)=='function'){
				callback = cfg;
				cfg = {
					ads: [],
					browsers: []
				}; 
			}else{
				if(!cfg.ads){
					cfg.ads = [];
				}
				if(!cfg.browsers){
					cfg.browsers = [];
				}
			}
		}
		
		if(cfg.browsers.length==[]){
			cfg.browsers.push({
				name: 'FluxNode',
				protocol: 'tcp',
				type: 'FluxNode'
			});
		}
		
		//create the ad for this FluxNode Instance
		if(thisNode.host && thisNode.port){
			thisNode.MDNS_createAdvert(thisNode.name, 'tcp', 'FluxNode', thisNode.port, function(err, FluxAdvert){
				//ad created
			});	
		}
		
		
		//create an mdns browser for FluxNodes
		thisNode.MDNS_createBrowser('FluxNode', 'tcp', 'FluxNode');
		
		
		thisNode.on('MDNS.CreateAd', function(message, rawMessage){
			var sName = message.name;
			var sProtocol = message.protocol;
			var sType = message.type;
			var sPort = message.port;
			
			thisNode.MDNS_createAdvert(sName, sProtocol, sType, sPort, function(err, adv){
				thisNode.emit('MDNS.Ad.Started', adv);
			});
		});
		
		thisNode.on('MDNS.StartAd', function(message, rawMessage){
			var sName = message.name;
			var sProtocol = message.protocol;
			var sType = message.type;
			var sPort = message.port;
			
			thisNode.MDNS_createAdvert(sName, sProtocol, sType, sPort, function(err, adv){
				thisNode.emit('MDNS.Ad.Started', adv);
			});
		});
		
		thisNode.on('MDNS.StopAd', function(message, rawMessage){
			var sName = message.name;
			
			thisNode.MDNS_stopAdvert(sName, function(err, adv){
				thisNode.emit('MDNS.Ad.Started', adv);
			});
		});

		if(cfg.ads){
			//TODO: Load ad configs
		}else{
			if(callback){
				callback(thisNode);
			}
			
			thisNode.emit('Mixin.Ready', {
				name: 'mdns'
			});	
		}
	},
	MDNS_createBrowser: function(name, serviceProtocol, serviceType, callback){
		var thisNode = this;
		
		var stFunc = false;
		switch(serviceProtocol){
			case 'udp':
				stFunc = mdns.udp;
				break;
			case 'tcp':
			default:
				stFunc = mdns.tcp;
				break;
		}
		
		var stObj = stFunc(serviceType);
		var browser = mdns.createBrowser(stObj);
		
		browser.on('serviceUp', function(service) {
		  thisNode.MDNS_onServiceUp(service);
		});
		
		browser.on('serviceDown', function(service) {
		  thisNode.MDNS_onServiceDown(service);
		});
		
		browser.start();
		
		thisNode.emit('MDNS.Listening', {
			protocol: serviceProtocol,
			type: serviceType
		});
		
		if(callback){
			callback(browser);
		}
	},
	MDNS_createAdvert: function(name, serviceProtocol, serviceType, port, options, callback){
		var thisNode = this;
		
		var err = false;
		var errs = [];
		if(!name){
			err = true;
			errs.push({
				message: 'No Name Supplied'
			});
		}else{
			if(thisNode.getSetting('MDNS.ads.'+name)){
				err = true;
				errs.push({
					message: 'Name in Use'
				});
			}
		}
		
		if(!serviceProtocol){
			serviceProtocol = 'tcp';
		}
		
		if(!serviceType){
			serviceType = 'tcp';
		}
		
		if(!err){
			var stFunc = false;
			switch(serviceProtocol){
				case 'udp':
					stFunc = mdns.udp;
					break;
				case 'tcp':
				default:
					stFunc = mdns.tcp;
					break;
			}
			
			var stObj = stFunc(serviceType);
			
			var adv = mdns.createAdvertisement(stObj, port, {
				name: name
			});
			
			var ads = thisNode.getSetting('MDNS.ads');
			ads[name] = {
				ad: adv
			};
			
			var returnObject = {
				name: name,
				protocol: serviceProtocol,
				type: serviceType,
				port: port,
				options: options
			};
			
			thisNode.setSetting('MDNS.ads.'+name, {
				object: adv,
				config: returnObject
			});
			
			thisNode.emit('MDNS.Ad.Ready', returnObject);
			
			if(callback){
				callback(false, adv);
			}
			
			if(options.autoStart!==false){
				thisNode.MDNS_startAdvert(name);
			}	
		}else{
			if(callback){
				callback(true, errs);
			}
			
			thisNode.emit('MDNS.CreateAdvert.Error', errs);
		}
	},
	MDNS_startAdvert: function(name, callback){
		var thisNode = this;
		var err = false;
		var errors = [];
		var ad;
		if(name){
			ad = thisNode.getSetting('MDNS.ads.'+name);
			if(ad){
				ad.object.start();
			}else{
				err = true;
				errors.push({
					message: 'Advert not found: '+name;
				});
			}
		}else{
			err = true;
			errors.push({
				message: 'Name not supplied'
			});
		}
		
		if(callback){
			callback(err, err?errors:ad.config);
		}
		
		if(err){
			thisNode.emit('MDNS.Ad.StartError', errors);	
		}else{
			thisNode.emit('MDNS.Ad.Started', ad.config);
		}
		return;
	},
	MDNS_stopAdvert: function(name, callback){
		var thisNode = this;
		var err = false;
		var errors = [];
		var ad;
		if(name){
			ad = thisNode.getSetting('MDNS.ads.'+name);
			if(ad){
				ad.object.stop();
			}else{
				err = true;
				errors.push({
					message: 'Advert not found: '+name;
				});
			}
		}else{
			err = true;
			errors.push({
				message: 'Name not supplied'
			});
		}
		
		if(callback){
			callback(err, err?errors:ad.config);
		}
		
		if(err){
			thisNode.emit('MDNS.Ad.StartError', errors);	
		}else{
			thisNode.emit('MDNS.Ad.Started', ad.config);
		}
		return;
	},
	MDNS_removeAdvert: function(name, callback){
		var thisNode = this;
		var err = false;
		var errors = [];
		var ad;
		if(name){
			ad = thisNode.getSetting('MDNS.ads.'+name);
			if(ad){
				ad.object.stop();
				thisNode.removeSetting('MDNS.ads.'+name);
			}else{
				err = true;
				errors.push({
					message: 'Advert not found: '+name;
				});
			}
		}else{
			err = true;
			errors.push({
				message: 'Name not supplied'
			});
		}
		
		if(callback){
			callback(err, err?errors:ad.config);
		}
		
		if(err){
			thisNode.emit('MDNS.Ad.RmoveError', errors);	
		}else{
			thisNode.emit('MDNS.Ad.Removed', ad.config);
		}
		return;
	},
	MDNS_onServiceUp: function(service){
		var thisNode = this;
		thisNode.setSetting('MDNS.services.'+service.name, service);
		thisNode.emit('MDNS.Service.Up', service);
	},
	MDNS_onServiceDown: function(service){
		var thisNode = this;
		var oService = thisNode.getSetting('MDNS.services.'+service.name);
		thisNode.removeSettingValue('MDNS.services.'+service.name);
		thisNode.emit('MDNS.Service.Down', oService);
	}
}

if (typeof define === 'function' && define.amd) {
	define(mixinFunctions);
	define({
		init: function(){
			self.emit('Mixin.Error', {
				message: 'MDNS cannot be loaded in the browser environment'
			})
		}
	})
} else {
	module.exports = mixinFunctions;
}
	