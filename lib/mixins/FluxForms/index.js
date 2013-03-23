;!function(){
	var mixinFunctions = {
		init: function(cfg, callback){
			var thisNode = this;
			//add properties that are needed by this mixin
		
			//add Events that are emitted by this mixin
			
			//add listeners
			
			//should be called when the mixin is actually ready, not simp;y at the end of the init function
			var mixinReturn = {
				name: 'myMixinName',
				config: cfg
			}
			
			if(callback){
				callback(mixinReturn);
			}
			
			thisNode.emit('Mixin.Ready', mixinReturn);
		},
		FluxForms_BuildObjectFields: function(formId, objectDef, objectVal, renderFieldset, callback){
			
			var thisNode = this;
			var retHTML='';
			if(renderFieldset!==false){
				retHTML+='<fieldset>';
				retHTML+='<legend data-toggle="collapse" data-target="#'+formId+'_object_collapse">'+objectDef.name+'</legend>';
				retHTML+= '<div  class="collapse" id="'+formId+'_object_collapse">';	
			}
			
			var field = objectDef.validators.object;
			if(field.fields){
				for(var fieldName in field.fields){
					var fieldItem = field.fields[fieldName];
					
					var fieldRendered = false;
					if(!fieldItem.validators || fieldItem.validators.string || fieldItem.validators.number){
						retHTML+='<div class="control-group">';
						retHTML+='<label class="control-label" for="'+formId+'_'+fieldName+'">'+fieldName+'</label>';
						retHTML+='<div class="controls">';
						retHTML+='<input type="text" name="'+formId+'_'+fieldName+'" value="'+(objectVal && objectVal[fieldName]?objectVal[fieldName]:'')+'">';
						retHTML+='</div>';
						retHTML+='</div>';
					}else{
						if(fieldItem.validators.object){
							retHTML+='<div class="control-group">';
							retHTML+='<div class="controls">';
							retHTML+=thisNode.FluxForms_BuildObjectFields(formId+'_'+fieldName, fieldItem, (objectVal?objectVal[fieldName]:''));
							retHTML+='</div>';
							retHTML+='</div>';
						}else{
							if(fieldItem.validators.hasMany){
								retHTML+='<div class="control-group">';
								retHTML+='<div class="controls">';
								retHTML+=thisNode.FluxForms_BuildHasManyFields(formId+'_'+fieldName, fieldItem, (objectVal?objectVal[fieldName]:''));
								retHTML+='</div>';
								retHTML+='</div>';
							}else{
								retHTML+='<div class="control-group">';
								retHTML+='<label class="control-label" for="mixinSettng_'+fieldName+'">'+fieldName+'</label>';
								retHTML+='<div class="controls">';
								retHTML+='<input type="text" name="mixinSettng_'+fieldName+'" value="'+(objectVal && ObjectVal[fieldName]?objectVal[fieldName]:'')+'">';
								retHTML+='</div>';
								retHTML+='</div>';	
							}
						}
					}
				}
			}
			if(renderFieldset!==false){
				retHTML+='</div>';
				retHTML+='</fieldset>';
			}
			if(callback){
				callback(retHTML);
			}
			
			return retHTML;
		},
		FluxForms_BuildHasManyFields: function(formId, objectDef, objectVal, renderFieldset, callback){
			var thisNode = this;
			fieldConfig = objectDef.validators.hasMany;
			var configName = fieldConfig.name;
			var retHTML = '';
			if(renderFieldset!==false){
				retHTML+='<fieldset>';
				retHTML+='<legend data-toggle="collapse" data-target="#'+formId+'_object_collapse">'+configName+'</legend>';
				retHTML+= '<div class="collapse" id="'+formId+'_object_collapse">';
			}
			
			if(fieldConfig.validators){
				if(fieldConfig.validators.string){
					retHTML+='<div class="control-group">';
					retHTML+='<label class="control-label" for="'+configName+'">'+configName+': </label>';
					retHTML+='<div class="controls">';
					retHTML+='<input type="text" name="'+configName+'" id="mixin_window_'+configName+'"/>';
					retHTML+='</div>';
					retHTML+='</div>';
				}
				
				if(fieldConfig.validators.boolean){
					retHTML+='<div class="control-group">';
					retHTML+='<label class="control-label" for="'+configName+'">'+configName+': </label>';
					retHTML+='<div class="controls">';
					retHTML+='<input type="checkbox" name="'+configName+'" id="mixin_window_'+configName+'"/>';
					retHTML+='</div>';
					retHTML+='</div>';
				}
				
				if(fieldConfig.validators.date){
					retHTML+='<div class="control-group">';
					retHTML+='<label class="control-label" for="'+configName+'">'+configName+': </label>';
					retHTML+='<div class="controls">';
					retHTML+='<input type="text" name="'+configName+'" id="mixin_window_'+configName+'"/>';
					retHTML+='</div>';
					retHTML+='</div>';
				}
				
				if(fieldConfig.validators.number){
					retHTML+='<div class="control-group">';
					retHTML+='<label class="control-label" for="'+configName+'">'+configName+': </label>';
					retHTML+='<div class="controls">';
					retHTML+='<input type="text" name="'+configName+'" id="mixin_window_'+configName+'"/>';
					retHTML+='</div>';
					retHTML+='</div>';
				}
				
				if(fieldConfig.validators.object){
					retHTML+= thisNode.FluxForms_BuildObjectFields(formId+'_new_'+configName.replace(/ /g,'_'), fieldConfig, objectVal?objectVal[configName]:'', false);
					retHTML+='<div class="form-actions"><button class="btn btn-primary" type="button">Add</button>&nbsp;<button class="btn" type="button">Reset</button></div>';
					retHTML+='<table  class="table table-striped" width="100%">';
					retHTML+='<tr>';
					for(var fieldName in fieldConfig.validators.object.fields){
						retHTML+='<th>'+fieldName+'</th>';
					}
					if(Array.isArray(objectVal)){
						for(var rowIdx=0;rowIdx<objectVal.length;rowIdx++){
							var row = objectVal[rowIdx];
							retHTML+='<tr>';
							for(var fieldName in fieldConfig.validators.object.fields){
								retHTML+='<td>'+row[fieldName]+'</td>';
							}
							retHTML+='</tr>';
						}
					}
					retHTML+='</tr>';
					retHTML+='</table>';
				}else{
					retHTML+='<button>ADD</button>';
					retHTML+='<table width="100%">';
					retHTML+='</table>';	
				}
			}else{
				retHTML+='<textarea name="'+configItem.name+'" id="mixin_window_'+configName+'"></textarea>';	
			}
			if(renderFieldset!==false){
				retHTML+='</div>';
				retHTML+='</fieldset>';
			}
			if(callback){
				callback(err, retHTML);
			}
			return retHTML;
		},
		FluxForms_ObjectToForm: function(renderTo, formId, objectDef, objectVal, callback){
			var thisNode = this;
			
			var retHTML = '<form class="form form-horizontal" id="'+formId+'">';
			retHTML+=thisNode.FluxForms_BuildObjectFields(formId, objectDef, objectVal, true);
			retHTML+='</form>';
			if(callback){
				callback(false, retHTML);
			}
			
			$(renderTo).append(retHTML);
			return $('#'+formId);
		},
		FluxForms_HasManyToForm: function(renderTo, formId, objectDef, objectVal, callback){
			var thisNode = this;
			
			return true;
		}
	}
	
	if (typeof define === 'function' && define.amd) {
		define(mixinFunctions);
	} else {
		module.exports = mixinFunctions;
	}
	return mixinFunctions;
}();
	