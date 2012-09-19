//FluxNode is an Instance of EventEmitter2 that has been extended with additional functionality
exports = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);
	
if (typeof define === 'function' && define.amd) {
	define(['util', 'EventEmitter2', 'TunnelManager/TunnelManager', 'StorageManager/StorageManager'], function(util, EventEmitter2, TunnelManager, StorageManager) {
		var fnConstruct = FluxNodeObj(util, EventEmitter2, TunnelManager, StorageManager);
		return fnConstruct;
	});		
} else {
	var util = require('util'),
		EventEmitter2 = require('EventEmitter2').EventEmitter2,
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
		self.TunnelManager = TunnelManager;
		self.NodeSubscribers = {};
		
		evObj.call(self, cfg);
		if(cfg.id){
			self.id = cfg.id;		
		}
		if(!self.id){
			var thisId = self.generateID(); 
			if(self.debug) console.log('setting id: '+thisId);
			self.id = thisId;
		}
		
		if(self.debug) console.log('Configuring Tunnel Manager');
		self.TunnelManager = new TunnelManager();
		
		self.TunnelManager.configureManager({
			debug:true,
			allowRelay: true,
			sender: self.id
		});
		
		self.TunnelManager.on('message', function(message){
			self.emit(message.topic, message.message, message);
		});
		
		self.TunnelManager.on('tunnelready', function(destination, tunnel){
			self.emit('tunnelready', destination, tunnel);
		});
		
		self.TunnelManager.on('tunnelclosed', function(remoteId){
			self.doUnsubscribe(remoteId);
			
			self.emit('tunnelclosed', remoteId);
		});
		
		if(self.debug) console.log('Configuring Storage Manager');
		
		self.StorageManager = StorageManager;
		
		self.sendEvent = function(destinationId, topic, message){
			
			if(!destinationId || destinationId==self.id){
				self.emit(topic, message);
			}else{
				self.TunnelManager.send(destinationId, topic, message);
			}
		}
		
		//TODO: for legacy code, remove
		self.fireEvent = self.sendEvent;
		self._environment = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? 'nodejs' : 'browser');
		
		//require some items
		self.Subscribers = {};
		
		self.on('Subscribe', function(message, data){
			if(self.debug) console.log(data);
			self.doSubscribe(data._message.sender, data.message.eventName);
		});
		
		self.on('Unsubscribe', function(data){
			self.doUnsubscribe(data._message.sender, data.message.eventName);
		});
		
		if(cfg){
			if(cfg.tunnels){
				for(var tIdx in cfg.tunnels){
					var tunnel = cfg.tunnels[tIdx];
					
					var tunnelDef = self.TunnelManager.factory(tunnel.type).Tunnel;
					var newTunnel = new tunnelDef(tunnel.options);
					newTunnel.remoteID = tunnel.destination;
					self.TunnelManager.registerTunnel(tunnel.destination, newTunnel);
				}
			}
			if(cfg.mixins){
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
					}
				}
				mixinLoop();
			}
		}
		
		if(cb){
			cb(self, cfg);
		}
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
				
				self.NodeSubscribers[subscriber][eventName] = function(data){
					if(self.debug) console.log('sending event to: '+subscriber);
					var dataToSend = self.clipDataByField(data, fieldList, notFieldList);
					self.sendEvent(subscriber, eventName, dataToSend);
				}
				
				self.on(eventName, self.NodeSubscribers[subscriber][eventName]);	
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
				console.log(attributeName);
				if(map[attributeName]){
					var targetName = map[attributeName];
					console.log('-'+targetName);
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
						dataObject = self.deleteDataFields(data[dataObjectName], [objectFieldList.join('.')]);
					}
					
					data[dataObjectName] = dataObject;
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
				try{
					mixinClass = require(mixinName);	
				}catch(err){
					//nothing to see here, move along
				}
				
				if(!mixinClass){
					mixinClass = require('./mixins/'+mixinName);
				}
				for(var x in mixinClass){
					if(x!='init'){
						self[x] = mixinClass[x];
					}
				}
				mixinClass.init.call(self, mixinParams);
				if(callback){
					callback.call(self);	
				}
			}else{
				//if(self.debug) console.log('./mixins/'+mixinName+'.js');
				require(['mixins/'+mixinName], function(mixinClass){
					//if(self.debug) console.log(arguments);
					for(var x in mixinClass){
						if(x!='init'){
							self[x] = mixinClass[x];
						}
					}
					mixinClass.init.call(self, mixinParams);
					if(callback){
						callback.call(self);	
					}
				});
			}
		}
		
	return FluxNodeConstructor;
}