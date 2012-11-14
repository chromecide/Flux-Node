//FluxNode is an Instance of EventEmitter2 that has been extended with additional functionality
exports = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);

if (typeof define === 'function' && define.amd) {
	
	require.config({
		paths:{
			'util': './lib/util',
			'FluxNode': './',
			'TunnelManager': './TunnelManager',
			'Tunnel': 'TunnelManager/Tunnel',
			'Tunnels': './TunnelManager/Tunnels',
			'StorageManager': './StorageManager',
			'Store': 'StorageManager/Store',
			'Stores': 'StorageManager/Stores',
			'EventEmitter2': './node_modules/eventemitter2/lib/eventemitter2',
			'mixins': './lib/mixins'
		}
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
		
		if(!cfg){
			cfg = {};
		}
		
		if(cfg.debug){
			self.debug = cfg.debug;
		}
		
		evObj.call(self, cfg);
		
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
		
		if(self.debug) console.log('Starting FluxNode: '+self.id);
		
		self.Subscribers = {};
		
		self.on('Subscribe', function(message, data){
			if(self.debug) console.log(data);
			if(!data.message.events && data.message.eventName) data.message.events=data.message.eventName; //supporting legacy code
			self.doSubscribe(data._message.sender, data.message.events);
		});
		
		self.on('Unsubscribe', function(data){
			if(!data.message.events && data.message.eventName) data.message.events=data.message.eventName; //supporting legacy code
			self.doUnsubscribe(data._message.sender, data.message.events);
		});
		
		if(cfg.listeners){
			if(self.debug) console.log('Configuring Listeners');
			for(var topic in cfg.listeners){
				self.on(topic, cfg.listeners[topic]);
			}
		}
		
		if(self.debug) console.log('Configuring StorageManager');
		
		var storageManager = new StorageManager();
		
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
			console.log('creating default store');
			cfg.stores = [
				{
					type: 'Memory',
					isDefault: true
				}
			]	
		}
		
		storageManager.once('StorageManager.Ready', function(err, SM){
			if(self.debug) console.log('StorageManager Ready');
			self.StorageManager = SM;
			self.StorageManager.on('StorageManager.StoreReady', function(err, store){
				self.emit('StorageManager.StoreReady', err, store);
			});
			
			if(self.debug) console.log('Configuring Tunnel Manager');
			self.TunnelManager = new TunnelManager();
			
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
							return function (message, rawMessage){
								if(rawMessage._message.inReplyTo==messageId){
									cb.call(self, message, rawMessage);
								}else{
									//re-add the listener
									self.once(topic+'.Response', callbackListenerCreator(messageId, callback));
								}
							}	
						}
						self.once(topic+'.Response', callbackListenerCreator(mId, callback));
					}
				}
			}
			
			self.TunnelManager.once('TunnelManager.Ready', function(){
				
				self.TunnelManager.on('message', function(message){
					self.emit(message.topic, message.message, message);
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
									self.mixin(mixinName, options, mixinLoop);
								}else{
									self.mixin(mixin, {}, mixinLoop);	
								}
							}	
						}else{
							console.log('READY');
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
		
		storageManager.configure({
			stores: cfg.stores
		});
		
		return self;
	}
	
		util.inherits(FluxNodeConstructor, evObj);
		
		FluxNodeConstructor.prototype.addTunnel = function(tunnel){
			var self = this;			
			var tunnelDef = self.TunnelManager.factory(tunnel.type).Tunnel;
			var newTunnel = new tunnelDef(tunnel.options);
			newTunnel.remoteID = tunnel.destination;
			self.TunnelManager.registerTunnel(tunnel.destination, newTunnel);
		}
		
		FluxNodeConstructor.prototype.doCallback = function(argList, options){
			if(typeof argList[argList.length-1] =='function'){
				var cb = argList[argList.length-1];
				cb.apply(options);
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
					var currentValue = data[currentAttr];
					
					var newValue = self.getDataValueByString(currentValue, nameParts.join('.'));
					
					return newValue;
				}else{
					return data[nameString];
				}
			}else{
				return;	
			}
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
		
		FluxNodeConstructor.prototype.routeMessage = function(topic, data){
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
		}
		
		FluxNodeConstructor.prototype.generateID = function(){
			var newID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			    return v.toString(16);
			});
			return newID;
		}
		
		FluxNodeConstructor.prototype.mixin = function(mixinName, mixinParams, callback){
			var self = this;
			
			if(self._environment=='nodejs'){
				var mixinClass= false;
				//try and load the mixin from the standard paths
				try{
					mixinClass = require(mixinName);
				}catch(err){
					//nothing to see here, move along
				}
				
				//fall back to the mixin folder
				if(!mixinClass){
					mixinClass = require('./lib/mixins/'+mixinName);
				}
				
				for(var x in mixinClass){
					if(x!='init'){
						self[x] = mixinClass[x];
					}
				}
				
				if(!mixinParams){
					mixinParams = {};
				}
				
				mixinClass.init.call(self, mixinParams, function(){
					if(callback){
						callback.call(self);	
					}	
				});
				
			}else{
				//if(self.debug) console.log('./mixins/'+mixinName+'.js');
				require([mixinName], function(mixinClass){
					//if(self.debug) console.log(arguments);
					for(var x in mixinClass){
						if(x!='init'){
							self[x] = mixinClass[x];
						}
					}
					mixinClass.init.call(self, mixinParams, function(){
						if(callback){
							callback.call(self);	
						}
						self.emit('MixinAdded', mixinClass, mixinParams);
					});
				},
				function(){
					console.log(arguments);
					console.log('FAILED LOAD');
					require(['mixins/'+mixinName], function(mixinClass){
						//if(self.debug) console.log(arguments);
						for(var x in mixinClass){
							if(x!='init'){
								self[x] = mixinClass[x];
							}
						}
						mixinClass.init.call(self, mixinParams, function(){
							self.emit('MixinAdded', mixinClass, mixinParams);
							if(callback){
								callback.call(self);	
							}
						});
					});
				});
			}
		}
		
	return FluxNodeConstructor;
}