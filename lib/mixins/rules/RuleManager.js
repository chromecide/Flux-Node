var mixinFunctions = {
	init: function(cfg, callback){
		var thisNode = this;
		
		thisNode.addSetting('RuleManager.Store', false);
		thisNode.addSetting('RuleManager.Channel', 'Rules');
		
		thisNode.onAny(function(message, rawMessage){
			thisNode.RuleManager_ProcessRules(thisNode.event, message, rawMessage);
		});
		
		if(cfg){
			if(cfg.store){
				//console.log(thisNode.StorageManager.getStore(cfg.store));
				thisNode.setSetting('RuleManager.Store', cfg.store);
			}
			
			if(cfg.buildStructure){
				thisNode.StorageManager.getStore(thisNode.getSetting('RuleManager.Store'), function(err, str){
					new thisNode.StorageManager.Model('Rule', {
						name: {
							validators:{
								string:{}
							}
						},
						topic: {
							validators:{
								string:{}
							}
						},
						criteria: {
							validators: {
								hasMany:{
									validators:{
										object:{
											fields: {
												attribute: {
													validators:{
														string:{}, 
														required:{}
													}
												},
												operator: {
													validators:{
														string:{}, required:{}
													}
												},
												value: {}
											}
										}		
									}
								}
							}
						},
						actions: {
							validators: {
								object:{
									fields: {
										type: {string:{}, required:{}},
										map: {object:{}}
									}
								}
							}
						}
					}, function(err, ruleModel){
						new thisNode.StorageManager.Channel({
							name: 'Rules',
							model: ruleModel.model
						}, function(err, rulesChannel){
							str.addChannel(rulesChannel);
						});
					})
				});
			}
			
			
			if(cfg.rules && cfg.rules.length>0){
				var rules = cfg.rules;
				var rulesLoop = function(){
					if(rules.length==0){
						if(callback){
							
							callback(cfg);
						}
						thisNode.emit('Mixin.Ready', {
							name: 'RuleManager',
							cfg:cfg
						});
						return;
					}
					
					var rule = rules.shift();
					console.log('ADDING RULE');
					thisNode.RuleManager_AddRule(rule, function(){
						rulesLoop();
					});
				}
				rulesLoop();
			}else{
				if(callback){
					callback(cfg);
				}
				thisNode.emit('Mixin.Ready', {
					name: 'RuleManager',
					cfg:cfg
				});	
			}
			
		}else{
			if(callback){
				callback(cfg);
			}
			thisNode.emit('Mixin.Ready', {
				name: 'RuleManager',
				cfg:cfg
			});
		}
		
	},
	RuleManager_Settings:{
		store: false,
		channels: false
	},
	RuleManager_GetRules: function(query, fields, callback){
		var thisNode = this;
		
		thisNode.StorageManager.find(query, {}, thisNode.getSetting('RuleManager.Store'), thisNode.getSetting('RuleManager.Channel'), function(err, recs){
			if(!err){
				if(callback){
					callback(false, recs);
				}
				thisNode.emit('RuleManager.RulesLoaded', query);
			}else{
				if(callback){
					callback(err, false);
				}
				console.log(err);
				console.log(records);
				thisNode.emit('RuleManager.Error', err, recs);
			}
		});
	},
	RuleManager_AddRule: function(ruleDef, callback){
		var thisNode = this;
		
		if(ruleDef.criteria && ruleDef.criteria.length>0){
			for(var i=0;i<ruleDef.criteria.length;i++){
				if((typeof ruleDef.criteria[i])=='function'){
					console.log('criteria function');
					ruleDef.criteria[i] = ruleDef.criteria[i].toString(); 			
				}
			}
		}
		
		/*if(ruleDef.actions && ruleDef.actions.length>0){
			for(var i=0;i<ruleDef.actions.length;i++){
				if((typeof ruleDef.actions[i])=='function'){
					console.log('ACTION FUNCTION');
					ruleDef.actions[i] = ruleDef.actions[i];//.toString();			
				}else{
					if(ruleDef.actions[i].action){
						console.log('ACTION FUNCTION 2');
						ruleDef.actions[i].action = ruleDef.actions[i].action.toString();
					}
				}
			}
		}*/
		
		thisNode.StorageManager.save(ruleDef, thisNode.getSetting('RuleManager.Store'), thisNode.getSetting('RuleManager.Channel'), function(err, records){
			//console.log(thisNode.StorageManager.getStore(thisNode.getSetting('RuleManager.Store'))._records.Rules);
			console.log('RULE SAVED');
			if(!err){
				if(callback){
					callback(false, records);
				}
				thisNode.emit('RuleManager.RuleAdded', records);
			}else{
				
				if(callback){
					callback(err, false);
				}
				
				thisNode.emit('RuleManager.Error', err, records);
			}
		})
	},
	RuleManager_ProcessRules: function(topic, message, rawMessage){
		var thisNode = this;
		
		console.log('Processing Rules for: '+topic);
		//console.log(message);
		thisNode.StorageManager.find(
			{
				topic: topic
			},
			{},
			thisNode.getSetting('RuleManager.Store'),
			thisNode.getSetting('RuleManager.Channel'),
			function(err, rulesList){
				if(!err){
					if(rulesList.length>0){
						for(var i=0;i<rulesList.length;i++){
							var rule = rulesList[i].record;
							var passed = true;
							var criteria = rule.get('criteria');
							
							if(!criteria){
								criteria = [];
							}
							for(var cIdx=0; cIdx<criteria.length;cIdx++){
								switch(typeof criteria[cIdx]){
									case 'function':
										var f = criteria[cIdx];
										if(f(thisNode, message, rawMessage)==false){
											passed = false;
											cIdx = criteria.length;
										}
										break;
									case 'object':
										
										break;
								}
							}
							
							if(passed){
								var actions = rule.get('actions');
								
								if(actions.length>0){
									for(var aIdx=0;aIdx<actions.length; aIdx++){
										var action = actions[aIdx];
										var actionMap = {};
										
										if((typeof action)=='object'){
											actionMap = action.map;
											action = action.action;	
										}
										
										switch(typeof action){
											case 'string':
												switch(action){
													case 'emit':
														thisNode.RuleManager_doEmitAction(actionMap, message, rawMessage);
														break;
												}
												break;
											case 'function':
												var f = action;
												f.call(thisNode, message, rawMessage);
												break;
											default:
											
												break;
										}
									}
								}
							}else{
								console.log('NO PASS');
							}
						}
					}
				}else{
					console.log(err);
					console.log(records);
					thisNode.emit(
						'RuleManager.Error',
						{
							message: err
						}
					)
				}
			}
		);
		
	},
	RuleManager_doEmitAction: function(map, message, rawMessage, callback){
		var thisNode = this;
		thisNode.RuleManager_doMapObject(map, message, rawMessage, function(err, mappedValue){
			thisNode.emit(mappedValue.topic, mappedValue.message);
			if(callback){
				callback(false);
			}
		});
	},
	RuleManager_doMapObject: function(map, inputData, rawMessage, callback){
		var thisNode = this;
		
		var mappedValue = {};
		
		var mapKeys = [];
		for(var key in map){
			mapKeys.push(key);
		}
		
		function mapLoop(){
			if(mapKeys.length==0){
				if(callback){
					callback(false, mappedValue);
				}
				return;
			}
			
			var keyName = mapKeys.shift();
			var unMappedValue = map[keyName];
			switch(typeof unMappedValue){
				case 'string':
					if(unMappedValue.indexOf('{')>-1){ //contains tags that need to be replaced
						thisNode.RuleManager_doMapTaggedString(unMappedValue, inputData, rawMessage, function(err, mappedString){
							mappedValue[keyName] = mappedString;
							mapLoop();
						});
					}else{ //a supplied string, leave as is
						mappedValue[keyName] = unMappedValue;
						mapLoop();
					}
					break;
				case 'object':
					thisNode.RuleManager_doMapObject(unMappedValue, inputData, rawMessage, function(err, mappedVal){
						mappedValue[key] = mappedVal;
						mapLoop();
					});
					break;
				case 'function':
					unMappedValue.call(thisNode, inputData, rawMessage, function(err, mappedVal){
						mappedValue[key] = mappedVal;
						mapLoop();
					});
					break;
			}
		}
		
		mapLoop();
	},
	RuleManager_doMapTaggedString: function(taggedString, inputData, rawMessage, callback){
		var thisNode = this;
		var tagReg = /{([^}])+}/g;
		
		var matches = taggedString.match(tagReg);
		var processedString = taggedString;
		for(var i=0;i<matches.length;i++){
			var match = matches[i];
			
			var tag = match.replace('{', '').replace('}', '');
			
			var tagParts = tag.split('.');
			
			switch(tagParts[0]){
				case 'this':
				case 'This':
					if(tagParts.length==1){
						processedString = processedString.replace(match, thisNode);
					}else{
						switch(tagParts[1]){
							case 'id':
								if(taggedString==match){
									processedString = this.id;
								}else{
									processedString = processedString.replace(match, this.id);
								}
								
								break;
							case 'settings':
							case 'Settings':
							
								tagParts.shift();
								
								if(taggedString==match){
									processedString = thisNode.getSetting(tagParts.join('.'))
								}else{
									processedString = processedString.replace(match, thisNode.getSetting(tagParts.join('.')));	
								}
								break;
							case 'stores':
							case 'Stores':
								//TODO: add support for other store functions
								tagParts.shift();
								tagParts.shift();
								if(taggedString==match){
									processedString = thisNode.StorageManager.getStore(tagParts.join('.'));
								}else{
									processedString = processedString.replace(match, thisNode.StorageManager.getStore(tagParts.join('.').toString());
								}
								break;
						}
					}
					break;
				case 'input':
				case 'Input':
					tagParts.shift();
					
					processedString = processedString.replace(match, thisNode.getDataValueByString(inputData, tagParts.join('.')));
					break;
				case 'message':
				case 'Message':
					tagParts.shift();
					
					processedString = processedString.replace(match, thisNode.getDataValueByString(rawMessage, tagParts.join('.')));
					break;
				
			}
		}
		
		if(callback){
			callback(false, processedString);
		}
	}
}


if (typeof define === 'function' && define.amd) {
	define(mixinFunctions);
} else {
	module.exports = mixinFunctions;
}