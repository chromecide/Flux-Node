;!function(exports, undefined) {
	var entity = require(__dirname+'/lib/entity').Entity;
	var model = require(__dirname+'/lib/model').Model;
	var attribute = require(__dirname+'/lib/attribute').Attribute;
	var channel = require(__dirname+'/lib/channel.js').Channel;
	
	var Data = {
		init: function(cfg, callback){
			var thisNode = this;
			
			
			var mixinReturn = {
				name: 'Data',
				config: cfg
			}
			
			thisNode.Data = {
				Manager: function(){},
				Model: model,
				Entity: entity,
				Attribute: attribute,
				Channel: channel,
				Channels:{},
				Models: {},
				addModel: function(name, fields){
					var model = new thisNode.Data.Model(name, fields);
					model.on('changed', function(model){
						thisNode.emit('Data.Model.Changed', model);
					});
					thisNode.Data.Models[name] = model;
					thisNode.emit('Data.Model.Added', model);
				},
				getModels: function(name){
					return thisNode.Data.Models;
				},
				addChannel: function(name, type, model, callback){
					new thisNode.Data.Channel(name, type, model, function(channel){
						thisNode.Data.Channels[channel.name] = channel;
						thisNode.emit('Data.Channel.Added', channel);
					});
				}
			};
			
			if(cfg.models){
				processModelCfg.call(thisNode, cfg.models, function(){
					
					if(cfg.channels){
						
						processChannelCfg.call(thisNode, cfg.channels, function(){
							
							if(callback){
								callback(false, mixinReturn);
							}
							
							thisNode.emit('Mixin.Ready', mixinReturn);
						});
					}else{
						if(callback){
							callback(mixinReturn);
						}
						
						thisNode.emit('Mixin.Ready', mixinReturn);
					}
				});
			}else{
				if(cfg.channels){
					processChannelCfg.call(thisNode, cfg.channels, function(){
						if(callback){
							callback(mixinReturn);
						}
						
						thisNode.emit('Mixin.Ready', mixinReturn);	
					});
				}else{
					if(callback){
						callback(mixinReturn);
					}
					
					thisNode.emit('Mixin.Ready', mixinReturn);
				}
			}
			
		}
	}
	
	function processModelCfg(models, callback){
		var thisNode = this;
		var modelList = [];
		for(var i=0;i<models.length;i++){
			modelList.push(models[i]);
		}
		
		function modelLoader(){
			if(modelList.length==0){
				if(callback){
					callback();
				}
				
				return;
			}
			
			var modelCfg = modelList.shift();
			var model = new thisNode.Data.Model(modelCfg);
			thisNode.Data.Models[model.name] = model;
			thisNode.emit('Data.Model.Ready', model);
			modelLoader();
		}
		
		modelLoader();
	}
	
	
	function processChannelCfg(channels, callback){
		var thisNode = this;
		var channelList = [];
		for(var i=0;i<channels.length;i++){
			channelList.push(channels[i]);
		}
		
		if(channelList.length==0){
			console.log('channels empty');
			if(callback){
				callback();
			}
			return;
		}
		
		function chanLoader(){
			if(channelList.length==0){
				if(callback){
					callback();
				}
				
				return;
			}
			
			var chanCfg = channelList.shift();
			
			if(chanCfg.model && (typeof chanCfg.model)=='string'){
				chanCfg.model = thisNode.Data.Models[chanCfg.model];
			}
			
			new thisNode.Data.Channel(chanCfg.name, chanCfg, function(channel){
				thisNode.Data.Channels[channel.name] = channel;
				thisNode.emit('Data.Channel.Ready', channel);
				chanLoader();
			});
		}
		
		chanLoader();
	}
	
	if (typeof define === 'function' && define.amd) {
	    define(function() {
	    	return Data;
	    });
	} else {
		exports = module.exports = Data; 
	}
	
}(typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);
