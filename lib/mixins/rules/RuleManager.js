var mixinFunctions = {
	init: function(cfg, callback){
		var thisNode = this;
		
		thisNode.addSetting('RuleManager.Store', false);
		thisNode.addSetting('RuleManager.Channel', 'Rules');
		
		thisNode.onAny(function(message, rawMessage){
			thisNode.RuleManager_ProcessRules(thisNode.event, message, rawMessage);
		});
		
		if(cfg){
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
			
			for(var i=0;i<ruleDef.actions.length;i++){
				if((typeof ruleDef.actions[i])=='function'){
					console.log('ACTION FUNCTION');
					ruleDef.actions[i] = ruleDef.actions[i].toString(); 			
				}else{
					if(ruleDef.actions[i].action){
						console.log('ACTION FUNCTION 2');
						ruleDef.actions[i].action = ruleDef.actions[i].action.toString();
					}
				}
			}
		}
		
		thisNode.StorageManager.save(ruleDef, thisNode.getSetting('RuleManager.Store'), thisNode.getSetting('RuleManager.Channel'), function(err, records){
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
							var criteria = rule.criteria;
							
							for(var cIdx=0; cIdx<criteria.length;cIdx++){
								switch(typeof criteria[cIdx]){
									case 'function':
										var f = criteria[cIdx];
										if(f(thisNode, message, rawMessage)==false){
											passed = false;
											cIdx = criteria.length;
										}
										break;
								}
							}
							
							if(passed){
								var actions = rule.actions;
								
								if(actions.length>0){
									for(var aIdx=0;aIdx<actions.length; aIdx++){
										var action = actions[aIdx];
										
										if(action.action){
											eval('action.action = '+action.action);
										}else{
											eval('action = '+action);
										}
										
										switch(typeof action.action){
											case 'function':
												var f = action.action;
												f(thisNode, message, rawMessage);
												break;
											default:
												
												if((typeof action)=='function'){
													
													action(thisNode, message, rawMessage);
												}
												break;
										}
									}
								}
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
		
	}
}


if (typeof define === 'function' && define.amd) {
	define(mixinFunctions);
} else {
	module.exports = mixinFunctions;
}