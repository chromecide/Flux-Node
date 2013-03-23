//FluxNode is an Instance of EventEmitter2 that has been extended with additional functionality
exports = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);

var paths = {
	'util': './lib/util',
	'Flux-Node': './',
	'FluxNode': './',
	'TunnelManager': './TunnelManager',
	'Tunnel': 'TunnelManager/Tunnel',
	'Tunnels': './TunnelManager/Tunnels',
	'StorageManager': './StorageManager',
	'Store': 'StorageManager/Store',
	'Stores': 'StorageManager/Stores',
	'EventEmitter2': './lib/flux_eventemitter2',
	'mixins': './lib/mixins',
	'FluxNode/mixins': './lib/mixins',
};

if (typeof define === 'function' && define.amd) {
	require.config({
		paths:paths
	});
	
	define(['util', 'EventEmitter2', 'TunnelManager/TunnelManager', 'StorageManager/StorageManager'], function(util, EventEmitter2, TunnelManager, StorageManager) {
		var fnConstruct = FluxNodeObj(util, EventEmitter2, TunnelManager, StorageManager);
		return fnConstruct;
	});		
} else {
	var util = require('util'),
		EventEmitter2 = require('eventemitter2').EventEmitter2,
		TunnelManager = require('./TunnelManager/TunnelManager.js').TunnelManager,
		StorageManager = require('./StorageManager/StorageManager.js').StorageManager;
	var fnConstruct = FluxNodeObj(util, EventEmitter2, TunnelManager, StorageManager);
	exports.FluxNode = fnConstruct;
}

//this wrapper allows us to deal with the difference in loading times between NodeJS and asyync browser loading
function FluxNodeObj(util, evObj, TunnelManager, StorageManager){
	
	//This is the actual Flux Node Constructor
	function FluxNodeConstructor(cfg, cb){
		
		var self = this;
		
		self.NodeSubscribers = {};
		self._Settings = {};
		self._SettingsMeta = {};
		self._mixins = {};
		
		self._middleware = {};
		
		self._eventInfo = {};
		self._listenerInfo = {};
		
		if(!cfg){
			cfg = {};
		}
		
		if(cfg.debug){
			self.debug = cfg.debug;
			self.setSetting('FluxNode.Debug', true);
		}
		
		var evCfg = {
			wildcard: true, // should the event emitter use wildcards.
      		delimiter: '.'
		};
		
		evObj.call(self, evCfg);
		
		self._environment = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? 'nodejs' : 'browser');
		
		if(cfg.id){
			self.id = cfg.id;		
		}
		
		if(!self.id){
			if(self.debug) console.log('Generating ID....');
			var thisId = self.generateID(); 
			if(self.debug) console.log('setting id: '+thisId);
			self.id = thisId;
		}
		
		
		if(cfg.name){
			self.name = cfg.name;
		}
		
		if(cfg.host){
			self.host = cfg.host;
		}
		
		if(cfg.port){
			self.port = cfg.port;
		}
		
		if(self.debug) console.log('Starting FluxNode: '+self.id);
		
		self.Subscribers = {};
		
		self.on('FluxNode.Subscribe', function(message, data){
			if(self.debug) console.log(data);
			if(!data.message.events && data.message.eventName) data.message.events=data.message.eventName; //supporting legacy code
			self.doSubscribe(data._message.sender, data.message.events);
		});
		
		self.addListenerInfo('FluxNode', 'FluxNode.Subscribe', 'Subscribes to Events on the Target FluxNode', {
			name: 'Events',
			validators:{
				hasMany: {
					validators: {
						string:{}
					}
				}
			}
		});
		
		self.on('FluxNode.Unsubscribe', function(data){
			if(!data.message.events && data.message.eventName) data.message.events=data.message.eventName; //supporting legacy code
			self.doUnsubscribe(data._message.sender, data.message.events);
		});
		
		
		self.addListenerInfo('FluxNode', 'FluxNode.Unsubscribe', 'Unsubscribes from Events on the Target FluxNode', {
			name: 'Events',
			validators:{
				hasMany: {
					validators: {
						string:{}
					}
				}
			}
		});
		//process any non-builtin config items as if they were inteneded to be part of the FluxNode
		
		for(key in cfg){
			switch(key){
				//built ins
				case 'debug':
				case 'listeners':
				case 'mixins':
				case 'stores':
				case 'tunnels':
				case 'settings':
					break;
				default:
					
					self[key] = cfg[key];
					break;
			}
		}
		
		if(cfg.settings){
			for(var settingKey in cfg.settings){
				self.setSetting(settingKey, cfg.settings[settingKey]);
			}
		}
		
		if(cfg.listeners){
			if(self.debug) console.log('Configuring Listeners');
			for(var topic in cfg.listeners){
				self.on(topic, cfg.listeners[topic]);
			}
		}
		
		
		self.on('FluxNode.getMixinInfo', this.getMixinInfo);
		self.addListenerInfo('FluxNode', 'FluxNode.getMixinInfo', 'Retrieves the Mixin information for the Target FluxNode', {
			name: 'Mixin Names',
			validators:{
				hasMany: {
					validators: {
						string:{}
					}
				}
			}
		});
		
		self.on('FluxNode.getStoreInfo', this.getStoreInfo);
		self.addListenerInfo('FluxNode', 'FluxNode.getStoreInfo', 'Retrieves the Store information for the Target FluxNode', {
			name: 'Store Names',
			validators:{
				hasMany: {
					validators: {
						string:{}
					}
				}
			}
		});
		
		self.on('FluxNode.getEventInfo', function(message, rawMessage){
			self.getEventInfo(message.names, function(err, eventList){
				if(rawMessage && rawMessage._message.sender){
					self.sendEvent(rawMessage._message.sender, 'FluxNode.getEventInfo.Response', eventList, rawMessage._message.id);
				}
			})
		});
		self.addListenerInfo('FluxNode', 'FluxNode.getEventInfo', 'Retrieves the Event Information for the Target FluxNode', {
			name: 'Event Names',
			validators:{
				hasMany: {
					validators: {
						string:{}
					}
				}
			}
		});
		
		self.on('FluxNode.getListenerInfo', function(message, rawMessage){
			self.getListenerInfo(message.mixinName, message.eventName, function(err, listenerList){
				if(rawMessage && rawMessage._message.sender){
					self.sendEvent(rawMessage._message.sender, 'FluxNode.getListenerInfo.Response', listenerList, rawMessage._message.id);
				}
			})
		});
		self.addListenerInfo('FluxNode', 'FluxNode.getListenerInfo', 'Retrieves the Listener Information for the Target FluxNode', {
			name: 'Listener Names',
			validators:{
				hasMany: {
					validators: {
						string:{}
					}
				}
			}
		});
		
		self.on('FluxNode.getSettings', function(message, rawMessage){
			
			self.getSettings(function(err, settingList){
				
				self.sendEvent(rawMessage._message.sender, 'FluxNode.getSettings.Response', settingList, rawMessage._message.id);
			});
		});
		self.addListenerInfo('FluxNode', 'FluxNode.getSettings', 'Retrieves the Current Setting Values for the target FluxNode', {
			name: 'Setting Names',
			validators:{
				hasMany: {
					validators: {
						string:{}
					}
				}
			}
		});
		
		self.on('FluxNode.getInstalledMixins', function(message, rawMessage){
			self.getInstalledMixins(function(err, mixinList){
				
				if(rawMessage && rawMessage._message.sender){
					self.sendEvent(rawMessage._message.sender, 'FluxNode.getInstalledMixins.Response', mixinList, rawMessage._message.id);
				}
			});
		});
		self.addListenerInfo('FluxNode', 'FluxNode.getInstalledMixins', 'Retrieves a List of Mixins that are available to be mixed into the target FluxNode.', {
			name: 'Mixin Names',
			validators:{
				hasMany: {
					validators: {
						string:{}
					}
				}
			}
		});
		
		self.on('FluxNode.getSettingInfo', function(message, rawMessage){
			var settingName = message.names;
			self.getSettingInfo(settingName, function(err, settingInfo, settingValues){
				if(rawMessage && rawMessage._message.sender){
					self.sendEvent(rawMessage._message.sender, 'FluxNode.getSettingInfo.Response', {
						settings: settingInfo,
						values: settingValues
					}, rawMessage._message.id);
				}
			});
		});
		self.addListenerInfo('FluxNode', 'FluxNode.getSettingInfo', 'Retrieves the Setting Information for the Target Nodes', {
			name: 'Event Names',
			validators:{
				hasMany: {
					validators: {
						string:{}
					}
				}
			}
		});
		
		/*
		 * Start COnfiguration of support services
		 */
		
		if(self.debug) console.log('Configuring StorageManager');
		
		var storageManager = new StorageManager({
			debug: self.debug
		});
		
		storageManager.on('error', function(){
			self.emit.apply('error', arguments);
		});
		
		if(cfg && cfg.stores){
			var smCallback = false;
			//if the last item in the supplied list of stores is a function, pop it off the list and use it as a callback
			if((typeof cfg.stores[cfg.stores.length-1])=='function'){
				smCallback = cfg.stores.pop();
			}
		}else{
			cfg.stores = [{
				type: 'Memory',
				options:{
					channels:[
						'master'
					]
				},
				defaultChannel: 'master',
				isDefault: true
			}];
		}
		
		storageManager.on('StorageManager.Error', function(){
			console.log('STORAGE MANAGER ERROR');
			console.log(arguments);
		});
		
		storageManager.once('StorageManager.Ready', function(err, SM){
			//add the event info for the Storage Manager
			self.addEventInfo('FluxNode', 'Store.Ready', 'Emitted when a new Store is Ready', {
				store: {
					name: 'Store',
					description: 'The Store that was just added'
				}
			});
			
			if(self.debug) console.log('StorageManager Ready');
			self.StorageManager = SM;
			self.StorageManager.on('StorageManager.StoreReady', function(err, store){
				self.emit('Store.Ready', err, store);
			});
			
			if(self.debug) console.log('Configuring Tunnel Manager');
			self.TunnelManager = new TunnelManager({
				debug: self.debug,
				senderId: self.id,
				senderName: self.name
			});
			
			self.sendEvent = function(destinationId, topic, message, inReplyTo, callback){
				if((typeof inReplyTo)=='function'){
					callback = inReplyTo;
					inReplyTo = false;
				}

				if(!destinationId || destinationId==self.id){
					self.emit(topic, message);
				}else{
					var mId = self.TunnelManager.send(destinationId, topic, message, inReplyTo);
					if(callback){
						var callbackListenerCreator = function(messageId, cb){
							return function (message){
								
								if(message._message.inReplyTo==messageId){
									cb.call(self, message.message, message._message);
								}else{
									//re-add the listener
									self.TunnelManager.once('message', callbackListenerCreator(mId, callback));
								}
							}	
						}
						self.TunnelManager.once('message', callbackListenerCreator(mId, callback));
					}
				}
			}
			
			self.TunnelManager.once('TunnelManager.Ready', function(){
				self.addEventInfo('FluxNode', 'Tunnel.Ready', 'Emitted when a new Tunnel is Ready', {
					destinationId: {
						name: 'destinationId',
						description: 'The ID of the remote FluxNode',
						validators:{
							string:{}
						}
					},
					tunnel: {
						name: 'tunnel',
						description: 'The Tunnel Object that is ready'
					}
				});
				
				self.addEventInfo('FluxNode', 'Tunnel.Closed', 'Emitted when a Tunnel has Closed', {
					destinationId: {
						name: 'destinationId',
						description: 'The ID of the remote FluxNode',
						validators:{
							string:{}
						}
					}
				});
				
				self.addEventInfo('FluxNode', 'Mixin.Ready', 'Emitted when a Mixin has been added and configured Ready', {
					name: {
						name: 'name',
						description: 'The name of the Mixin that is ready',
						validators:{
							string:{}
						}
					},
					config: {
						name: 'config',
						description: 'The configuration options that were supplied for this mixin'
					}
				});
				
				self.addEventInfo('FluxNode', 'FluxNode.Ready', 'Emitted when a FluxNode has initialised and is Ready', {});
				
				self.addEventInfo('FluxNode', 'FluxNode.Error', 'Emitted when a FluxNode Experiences an Error', {
					name: {
						name: 'name',
						description: 'The name of the Mixin that is ready',
						validators:{
							string:{}
						}
					},
					config: {
						name: 'config',
						description: 'The configuration options that were supplied for this mixin'
					}
				});
				
				self.TunnelManager.on('message', function(message){
					//first check the middle ware
					self.processMiddleware('FluxNode', 'TunnelManager.Message', [message._message.sender, message.topic, message.message], function(success){
						if(success){
							self.emit(message.topic, message.message, message);		
						}
					});
				});
				
				self.TunnelManager.on('Tunnel.Ready', function(destination, tunnel){
					self.emit('Tunnel.Ready', destination, tunnel);
				});
				
				self.TunnelManager.on('Tunnel.Closed', function(remoteId){
					self.doUnsubscribe(remoteId);
					
					self.emit('Tunnel.Closed', remoteId);
				});
				
				if(cfg.mixins){
					if(self.debug) console.log('Configuring Mixins');
					var mixin = false;
					var mixinLoop = function(){
						
						if(cfg.mixins.length>0){
							mixin = cfg.mixins.shift();
						}else{
							mixin = false;
						}
						if(mixin){
							
							if(typeof mixin=='function'){
								mixin(self);
							}else{
								if(typeof mixin == 'object'){
									var mixinName = mixin.name;
									var options = mixin.options;
									self.mixin(mixinName, options, function(){
										mixinLoop();
									});
								}else{
									self.mixin(mixin, {}, function(){
										mixinLoop();
									});	
								}
							}	
						}else{
							self.on('FluxNode.Mixin', function(message, rawMessage){
								
								self.mixin(message.name, message.options, function(err, mixinCfg){
									if(rawMessage && rawMessage._message.sender){
										self.sendEvent(rawMessage._message.sender, 'FluxNode.Mixin.Response', mixinCfg, rawMessage._message.id);
									}
								});
							});
							self.addListenerInfo('FluxNode', 'FluxNode.Mixin', 'Mixes in the functionality for the Selected Mixin', {
								validators: {
									object: {
										fields: {
											name: {
												name: 'Mixin Name',
												description: 'The name of the Mixin to Mix',
												validators: {
													string:{}
												}
											},
											options: {
												name: 'Options',
												description: 'Options for the selected mixin',
												validators: {
													object:{}
												}
											}
										}
									}
								}
							});
							
							
							self.emit('FluxNode.Ready', self);
							if(cb){
								cb(self, cfg);
							}
							
						}
					}
					mixinLoop();
				}else{
					self.emit('FluxNode.Ready', self);
					if(cb){
						cb(self, cfg);
					}
				}
			});
			
			self.TunnelManager.configureManager({
				debug:true,
				allowRelay: true,
				sender: self.id,
				tunnels: cfg && cfg.tunnels?cfg.tunnels:[]
			});
			
		});
		
		if(cfg.paths){
			//console.log(cfg.paths);
			for(var key in cfg.paths){
				paths[key] = cfg.paths[key];
			}
			//console.log(paths);
			require.config({
				paths: paths
			});
		}
		
		if(self.debug) console.log('Starting Configuration');
		
		storageManager.configure({
			debug: self.debug,
			stores: cfg.stores
		});
		
		return self;
	}
	
		util.inherits(FluxNodeConstructor, evObj);
		
		FluxNodeConstructor.prototype.addPath = function(name, path){
			paths[name] = path;
			require.config({paths: paths});
		}
		
		FluxNodeConstructor.prototype.addSetting = function(name, initialValue, validation, callback){
			var self = this;
			self.setDataValueByString(self._Settings, name, initialValue);
			self.setDataValueByString(self._SettingsMeta, name, validation);
			
			if(callback){
				callback(name);
			}
		}
		
		FluxNodeConstructor.prototype.getSettingInfo = function(name, callback){
			var self = this;
			
			if(callback){
				callback(false, self._SettingsMeta, self._Settings);
			}
			return self._SettingsMeta;
		}
		
		FluxNodeConstructor.prototype.setSetting = function(name, newValue, callback){
			var self = this;
			var settingMeta = self.getDataValueByString(self._SettingsMeta, name);
			if(settingMeta){
				switch(typeof settingMeta){
					case 'function':
						var func = settingMeta;
						if(func(newValue)===true){
							self.setDataValueByString(self._Settings, name, newValue);
							if(callback){
								callback(true, name, newValue, oldValue);
							}
							return true;
						}else{
							self.emit('FluxNode.Error', {
								message: 'Invalid Value Supplied for '+name
							});
						}
						break;
					default:
					console.log('SETTING: '+name, newValue);
						if(callback){
							callback(false);
						}
						return false;
						break;
				}	
			}else{
				self.setDataValueByString(self._Settings, name, newValue);
				if(callback){
					callback(true);
				}
				return true;
			}
		}
		
		FluxNodeConstructor.prototype.getSettings = function(callback){
			var self = this;
			
			var settingVal = self._Settings;
			
			if(callback){
				callback(false, settingVal);
			}
			
			return settingVal;
		}
		
		FluxNodeConstructor.prototype.getSetting = function(name, callback){
			var self = this;
			var settingVal = self.getDataValueByString(self._Settings, name);
			
			if(callback){
				callback(false, settingVal);
			}
			
			return settingVal;
		}
		
		FluxNodeConstructor.prototype.removeSettingValue = function(name, callback){
			var self = this;
			var settingVal = self.removeDataValueByString(self._Settings, name);
			
			if(callback){
				callback(false, settingVal);
			}
			
			return settingVal;
		}
		
		FluxNodeConstructor.prototype.removeSetting = function(name, callback){
			var self = this;
			var settingVal = self.removeDataValueByString(self._Settings, name);
			var settingMeta = self.removeDataValueByString(self._SettingsMeta, name);
			
			if(callback){
				callback(false, settingVal && settingMeta);
			}
			
			return settingVal && settingMeta;
		}
		
		/**
		 * Event Information
		 */
		FluxNodeConstructor.prototype.addEventInfo = function(mixinName, eventName, eventDescription, eventParams, callback){
			if(!this._eventInfo[mixinName]){
				this._eventInfo[mixinName]={};
			}
			
			if(!this._eventInfo[mixinName][eventName]){
				this._eventInfo[mixinName][eventName] = {
					mixin:mixinName,
					name: eventName,
					description: eventDescription,
					params: eventParams
				}
			}
			
			if(callback){
				callback(this._eventInfo[mixinName][eventName]);
			}
			
			return this._eventInfo[mixinName][eventName];
		}
		
		FluxNodeConstructor.prototype.removeEventInfo = function(mixinName, eventName, callback){
			delete this._eventInfo[mixinName][eventName];
			if(callback){
				callback();	
			}
		}
		
		FluxNodeConstructor.prototype.getEventInfo = function(mixinName, eventName, callback){
			var returnInfo = {};
			
			if((typeof mixinName) =='function'){
				callback = mixinName;
				eventName = false;
				mixinName = false;
			}
			
			if((typeof eventName)=='function'){
				callback = eventName;
				eventName = false;
			}
			
			if(!mixinName){
				returnInfo = this._eventInfo;
			}else{
				if(!eventName){
					returnInfo = this._eventInfo[mixinName];
				}else{
					returnInfo = this._eventInfo[mixinName][eventName];
				}	
			}
			
			if(callback){
				callback(false, returnInfo);
			}
		}
		
		FluxNodeConstructor.prototype.addListenerInfo = function(mixinName, listenerName, listenerDescription, listenerParams, callback){
			if(!this._listenerInfo[mixinName]){
				this._listenerInfo[mixinName]={};
			}
			
			if(!this._listenerInfo[mixinName][listenerName]){
				this._listenerInfo[mixinName][listenerName] = {
					mixin: mixinName,
					name: listenerName,
					description: listenerDescription,
					params: listenerParams
				}
			}
			
			if(callback){
				callback(this._listenerInfo[mixinName][listenerName]);
			}
			
			return this._listenerInfo[mixinName][listenerName];	
		}
		
		FluxNodeConstructor.prototype.removeListenerInfo = function(mixinName, listenerName, callback){
			
		}
		
		FluxNodeConstructor.prototype.getListenerInfo = function(mixinName, eventName, callback){
			var returnInfo = {};
			console.log(this._listenerInfo);
			if((typeof mixinName) =='function'){
				callback = mixinName;
				eventName = false;
				mixinName = false;
			}
			
			if((typeof eventName)=='function'){
				callback = eventName;
				eventName = false;
			}
			
			if(!mixinName){
				returnInfo = this._listenerInfo;
			}else{
				if(!eventName){
					returnInfo = this._listenerInfo[mixinName];
				}else{
					returnInfo = this._listenerInfo[mixinName][eventName];
				}	
			}
			
			if(callback){
				callback(false, returnInfo);
			}
		}
		
		FluxNodeConstructor.prototype.getMixinInfo = function(message, rawMessage){
			if(rawMessage && rawMessage._message.sender){
				this.sendEvent(rawMessage._message.sender, 'FluxNode.getMixinInfo.Response', this._mixins, rawMessage._message.id);
			}
		}
		
		FluxNodeConstructor.prototype.getStoreInfo = function(message, rawMessage){
			var stores = this.StorageManager.getStores();
			var storeReturn = [];
			
			for(var i in stores){
				var store = stores[i];
				
				var storeCfg = {
					id: store.id,
					name: store.name,
					channels:[]
				};
				for(var chan in store._channels){
					var chanRec = store._channels[chan];
					console.log(store._channels[chan]);
					storeCfg.channels.push({
						name: chanRec.name
					});
				}
				storeReturn.push(storeCfg);
			}
			
			if(rawMessage && rawMessage._message.sender){
				this.sendEvent(rawMessage._message.sender, 'FluxNode.getStoreInfo.Response', storeReturn, rawMessage._message.id);
			}
		}
		
		FluxNodeConstructor.prototype.registerMiddleware = function(mixinName, actionName, middlewareFunc, callback){
			
			if(!this._middleware[mixinName]){
				this._middleware[mixinName]={};
			}
			
			if(!this._middleware[mixinName][actionName]){
				this._middleware[mixinName][actionName] = [];
			}
			
			this._middleware[mixinName][actionName].push(middlewareFunc);
			if(callback){
				callback();
			}
		}
		
		FluxNodeConstructor.prototype.getMiddleware = function(mixinName, actionName, params){
			var returnList = [];
			if(this._middleware[mixinName] && this._middleware[mixinName][actionName]){
				for(var i=0;i<this._middleware[mixinName][actionName].length;i++){
					returnList.push(this._middleware[mixinName][actionName][i]);
				}	
			};
			
			return returnList;
		}
		
		FluxNodeConstructor.prototype.processMiddleware = function(mixinName, actionName, params, callback){
			
			var middleware = this.getMiddleware(mixinName, actionName);
			
			var cont = true;
			
			if(!params){
				params = [];
			}
			
			params.push(function(success){
				cont = success;
				if(cont){
					doNextMiddleFunc();
				}else{
					if(callback){
						callback(false);
					}
				}
			});
			
			var doNextMiddleFunc = function(){
				if(middleware.length==0){
					if(callback){
						callback(cont);
					}
					return;
				}
				var middleFunc = middleware.shift();
				middleFunc.apply(this, params);	
			}
			
			doNextMiddleFunc();
			
			return cont;
		}
		
		FluxNodeConstructor.prototype.addTunnel = function(tunnel){
			var self = this;			
			var tunnelDef = self.TunnelManager.factory(tunnel.type).Tunnel;
			var newTunnel = new tunnelDef(tunnel.options);
			newTunnel.remoteID = tunnel.destination;
			self.TunnelManager.registerTunnel(tunnel.destination, newTunnel);
		}
		
		FluxNodeConstructor.prototype.doCallback = function(topic, message, rawMessage){
			var self = this;
			console.log('DIONG CALLBACK');
			if(rawMessage._message.sender){
				self.sendEvent(rawMessage._message.sender, topic+'.Response', message, rawMessage._message.id);
			}
		}
		
		FluxNodeConstructor.prototype.doSubscribe = function(subscriber, eventList){
			var self = this;
			for(var x in eventList){
				var eventName = eventList[x];
				var fieldList = false;
				var notFieldList = false;
				if(typeof eventName =='object'){
					fieldList = eventName.fields?eventName.fields:false;
					notFieldList = eventName.notfields?eventName.notfields:false;
					eventName = eventName.name;
				}
				
				if(!self.NodeSubscribers[subscriber]){
					self.NodeSubscribers[subscriber] = {};
				}
				
				var subscribeCallback = function(evtName){
					return function(data){
						if(self.debug) console.log('sending event to: '+subscriber);
						var dataToSend = self.clipDataByField(data, fieldList, notFieldList);
						self.sendEvent(subscriber, evtName, dataToSend);
					}
				}
				
				self.NodeSubscribers[subscriber][eventName] = subscribeCallback(eventName) 
				
				self.on(eventName, self.NodeSubscribers[subscriber][eventName]);
				self.sendEvent(subscriber, 'Subscribed', {
					subscribedEvent: eventName
				});
			}
		}
		
		FluxNodeConstructor.prototype.doUnsubscribe = function(subscriber, eventList){
			var self = this;
			if(eventList){
				for(var x in eventList){
					var eventName = eventList[x];
					if(self.NodeSubscribers[subscriber] && self.NodeSubscribers[subscriber][eventName]){
						self.off(eventName, self.NodeSubscribers[subscriber][eventName]);
					}	
				}	
			}else{
				for(var eventName in self.NodeSubscribers[subscriber]){
					self.off(eventName, self.NodeSubscribers[subscriber][eventName]);
				}
			}
			
		}
		
		/*
		 * Data Transformation Functions
		 */
		
		//retrieve a data value allowing for dot notation (object.attribute.subattribute)
		FluxNodeConstructor.prototype.getDataValueByString = function(data, nameString){
			var self = this;
			if(nameString!=''){
				if(nameString.indexOf('.')>-1){
					var nameParts = nameString.split('.');
					var currentAttr = nameParts.shift();
					var currentValue;
					if(data){
						currentValue = data[currentAttr];	
					}
					
					var newValue = self.getDataValueByString(currentValue, nameParts.join('.'));
					
					return newValue;
				}else{
					if(data){
						return data[nameString];	
					}else{
						return data;
					}
					
				}
			}else{
				return;	
			}
		}
		
		FluxNodeConstructor.prototype.mapTaggedObject =  function(inputObject, targetObject, tagFormat, callback){
			//inputObject and targetObject are required
			if(!inputObject || typeof(inputObject)!='object'){
				throw "Invalid input Object";
			}
			
			if(!targetObject || typeof(targetObject)!='object'){
				throw "Invalid target Object";
			}
			
			//tagFormat is optional, so we need to check iff the callback has been supplied in it's place
			if((typeof tagFormat)=='function'){
				callback = tagFormat;
				tagFormat = /{([^}])+}/g; //"{SourceName}" or "{Source.Name}" 
			}
			
			var self = this;
			
			for(var targetKey in targetObject){
				var targetKeyValue = targetObject[key];
				
				//for each property in the target object
				switch((typeof targetKeyValue)){
					//if it's a string, we need to check for tags
					case 'string':
						//TODO: add some built in objects like "Date" and "ThisNode"
						var matchedTags = targetKeyValue.match(tagFormat);
						//map the value for each matched tag
						for(var tagIdx=0;tagIdx<matchedTags.length;tagIdx++){
							var tag = matchedTags[tagIdx].replace('{').replace('}');
							var newValue = self.getDataValueByString(inputObject, tag);
							targetKeyValue = targetKeyValue.replace(matchedTags[tagIdx], newValue);
						}
						targetObject[targetKey] = targetKeyValue;
						break;
					//if it's an object, we need to run it back through the mapper
					case 'object':
						targetObject[targetKey] = self.mapTaggedObject(inputObject, targetObject[targetKey], tagFormat);
						break;
					//if it's anything else, leave it alone
					default:
						break;
					
				}
			}
			
			if(callback){
				callback(false, targetObject);	
			}
			
			return targetObject;
		}
		
		FluxNodeConstructor.prototype.setDataValueByString = function(data, nameString, value){
			var self = this; 
			if(!data){
				data = {};
			}
			if(nameString){
				if(nameString.indexOf('.')>-1){
					var nameParts = nameString.split('.');
					var currentName = nameParts.shift();
					data[currentName] = self.setDataValueByString(data[currentName], nameParts.join('.'), value);
				}else{
					data[nameString] = value;
				}
			}
			
			return data;
		}
		
		FluxNodeConstructor.prototype.removeDataValueByString = function(data, nameString){
			var self = this;
			
			if(nameString!=''){
				if(nameString.indexOf('.')>-1){
					var nameParts = nameString.split('.');
					var currentAttr = nameParts.shift();
					var currentValue;
					if(data){
						currentValue = data[currentAttr];	
					}
					
					var newValue = self.removeDataValueByString(currentValue, nameParts.join('.'));
					
					return newValue;
				}else{
					if(data){
						delete data[nameString];
						return true;	
					}else{
						delete data;
						return true;
					}
					
				}
			}else{
				return;	
			}
		}
		
		FluxNodeConstructor.prototype.clipDataByField = function(data, fieldList, notFieldList){
			var self = this;
			var clipData = {};
			
			if(!fieldList || fieldList.length==0){
				clipData = data;
			}else{
				for(var fieldIdx in fieldList){
					var fieldName = fieldList[fieldIdx];
					if(fieldName.indexOf('.')>-1){
						var objectFieldList = fieldName.split('.');
						var dataObject = null;
						var dataObjectName = objectFieldList.shift();
						
						if(data[dataObjectName]){
							dataObject = self.clipDataByField(data[dataObjectName], [objectFieldList.join('.')]);
						}
						
						clipData[dataObjectName] = dataObject;
						
					}else{
						clipData[fieldName] = data[fieldName];	
					}
					
				}
			}
			
			if(notFieldList && notFieldList.length>0){
				clipData = self.deleteDataFields(clipData, notFieldList);
			}
			
			return clipData;
		}
		/*
		 * map = {
		 * 	sourceAttrbuteName: 'targetAttributeName',
		 *  sourceAttributeObjectName: {
		 * 		//this subobject will be processed as if it was it's own object
		 * }
		 * }
		 * 
		 * {
		 * 		account: 'source'
		 * 		message: {
		 * 			subject: 'title',
		 * 			text:	'content.plaintext', //map this to a sub object
		 * 			headers: '', //we don't want this
		 * 			html: '',//we don't want this either
		 * 		}
		 * }
		 */
		FluxNodeConstructor.prototype.copyDataFields = function(source, target, map, parent){
			var self = this;
			if(!map){
				map={};
			}
			if(!target){
				target = {};
			}
			//if it's not in the map array, copy it over as it is
			for(var attributeName in source){
				if(map[attributeName]){
					var targetName = map[attributeName];
					
					switch(typeof targetName){
						case 'object':
							target[attributeName] = self.copyDataFields(source[attributeName], target[attributeName], targetName, target);
							break;
						default:
							if(targetName!=''){ //if the value is an empty string, the attribute wont be copied
								if(targetName.indexOf('.')>-1){
									var targetSubNameParts = targetName.split('.');
									var targetSubName = targetSubNameParts.shift();
									var addToParent = false;
									if(targetSubName=='_'){
										addToParent = true;
										targetSubName = targetSubNameParts.shift();
									}
									//we are setting an attribute of a sub object
									var newTargetValue = self.setDataValueByString(target[targetName], targetSubNameParts.join('.'), source[attributeName]);
									if(addToParent===true){
										if(parent){
											parent[targetSubName] = newTargetValue;
										}
									}else{
										target[targetSubName] = newTargetValue;	
									}
									
								}else{
									target[targetName] = source[attributeName];	
								}
									
							}
							break;
					}	
				}else{
					target[attributeName]=source[attributeName];
				}
			}
			
			return target;
		}
		
		FluxNodeConstructor.prototype.deleteDataFields = function(data, fieldList){
			var self = this;
			var clipData = data;
			
			for(var fieldIdx in fieldList){
				var fieldName = fieldList[fieldIdx];
				if(fieldName.indexOf('.')>-1){
					var objectFieldList = fieldName.split('.');
					var dataObject = null;
					var dataObjectName = objectFieldList.shift();
					
					if(data[dataObjectName]){
						dataObject = self.deleteDataFields(clipData[dataObjectName], [objectFieldList.join('.')]);
					}
					
					clipData[dataObjectName] = dataObject;
				}else{
					delete clipData[fieldName];
				}
				
			}
			return clipData;
		}
		
		/*FluxNodeConstructor.prototype.routeMessage = function(topic, data){
			var self = this;
			if(topic.indexOf('.')>-1){
				var topicParts = topic.split('.');
				var destination = topicParts.shift();
				
				var newTopic = topicParts.join('.');
				switch(destination){
					case self.id:
					
						break;
					default:
						self.TunnelManager.send(destination, newTopic, data);
						break;
				}
			}
		}*/
		
		FluxNodeConstructor.prototype.generateID = function(){
			var newID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			    return v.toString(16);
			});
			return newID;
		}
		
		FluxNodeConstructor.prototype.getInstalledMixins = function(callback){
			var self = this;
			var fs = require('fs');
			fs.readdir(__dirname+'/lib/mixins/', function(err, files){
				var returnList = [];
				
				for(var i=0;i<files.length;i++){
					var file = fs.statSync(__dirname+'/lib/mixins/'+files[i]);
					if(file.isDirectory()){
						if(!self._mixins[files[i]]){
							if(fs.existsSync(__dirname+'/lib/mixins/'+files[i]+'/package.json')){
								var mixinInfo = require(__dirname+'/lib/mixins/'+files[i]+'/package.json');
								returnList.push(mixinInfo);
							}	
						}
					}
				}
				
				if(callback){
					
					callback(false, returnList);
				}
			});
		}
		
		FluxNodeConstructor.prototype.mixin = function(mixinName, mixinParams, callback){
			var self = this;
			
			if(self._environment=='nodejs'){
				var mixinClass= false;
				if(!self._mixins[mixinName]){
					//try and load the mixin from the standard paths
					try{
						console.log(mixinName);
						mixinClass = require(mixinName);
					}catch(err){
						if(!mixinClass){
							mixinClass = require('./lib/mixins/'+mixinName);
						}
					}
					
					//fall back to the mixin folder
					if(!mixinClass){
						console.log("STILL NOT FOUND");
					}
				
					
					
					for(var x in mixinClass){
						if(x!='init'){
							self[x] = mixinClass[x];
						}
					}
					
					if(!mixinParams){
						mixinParams = {};
					}
					
					mixinClass.init.call(self, mixinParams, function(err, mixinReturn){
						self._mixins[mixinName] = mixinReturn;
						if(callback){
							callback.call(self, err, mixinReturn);	
						}
						self.emit('Mixin.Ready', mixinReturn);
					});	
				}else{
					mixinReturn = self._mixins[mixinName];
					if(callback){
						callback.call(self, false, mixinReturn);
					}
				}
			}else{
				if(!self._mixins[mixinName]){
					//first try finding the mixin as is
					if(self.debug){console.log('Mixin: Checking without modification')}
					
					require([mixinName], function(mixinClass){
						for(var x in mixinClass){
							if(x!='init'){
								self[x] = mixinClass[x];
							}
						}
						mixinClass.init.call(self, mixinParams, function(err, mixinReturn){
							self._mixins[mixinName] = mixinReturn;
							
							if(callback){
								callback.call(self, err, mixinReturn);	
							}
							self.emit('Mixin.Ready', mixinReturn);
						});
					},
					function(){
						require(['mixins/'+mixinName], function(mixinClass){
							//if(self.debug) console.log(arguments);
							for(var x in mixinClass){
								if(x!='init'){
									self[x] = mixinClass[x];
								}
							}
	
							mixinClass.init.call(self, mixinParams, function(err, mixinReturn){
								self._mixins[mixinName] = mixinReturn;
								self.emit('Mixin.Ready', mixinReturn);
								if(callback){
									callback.call(self, err, mixinReturn);	
								}
							});
							
							
						}, function(){
							if(self.debug) console.log('Mixin: Checking node_modules Folder');
							//finally, try a node_modules folder
							require(['node_modules/'+mixinName], function(mixinClass){
								for(var x in mixinClass){
									if(x!='init'){
										self[x] = mixinClass[x];
									}
								}
								mixinClass.init.call(self, mixinParams, function(err, mixinReturn){
									
									self._mixins[mixinName] = mixinReturn;
		
									self.emit('Mixin.Ready', mixinReturn);
									if(callback){
										callback.call(self, err, mixinReturn);	
									}
								});
	
							}, function(){
								self.emit('FluxNode.Error', {
									number: 50000,
									message: "Failed to load: "+mixinName
								});
								console.log('load error');
								console.log(arguments);
								console.log('FAILED LOAD');
								console.log(self);
								console.log(mixinName);
								self.emit('FluxNode.Error', mixinName, mixinParams);
							});
						});
					});
				}else{
					console.log('Already Mixed In: '+name);
					callback.call(self);
				}
			}
		}
		
	return FluxNodeConstructor;
}