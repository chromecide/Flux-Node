;!function(){
	function mixin(viewport, navbar, windowComp, cDialog, cPanel, cForm){
		var mixinFunctions = {
			init: function(cfg, callback){
				var thisNode = this;
				
				thisNode.FluxBase = {
					components:{
						Viewport: viewport,
						Navbar: navbar,
						Window: windowComp,
						Panel: cPanel,
						Dialog: cDialog,
						Form: cForm
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
				var dialog;
					
				if(!thisNode.FluxBase.Dialogs){
					thisNode.FluxBase.Dialogs = {};
				}
				
				if(!thisNode.FluxBase.Dialogs['FluxBaseLoginWindow']){
					dialog = new this.FluxBase.components.Dialog(thisNode, {
						id: 'FluxBaseLoginWindow',
						title: 'Login',
						closeable: false,
						content:'Loading...',
						buttons:[
							{
								text: 'Cancel',
								eventName: 'LoginWindow.CancelButton.Clicked',
								buttonStyle: 'btn',
								eventParams: {}
							},
							{
								text: 'Login',
								eventName: 'LoginWindow.LoginButton.Clicked',
								buttonStyle: 'btn btn-primary',
								eventParams: {}
							}
						]
					});
					
					thisNode.FluxBase.Dialogs['FluxBaseLoginWindow'] = dialog;
				}else{
					dialog = thisNode.FluxBase.Dialogs['FluxBaseLoginWindow'];
				}
				
				var fields = thisNode.FluxBase_BuildObjectFields('FluxBase_LoginForm', {
					validators: {
						object:{
							fields:{
								username: {
									name: 'User Name',
									validators:{
										string:{},
										required: {}
									}
								},
								password: {
									name: 'Password',
									validators:{
										string:{},
										required:{},
										password:{}
									}
								}/*,
								RememberMe: {
									name: 'Remember Me',
									validators:{
										boolean:{}
									}
								}*/	
							}
						}
					}
				}, {});
				
				var frm = new thisNode.FluxBase.components.Form(
					thisNode, 
					{
						id: 'FluxBase_LoginForm', 
						renderTo: 'FluxBaseLoginWindow_Content',
						items: fields
					}
				);
				
				frm.setValues({Test:{Item1: 'testeroni'}});
				
				thisNode.once('LoginWindow.CancelButton.Clicked', function(params){
					dialog.hide();
				});
				
				function submitFluxForm(params){
					if(frm.isValid()){
						thisNode.emit('FluxBase.LoginForm.submitted', frm.getValues());
						dialog.hide();	
					}else{
						thisNode.once('LoginWindow.LoginButton.Clicked', submitFluxForm);
					}
				}
				
				thisNode.once('LoginWindow.LoginButton.Clicked', submitFluxForm);
				
				thisNode.FluxBase.Dialogs['FluxBaseLoginWindow'].show();
			},
			FluxBase_BuildObjectFields: function(formId, objectDef, objectVal, renderFieldset, callback){
				var thisNode = this;
				var retHTML='';
				if(renderFieldset!==false){
					retHTML+='<fieldset>';
					retHTML+='<legend data-toggle="collapse" data-target="#'+formId+'_object_collapse">'+objectDef.name+'</legend>';
					retHTML+= '<div  class="collapse" id="'+formId+'_object_collapse">';
				}
				
				var fieldCfg = [
					
				];
				
				var field = objectDef.validators.object;
				if(field.fields){
					for(var fieldName in field.fields){
						var fieldItem = field.fields[fieldName];
						console.log(fieldItem);
						var fieldRendered = false;
						if(!fieldItem.validators || fieldItem.validators.string || fieldItem.validators.number || fieldItem.validators.password){
							var itemCfg = {
								type: 'text',
								id: formId+'_'+fieldName,
								name: fieldName,
								label: fieldItem.name,
								value: objectVal?objectVal[fieldName]: '',
								required: fieldItem.validators.required?true:false,
								placeHolder: '',
								invalid: false
							}
							
							if(fieldItem.validators.password){
								itemCfg.type = 'password';
							}
							
							fieldCfg.push(itemCfg);
						}else{
							if(fieldItem.validators.object){
								var itemCfg = {
									type: 'fieldset',
									id: formId+'_'+fieldName,
									name: fieldName,
									label: fieldItem.name,
									items: thisNode.FluxBase_BuildObjectFields(formId+'_'+fieldName, fieldItem, (objectVal?objectVal[fieldName]:''), false),
									placeHolder: '',
									invalid: false
								}
								fieldCfg.push(itemCfg);
							}else{
								if(fieldItem.validators.hasMany){
									retHTML+=thisNode.FluxBase_BuildHasManyFields(formId+'_'+fieldName, fieldItem, (objectVal?objectVal[fieldName]:''), false);
								}else{
									if(fieldItem.validators.boolean){
										var itemCfg = {
											type: 'checkbox',
											id: formId+'_'+fieldName,
											name: fieldName,
											label: fieldItem.name,
											value: objectVal?objectVal[fieldName]:'',
											placeHolder: '',
											invalid: false
										}
										fieldCfg.push(itemCfg);
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
				}
				if(renderFieldset!==false){
					retHTML+='</div>';
					retHTML+='</fieldset>';
				}
				if(callback){
					callback(retHTML);
				}
				
				return fieldCfg;
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
		define(['lib/mixins/FluxBase/lib/viewport', 'lib/mixins/FluxBase/lib/navbar', 'lib/mixins/FluxBase/lib/window', 'lib/mixins/FluxBase/lib/dialog', 'lib/mixins/FluxBase/lib/panel', 'lib/mixins/FluxBase/lib/form'], mixin);
	} else {
		module.exports = mixinFunctions;
	}
}();
	