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
		
		thisNode.on('MDNS.Ad.Create', function(message, rawMessage){
			var sName = message.name?message.name:thisNode.name;
			var sProtocol = message.protocol;
			var sType = message.type;
			var sPort = message.port;
			
			thisNode.MDNS_createAdvert(sName, sProtocol, sType, sPort);
		});
		
		thisNode.on('MDNS.Ad.Start', function(message, rawMessage){
			var sName = message.name;
			
			thisNode.MDNS_startAdvert(sName);
		});
		
		thisNode.on('MDNS.Ad.Stop', function(message, rawMessage){
			var sName = message.name;
			
			thisNode.MDNS_stopAdvert(sName);
		});
		
		thisNode.on('MDNS.Ads.List', function(message, rawMessage){
			var sName = message.name;
			
			thisNode.MDNS_listAdverts(sName);
		});
		
		thisNode.on('MDNS.Ads.Clear', function(message, rawMessage){
			var sName = message.name;
			
			thisNode.MDNS_clearAdverts(sName);
		});
		
		thisNode.on('MDNS.Ad.Remove', function(message, rawMessage){
			var sName = message.name;
			
			thisNode.MDNS_removeAdvert(sName);
		});

		thisNode.on('MDNS.Browser.Create', function(message, rawMessage){
			var sName = message.name;
			var sProtocol = message.protocol;
			var sType = message.type;
			var options = message.options;
			thisNode.MDNS_createBrowser(sName, sProtocol, sType, options);
		});
		
		thisNode.on('MDNS.Browser.Start', function(message, rawMessage){
			var sName = message.name;
			
			thisNode.MDNS_startBrowser(sName);
		});
		
		thisNode.on('MDNS.Browser.Stop', function(message, rawMessage){
			var sName = message.name;
			
			thisNode.MDNS_stopBrowser(sName);
		});
		
		
		thisNode.on('MDNS.Browser.Remove', function(message, rawMessage){
			var sName = message.name;
			
			thisNode.MDNS_removeBrowser(sName);
		});
		
		thisNode.on('MDNS.Browsers.List', function(message, rawMessage){
			thisNode.MDNS_listBrowsers();
		});
		
		thisNode.on('MDNS.Browsers.Clear', function(message, rawMessage){
			thisNode.MDNS_clearBrowsers();
		});

		if(callback){
			callback(thisNode);
		}
		
		thisNode.emit('Mixin.Ready', {
			name: 'mdns',
			config: cfg
		});

		//loading the ads and browsers has been done after the Mixin.Ready event because technically the mixin IS ready, the ads and browser are not
		if(cfg.ads){
			for(var i=0; i< cfg.ads.length;i++){
				var ad = cfg.ads[i];
				thisNode.emit('MDNS.Ad.Create', ad);
			}
		}
		
		if(cfg.browsers){
			for(var i=0; i< cfg.browsers.length;i++){
				var browser = cfg.browsers[i];
				thisNode.emit('MDNS.Browser.Create', browser);
			}
		}
	},
	MDNS_createBrowser: function(name, serviceProtocol, serviceType, options, callback){
		var thisNode = this;
		
		var err = false;
		var errors = [];
		
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
			serviceType = 'FluxNode';
		}
		
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
		
		if(!err){
			var stObj = stFunc(serviceType);
			var browser = mdns.createBrowser(stObj);
			
			browser.on('serviceUp', function(service) {
			  thisNode.MDNS_onServiceUp(service);
			});
			
			browser.on('serviceDown', function(service) {
			  thisNode.MDNS_onServiceDown(service);
			});
			
			var returnObject = {
				name: name,
				protocol: serviceProtocol,
				type: serviceType,
				options: options
			};
			
			thisNode.setSetting('MDNS.browsers.'+name, {
				object: browser,
				config: returnObject
			});
			
			thisNode.emit('MDNS.Browser.Ready', returnObject);
			
			if(callback){
				callback(browser);
			}
			
			if(!options || options.autoStart!==false){
				thisNode.MDNS_startBrowser(name);
			}	
		}else{
			if(callback){
				callback(true, errs);
			}
			
			thisNode.emit('MDNS.CreateBrowser.Error', errs);
		}
	},
	MDNS_startBrowser: function(name, callback){
		var thisNode = this;
		var err = false;
		var errors = [];
		var browser;
		if(name){
			browser = thisNode.getSetting('MDNS.browsers.'+name);
			if(browser){
				browser.object.start();
			}else{
				err = true;
				errors.push({
					message: 'Browser not found: '+name
				});
			}
		}else{
			err = true;
			errors.push({
				message: 'Name not supplied'
			});
		}
		
		if(callback){
			callback(err, err?errors:browser.config);
		}
		
		if(err){
			thisNode.emit('MDNS.Browser.StartError', errors);	
		}else{
			thisNode.emit('MDNS.Browser.Started', browser.config);
		}
		return;
	},
	MDNS_stopBrowser: function(name, callback){
		var thisNode = this;
		var err = false;
		var errors = [];
		var browser;
		if(name){
			browser = thisNode.getSetting('MDNS.browsers.'+name);
			if(browser){
				browser.object.stop();
			}else{
				err = true;
				errors.push({
					message: 'Browser not found: '+name
				});
			}
		}else{
			err = true;
			errors.push({
				message: 'Name not supplied'
			});
		}
		
		if(callback){
			callback(err, err?errors:browser.config);
		}
		
		if(err){
			thisNode.emit('MDNS.Browser.StopError', errors);	
		}else{
			thisNode.emit('MDNS.Browser.Stopped', browser.config);
		}
		return;
	},
	MDNS_removeBrowser: function(name, callback){
		var thisNode = this;
		var err = false;
		var errors = [];
		var browser;
		if(name){
			browser = thisNode.getSetting('MDNS.browsers.'+name);
			if(browser){
				browser.object.stop();
				thisNode.removeSetting('MDNS.browsers.'+name);
			}else{
				err = true;
				errors.push({
					message: 'Browser not found: '+name
				});
			}
		}else{
			err = true;
			errors.push({
				message: 'Name not supplied'
			});
		}
		
		if(callback){
			callback(err, err?errors:browser.config);
		}
		
		if(err){
			thisNode.emit('MDNS.Browser.RemoveError', errors);	
		}else{
			thisNode.emit('MDNS.Browser.Removed', browser.config);
		}
		return;
	},
	MDNS_listBrowsers: function(query, callback){
		var thisNode = this;
		var returnRecords = [];
		
		var browsers = thisNode.getSetting('MDNS.browsers');
		
		for(var browserName in browsers){
			var browserCfg = browsers[browserName].config;
			returnRecords.push(browserCfg);
		}
		
		if(callback){
			callback(false, returnRecords);
		}
		
		thisNode.emit('MDNS.Browsers.Listed', returnRecords);
	},
	MDNS_clearBrowsers: function(callback){
		var thisNode = this;
		var returnRecords = [];
		var removeBrowsers = 0;
		var browsers = thisNode.getSetting('MDNS.browsers');
		
		for(var browserName in browsers){
			thisNode.emit('MDNS.Browser.Remove', {
				name: browserName
			});
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
		
		if(!port){
			err = true;
			errs.push({
				message: 'No Port Supplied'
			});
		}
		
		if(!serviceProtocol){
			serviceProtocol = 'tcp';
		}
		
		if(!serviceType){
			serviceType = 'FluxNode';
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
			
			if(options && options.autoStart!==false){
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
					message: 'Advert not found: '+name
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
					message: 'Advert not found: '+name
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
			thisNode.emit('MDNS.Ad.StopError', errors);	
		}else{
			thisNode.emit('MDNS.Ad.Stopped', ad.config);
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
					message: 'Advert not found: '+name
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
			thisNode.emit('MDNS.Ad.RemoveError', errors);	
		}else{
			thisNode.emit('MDNS.Ad.Removed', ad.config);
		}
		return;
	},
	MDNS_listAdverts: function(query, callback){
		var thisNode = this;
		var returnRecords = [];
		
		var ads = thisNode.getSetting('MDNS.ads');
		
		for(var adName in ads){
			var adCfg = ads[adName].config;
			returnRecords.push(adCfg);
		}
		
		if(callback){
			callback(false, returnRecords);
		}
		
		thisNode.emit('MDNS.Ad.Listed', returnRecords);
	},
	
	MDNS_clearAdverts: function(callback){
		var thisNode = this;
		var returnRecords = [];
		var removeAds = 0;
		var ads = thisNode.getSetting('MDNS.ads');
		
		for(var adName in ads){
			thisNode.emit('MDNS.Ad.Remove', {
				name: adName
			});
		}
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
	