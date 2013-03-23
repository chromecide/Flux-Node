;!function(){
	function mixin(viewport, navbar, windowComp){
		var mixinFunctions = {
			init: function(cfg, callback){
				var thisNode = this;
				
				thisNode.FluxBase = {
					components:{
						Viewport: viewport,
						Navbar: navbar,
						Window: windowComp
					},
					viewports: {
						
					},
					windows:{
						
					}
				}
				
				//add properties that are needed by this mixin
				thisNode.addSetting('FluxBase',{
					viewportSelector: 'body',
					loginEventName: 'BasicSecurity.DoLogin'
				},
				{
					object:{
						fields:{
							viewportSelector: {
								name: 'Viewport Selector',
								validators: {
									string:{}
								}
							},
							loginEventName: {
								name: 'Login Event Name',
								description: 'The name of the event to use when the user clicks the login button',
								validators:{
									string:{}
								}
							}
						}
					}
				});
				//add Events that are emitted by this mixin
				
				//add listeners
				
				$(document).ready(function(){
					
					thisNode.FluxBase_RenderViewport();
				});
				//should be called when the mixin is actually ready, not simp;y at the end of the init function
				var mixinReturn = {
					name: 'FluxBase',
					config: cfg
				}
				
				if(callback){
					callback(mixinReturn);
				}
				
				thisNode.emit('Mixin.Ready', mixinReturn);
			},
			FluxBase_RenderViewport: function(renderTo){
				var thisNode = this;
				var viewportContainer = $(thisNode.getSetting('FluxBase.viewportSelector'));
				
				var viewport = new thisNode.FluxBase.components.Viewport(thisNode, {
					renderTo: viewportContainer,
					id: 'FluxBase_Viewport'
				});
				
				viewport.render(function(vp){
					thisNode.FluxBase.viewports[vp.id] = vp;
					thisNode.emit('FluxBase.Viewport.Ready', vp);
					
				});
				
				return true;
			},
			FluxBase_getViewport: function(vpId, callback){
				var thisNode = this;
				if((typeof vpId)=='function'){
					callback = vpId;
					vpId = false;
				}
				
				if(!vpId){ //return the active viewport
					if(!thisNode.FluxBase.viewports._active){
						thisNode.FluxBase.viewports._active = thisNode.FluxBase.viewports.FluxBase_Viewport;
					}
					
					if(callback){
						callback(false, thisNode.FluxBase.viewports._active);
					}
					
					return thisNode.FluxBase.viewports._active;
				}else{
					if(callback){
						callback(false, thisNode.FluxBase.viewports[vpId]);
					}
					
					return thisNode.FluxBase.viewports[vpId];
				}
				
			},
			FluxBase_ShowWindow: function(windowCfg){
				var thisNode = this;
				var windowId = windowCfg.id;
				
				if(thisNode.FluxBase.windows[windowId]){
					thisNode.FluxBase.windows[windowId].show();
				}else{
					var newWindow = new thisNode.FluxBase.components.Window(thisNode, windowCfg);
					
					thisNode.FluxBase.windows[newWindow.id] = newWindow;
					newWindow.render(function(){
						newWindow.show();
					});
				}
				return true;
			},
			FluxBase_ShowLoginWindow: function(){
				var thisNode = this;
				var windowContent = '';
				windowContent+='<div class="alert alert-error hide" id="FluxBase_LoginWindowError">';
    			windowContent+='Invalid Username or Password.  Please try again.';
    			windowContent+='</div>';
	    		windowContent+='<label for="user_name">User Name: </label><input type="text" name="user_name" id="login_window_user_name"/>';
	    		windowContent+='<label for="user_pass">Password: </label><input type="password" name="user_pass" id="login_window_user_pass"/>';
	    		
				thisNode.FluxBase_ShowWindow({
					id: 'FluxBase_LoginWindow',
					title: 'Login',
					content: windowContent,
					buttons:[
						{
							id: 'FluxBase_LoginWindow_CancelButton',
							text: 'Cancel',
							click: function(){
								$('#FluxBase_LoginWindow').modal('hide');
							}
						},
						{
							id: 'FluxBase_LoginWindow_LoginButton',
							text: 'Login',
							click: function(){
								var params = {
									username: $('#login_window_user_name').val(),
									password: $('#login_window_user_pass').val(),
								};
								
								thisNode.sendEvent(
									thisNode.ServerID, 
									thisNode.getSetting('FluxBase.loginEventName'), 
									params, 
									function(response){
										$('#login_window_user_pass').val('');
										if(response.success==true){
											$('#login_window_user_pass').val('');
											$('#FluxBase_LoginWindow').modal('hide');
										}else{
											$('#FluxBase_LoginWindowError').show().alert();
										}
									}
								);
							}
						}
					]
				});
			},
			FluxBase_BuildObjectFields: function(formId, objectDef, objectVal, renderFieldset, callback){
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
								retHTML+='<label class="control-label" for="'+formId+'_'+fieldName+'">'+fieldName+'</label>';
								retHTML+='<div class="controls">';
								retHTML+=thisNode.FluxBase_BuildObjectFields(formId+'_'+fieldName, fieldItem, (objectVal?objectVal[fieldName]:''), false);
								retHTML+='</div>';
								retHTML+='</div>';
							}else{
								if(fieldItem.validators.hasMany){
									retHTML+=thisNode.FluxBase_BuildHasManyFields(formId+'_'+fieldName, fieldItem, (objectVal?objectVal[fieldName]:''), false);
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
			FluxBase_BuildHasManyFields: function(formId, objectDef, objectVal, renderFieldset, callback){
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
						retHTML+='<div class="control-group">';
						retHTML+='<label class="control-label" for="'+configName+'">'+configName+': </label>';
						retHTML+='<div class="controls">';
						retHTML+= thisNode.FluxBase_BuildObjectFields(formId+'_new_'+configName.replace(/ /g,'_'), fieldConfig, objectVal?objectVal[configName]:'', false);
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
						retHTML+='</div>';
						retHTML+='</div>';
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
			FluxBase_ObjectToForm: function(renderTo, formId, objectDef, objectVal, callback){
				var thisNode = this;
				
				var retHTML = '<form class="form form-horizontal" id="'+formId+'">';
				retHTML+=thisNode.FluxBase_BuildObjectFields(formId, objectDef, objectVal, true);
				retHTML+='</form>';
				if(callback){
					callback(false, retHTML);
				}
				
				$(renderTo).append(retHTML);
				return $('#'+formId);
			},
			FluxBase_HasManyToForm: function(renderTo, formId, objectDef, objectVal, callback){
				var thisNode = this;
				
				return true;
			}
		}
		
		return mixinFunctions;	
	}
	
	
	if (typeof define === 'function' && define.amd) {
		define(['lib/mixins/FluxBase/lib/viewport', 'lib/mixins/FluxBase/lib/navbar', 'lib/mixins/FluxBase/lib/window'], mixin);
	} else {
		module.exports = mixinFunctions;
	}
}();
	