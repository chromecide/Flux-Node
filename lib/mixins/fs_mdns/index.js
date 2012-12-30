var mdns = require('mdns');
var mixinFunctions = {
	init: function(cfg, callback){
		var thisNode = this;
		//add properties that are needed by this mixin
		thisNode.addSetting('MDNS.ads', {});
	
		//add Events that are emitted by this mixin
		
		if(!cfg){
			cfg = {};
		}
		
		//create an mdns browser for FluxNodes
		thisNode.MDNS_createBrowser(mdns.tcp('FluxNode'), function(FluxBrowser){
			FluxBrowser.on('serviceUp', function(service){
				thisNode.MDNS_onServiceUp(service);
			});
			
			FluxBrowser.on('serviceDown', function(service){
				thisNode.MDNS_onServiceDown(service);
			});
		});
		
		
		thisNode.on('MDNS.StartAd', function(message, rawMessage){
			var sName = message.name;
			var sType = message.type;
			var sPort = message.port;
			
			var serviceType = false;
			
			switch(sType){
				case 'http':
					serviceType = mdns.tcp('http');
					break;
				case 'FluxNode':
					serviceType = mdns.tcp('FluxNode');
					break;
			}
			
			thisNode.MDNS_createAdvert(sName, serviceType, sPort, function(err, adv){
				thisNode.emit('MDNS.Ad.Started', adv);
			});
		});

		if(cfg.ads){
			
		}else{
			if(callback){
				callback(thisNode);
			}
			
			thisNode.emit('Mixin.Ready', {
				name: 'mdns'
			});	
		}
	},
	MDNS_createBrowser: function(serviceType, callback){
		var thisNode = this;
		
		var browser = mdns.createBrowser(serviceType);
		
		browser.on('serviceUp', function(service) {
		  thisNode.MDNS_onServiceUp(service);
		});
		
		browser.on('serviceDown', function(service) {
		  thisNode.MDNS_onServiceDown(service);
		});
		
		browser.start();
		thisNode.emit('MDNS.FluxNode.Listening', {});
		if(callback){
			callback(browser);
		}
	},
	MDNS_createAdvert: function(name, serviceType, port, callback){
		var thisNode = this;
		
		var adv = mdns.createAdvertisement(serviceType, port, {
			name: name
		});
		
		adv.start();
		
		var ads = thisNode.getSetting('MDNS.ads');
		ads[name] = adv;
		thisNode.setSetting('MDNS.ads', ads);
		
		if(callback){
			callback(false, adv);
		}
	},
	MDNS_onServiceUp: function(service){
		var thisNode = this;
		thisNode.emit('MDNS.Service.Up', service);
	},
	MDNS_onServiceDown: function(service){
		var thisNode = this;
		thisNode.emit('MDNS.Service.Down', service);
	}
}

if (typeof define === 'function' && define.amd) {
	define(mixinFunctions);
} else {
	module.exports = mixinFunctions;
}
	