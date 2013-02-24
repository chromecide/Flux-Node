var thisNode;

requirejs.onError = function(){
	console.log('ERROR');
}

function doEvent(eventName, eventParams){
	thisNode.emit(eventName, eventParams);
}

require(['FluxNode'], function(FN){ //successful load of dependencies
	FluxNode = FN;
	new FluxNode({
		listeners:{
			'Tunnel.Ready': function(destination){
				var thisNode = this;
				thisNode.ServerID = destination; //when connecting via a websocket for examples like this, we'll only ever have 1 tunnel open, which is to the server
				//now that we're connected, show the login dialog
				$('#login_window').modal();
			}
		},
		mixins:[
			{
				name: 'WebSocketTunnels/',
				options: {
					host: '10.0.0.16',
					port: 8501
				}
			}
		]
	}, function(nd){
		thisNode = nd;
		
		$('#login_error').hide();
		$('#page_content').hide();
		
		thisNode.on('Require.Error', function(err){
			if(err.id.indexOf('socket.io.js')>-1){
				alert('Could not connect to Websocket Server.  Please ensure you started the server.');
			}else{
				alert('Could not load: '+err.id);
			}
		});
		
		thisNode.on('Tunnel.Closed', function(){
			$('#page_content').html('');
			$('#main_navbar').html('');
			$('#login_window').modal('hide');
			$('#no_connection_window').modal('show');
		});
		
		thisNode.on('CP.DoLogin', function(message){
			thisNode.sendEvent(thisNode.ServerID, 'CP.DoLogin', {
				username: message.user_name,
				password: message.user_pass
			}, function(response){
				if(response.loginSuccess==true){
					$('#login_window').modal('hide');
				}else{
					$('#login_error').show();
					$('#login_window_user_pass').val('');
				}
			});
		});
		
		thisNode.on('CP.Client.UpdateNavbar', function(message, rawMessage){
			console.log(message.items);
			$('#main_nav').html('');
			liHTML = '';
			for(var i=0;i<message.items.length;i++){
				liHTML+='<li><a href="#" onclick="doEvent(\'CP.Client.ShowMixinPanelContent\', {type: \''+message.items[i].text+'\'});return false;">'+message.items[i].text+'</a></li>';
			}
			$('#main_nav').html(liHTML);
		});
		
		thisNode.on('CP.Client.ShowMixinPanelContent', function(message){
			$('#page_content').show();
			var pageHTML = '<h2>'+message.type+'</h2><br/><br/><img src="ajax-loader.gif"/>';
			
			if(message.html){
				pageHTML+=message.html;
			}
			$('#page_content').html(pageHTML);
			switch(message.type){
				case 'Mixins':
					$('#page_content').html('<div id="active_mixins"><h2>Active Mixins</h2><br/><img src="ajax-loader.gif"/></div><div id="installed_mixins"><h2>Available Mixins</h2><br/><img src="ajax-loader.gif"/></div>');
					
					/*
					 * Load the Active Mixins
					 */
					thisNode.sendEvent(thisNode.ServerID, 'FluxNode.getMixinInfo', {}, function(mixinListObject, rawMessage){
						console.log(mixinListObject);
						pageHTML = '<h2>Active Mixins</h2>';
						pageHTML+='<div class="accordion" id="active_mixins">';
						for(var key in mixinListObject){
							pageHTML+='<div class="well well-small">';
							pageHTML+='<h4 data-toggle="collapse" data-target="#mixinInfo_active_'+key+'">'+key+'</h4>';
							pageHTML+='<div id="mixinInfo_active_'+key+'" class="collapse">';
							if(mixinListObject[key].meta){
								var metaInfo = mixinListObject[key].meta;
								if(metaInfo.description){
									pageHTML+='<p class="lead">'+metaInfo.description+'</p>';
								}
								if(metaInfo.author){
									pageHTML+='<div class="row">';
									pageHTML+='<div class="span2"><strong>Author</strong></div><div class="span7">'+metaInfo.author.name;
									if(metaInfo.author.email){
										pageHTML+='&nbsp;|&nbsp;&lt;'+metaInfo.author.email+'&gt;';	
									}
									if(metaInfo.author.url){
										pageHTML+='&nbsp;|&nbsp;<a href="'+metaInfo.author.url+'" target="_blank">'+metaInfo.author.url+'</a>';	
									}
									pageHTML+='</div>';
									pageHTML+='</div>';
								}
								if(metaInfo.version){
									pageHTML+='<div class="row">';
									pageHTML+='<div class="span2"><strong>Version</strong></div><div class="span7">'+metaInfo.version+'</div>';
									pageHTML+='</div>';
								}
							}
							pageHTML+='</div>'
							pageHTML+='</div>';
						}
						$('#active_mixins').html(pageHTML);
					});
					
					/*
					 * Load the available Mixins
					 */
					thisNode.sendEvent(thisNode.ServerID, 'FluxNode.getInstalledMixins', {}, function(mixinList, rawMessage){
						thisNode.RemoteAvailableMixinList = mixinList;
						pageHTML = '<h2>Available Mixins</h2>';
						pageHTML+='<div class="accordion" id="active_mixins">';
						for(var mixinIdx=0;mixinIdx<mixinList.length;mixinIdx++){
							var metaInfo = mixinList[mixinIdx];
							
							pageHTML+='<div class="well well-small">'; //Start Mixin Well
							pageHTML+='<h4 data-toggle="collapse" data-target="#mixinInfo_available_'+metaInfo.name+'">'+metaInfo.name+'</h4>';
							pageHTML+='<div id="mixinInfo_available_'+metaInfo.name+'" class="collapse">'; //Start Collapse
								pageHTML+'<div class="row">'; // Start Mixin Panel
									pageHTML+='<div class="span10">'; //Start Info Panel
										if(metaInfo.description){
											pageHTML+='<p class="lead">'+metaInfo.description+'</p>';
										}
										if(metaInfo.author){
											pageHTML+='<div class="row">';
											pageHTML+='<div class="span2"><strong>Author</strong></div><div class="span8">'+metaInfo.author.name;
											if(metaInfo.author.email){
												pageHTML+='&nbsp;|&nbsp;&lt;'+metaInfo.author.email+'&gt;';	
											}
											if(metaInfo.author.url){
												pageHTML+='&nbsp;|&nbsp;<a href="'+metaInfo.author.url+'" target="_blank">'+metaInfo.author.url+'</a>';	
											}
											pageHTML+='</div>';
											pageHTML+='</div>';
										}
										if(metaInfo.version){
											pageHTML+='<div class="row">';
											pageHTML+='<div class="span2"><strong>Version</strong></div><div class="span8">'+metaInfo.version+'</div>';
											pageHTML+='</div>';
										}
										
										if(metaInfo.config || metaInfo.cfg){
											var configInfo = metaInfo.config?metaInfo.config:metaInfo.cfg;
											
											pageHTML+='<h5 data-toggle="collapse" data-target="#configInfo_'+metaInfo.name+'">Config Options</h5>'
											pageHTML+='<div class="collapse in" id="configInfo_'+metaInfo.name+'">';
											
											for(var configName in configInfo){
												var configItemInfo = configInfo[configName];
												pageHTML+='<div class="row">';
												pageHTML+='<div class="span3">'+configItemInfo.name+'</div>';
												pageHTML+='<div class="span7">'+configItemInfo.description+'</div>';
												pageHTML+='</div>'
											}
											pageHTML+='</div>';
										}
										
										if(metaInfo.events){
											pageHTML+='<h5 data-toggle="collapse" data-target="#eventInfo_'+metaInfo.name+'">Events</h5>'
											pageHTML+='<div class="collapse in" id="eventInfo_'+metaInfo.name+'">';
											for(var eventName in metaInfo.events){
												var eventInfo = metaInfo.events[eventName];
												pageHTML+='<div class="row">';
												pageHTML+='<div class="span3">'+eventInfo.name+'</div>';
												pageHTML+='<div class="span7">'+eventInfo.description+'</div>';
												pageHTML+='</div>'
											}
											pageHTML+='</div>';
										}
										
										if(metaInfo.listeners){
											pageHTML+='<h5 data-toggle="collapse" data-target="#listenerInfo_'+metaInfo.name+'">Listeners</h5>'
											pageHTML+='<div class="collapse in" id="listenerInfo_'+metaInfo.name+'">';
											for(var listenerName in metaInfo.listeners){
												var listenerInfo = metaInfo.listeners[listenerName];
												pageHTML+='<div class="row">';
												pageHTML+='<div class="span3">'+listenerInfo.name+'</div>';
												pageHTML+='<div class="span3">'+listenerInfo.description+'</div>';
												pageHTML+='</div>'
											}
											pageHTML+='</div>';
										}
									pageHTML+='</div>'; //End Info Panel
									pageHTML+='<div class="span1">'; //Start Install Button panel
									pageHTML+='<button class="btn btn-success" onclick="doEvent(\'CP.Client.ShowAddMixinWindow\', {name: \''+metaInfo.name+'\'});return false;">Mix It!</button>';
									pageHTML+='</div>'; //End Install Button panel
								pageHTML+='</div>'; //End Mixin Panel
							pageHTML+='</div>'; //End Collapse
							pageHTML+='</div>'; //End Mixin Well
						}
						
						$('#installed_mixins').html(pageHTML);
					});	
					break;
					
				case 'Settings':
					thisNode.sendEvent(thisNode.ServerID, 'FluxNode.getSettingInfo', {}, function(settingListObject, rawMessage){
						console.log(settingListObject);
						pageHTML='<h2>Server Control</h2>';
						pageHTML+='<div class="well well-small">';
						pageHTML+='<p>';
						pageHTML+='<button class="btn btn-large btn-primary" type="button" id="saveConfigButton">Save Configuration</button>';
						pageHTML+='&nbsp;<button class="btn btn-large btn-warning" type="button">Restart</button>';
						pageHTML+='&nbsp;<button class="btn btn-large btn-danger" type="button">Stop</button>';
						pageHTML+='</p>';
						pageHTML+='</div>';
						pageHTML+= '<h2>Settings</h2>';
						for(var key in settingListObject){
							pageHTML+='<div  class="well well-small">';
							pageHTML+='<form class="form-horizontal">';
							pageHTML+='<h4 data-toggle="collapse" data-target="#mixinSettings_'+key+'">'+key+'</h4>';
							pageHTML+='<div class="collapse" id="mixinSettings_'+key+'">';
							if(settingListObject[key].object){
								pageHTML+=createObjectEditor(settingListObject[key].object);
							}
							pageHTML+='<button class="btn btn-success" type="button" id="saveSettings_'+key+'">Save</button>';
							pageHTML+='</form>';
							pageHTML+='</div>';
							/*if(settingListObject[key].params){
								for(var paramKey in settingListObject[key].params){
									//pageHTML+=paramKey+':'+settingListObject[key].params[paramKey].toString()+'<br/>';
								}
							}*/
							pageHTML+='</div>';
						}
						$('#page_content').html(pageHTML);
						$('#saveConfigButton').click(function(){
							doEvent('CP.DoSaveConfiguration', {});
						});
					});	
					break;
			}
			
		});

		thisNode.on('CP.Client.ShowAddMixinWindow', function(message){
			var selectedMixin = false;
			for(var i=0;i<thisNode.RemoteAvailableMixinList.length;i++){
				if(thisNode.RemoteAvailableMixinList[i].name==message.name){
					selectedMixin = thisNode.RemoteAvailableMixinList[i];
				}
			}
			var windowHTML = '<div class="modal hide fade" id="add_mixin_'+selectedMixin.name+'">';
	    	windowHTML+='<div class="modal-header">';
	    	windowHTML+='	<h3>Mixin: '+selectedMixin.name+'</h3>';
	    	windowHTML+='</div>';
	    	windowHTML+='<div class="modal-body">';
	    	windowHTML+='	<div class="error-labal" id="mixin_error_'+selectedMixin.name+'">Mixing Failed.</div>';
	    	var configInfo = selectedMixin.config;
	    	windowHTML+='<form class="form-horizontal">';
	    	for(var configName in configInfo){
	    		var configItem = configInfo[configName];
	    		
	    		if(configItem.validators){
	    			if(configItem.validators.string){
	    				windowHTML+='<div class="control-group">';
	    				windowHTML+='<label class="control-label" for="'+configName+'">'+configName+': </label>';
	    				windowHTML+='<div class="controls">';
	    				windowHTML+='<input type="text" name="'+configName+'" id="mixin_window_'+configName+'"/>';
	    				windowHTML+='</div>';
	    				windowHTML+='</div>';
	    			}
	    			
	    			if(configItem.validators.boolean){
	    				windowHTML+='<div class="control-group">';
	    				windowHTML+='<label class="control-label" for="'+configName+'">'+configName+': </label>';
	    				windowHTML+='<div class="controls">';
	    				windowHTML+='<input type="checkbox" name="'+configName+'" id="mixin_window_'+configName+'"/>';
	    				windowHTML+='</div>';
	    				windowHTML+='</div>';
	    			}
	    			
	    			if(configItem.validators.date){
	    				windowHTML+='<div class="control-group">';
	    				windowHTML+='<label class="control-label" for="'+configName+'">'+configName+': </label>';
	    				windowHTML+='<div class="controls">';
	    				windowHTML+='<input type="text" name="'+configName+'" id="mixin_window_'+configName+'"/>';
	    				windowHTML+='</div>';
	    				windowHTML+='</div>';
	    			}
	    			
	    			if(configItem.validators.number){
	    				windowHTML+='<div class="control-group">';
	    				windowHTML+='<label class="control-label" for="'+configName+'">'+configName+': </label>';
	    				windowHTML+='<div class="controls">';
	    				windowHTML+='<input type="text" name="'+configName+'" id="mixin_window_'+configName+'"/>';
	    				windowHTML+='</div>';
	    				windowHTML+='</div>';
	    			}
	    			
	    			if(configItem.validators.hasMany){
	    				//need the ability to add multiple items
	    				windowHTML+=createHasManyEditor(configItem);
	    			}
	    			
	    			if(configItem.validators.object){
	    				//need the ability to edit Objects
	    				windowHTML+='<textarea name="'+configItem.name+'" id="mixin_window_'+configName+'"></textarea>';
	    			}
	    		}else{ // no validators were supplied, so the value could be anything
	    			windowHTML+='<textarea name="'+configItem.name+'" id="mixin_window_'+configName+'"></textarea>';
	    		}
	    		
	    	}
	    	windowHTML+='</form>';
	    		//<label for="user_name">User Name: </label><input type="text" name="user_name" id="login_window_user_name"/>
	    		//<label for="user_pass">Password: </label><input type="password" name="user_pass" id="login_window_user_pass"/>
	    	windowHTML+='</div>';
	    	windowHTML+='<div class="modal-footer">'
	    	windowHTML+='	<a href="#" class="btn btn-primary" onclick="doEvent(\'CP.DoMixin\', {name: \''+selectedMixin.name+'\'})">Mix It!</a>';
	    	windowHTML+='</div>';
	    	windowHTML+='</div>';
	    	
	    	$('body').append(windowHTML);
	    	$('#mixin_error_'+selectedMixin.name).hide();
	    	$('#add_mixin_'+selectedMixin.name).modal();
		});
		
		thisNode.on('CP.DoMixin', function(message){
			
			var selectedMixin = false;
			for(var i=0;i<thisNode.RemoteAvailableMixinList.length;i++){
				if(thisNode.RemoteAvailableMixinList[i].name==message.name){
					selectedMixin = thisNode.RemoteAvailableMixinList[i];
				}
			}
			
			//collect the configuration values from the form
			var configInfo = selectedMixin.config;
			
			var mixinParams = {
				name: selectedMixin.name,
				options:{}
			}
			
			if(configInfo){
				for(var configName in configInfo){
					var configItem = configInfo[configName];
					var configField = $('#mixin_window_'+configItem.name);
					
					if(configField && configField.val()){
						var value = configField.val();
						if(configItem.validators){
							if(configItem.validators.hasMany || configItem.validators.object){
								console.log(value);
								value = JSON.parse(value);
							}
						}
						mixinParams.options[configName] = value;
					}
				}
			}
			console.log(mixinParams);
			
			$('#add_mixin_'+selectedMixin.name).modal('hide');
			thisNode.sendEvent(thisNode.ServerID, 'FluxNode.Mixin', mixinParams, function(){
				thisNode.emit('CP.Client.ShowMixinPanelContent', {type: 'Mixins'});
			})
		});
	
		thisNode.on('CP.DoSaveConfiguration', function(message){
			var path = prompt('Please enter the server path name');
			var cfg = {
				path: path
			}
			
			thisNode.sendEvent(thisNode.ServerID, 'CP.SaveConfiguration', cfg);
		});
	});	
	
});
	
function createHasManyEditor(field){
	var fieldConfig = field.validators.hasMany;
	
	var configName = field.name;
	var retHTML = '';
	retHTML+='<fieldset>';
	retHTML+='<legend>'+configName+'</legend>';
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
			retHTML+= createObjectEditor(fieldConfig.validators.object);
			retHTML+='<button>ADD</button>';
			retHTML+='<table  class="table table-striped" width="100%">';
			retHTML+='<tr>';
			for(var fieldName in fieldConfig.validators.object.fields){
				retHTML+='<th>'+fieldName+'</th>';
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
	
	retHTML+='</fieldset>';
	return retHTML;
}

function createObjectEditor(field){
	var configName = 'blah';
	var retHTML='';
	if(field.fields){
		for(var fieldName in field.fields){
			retHTML+='<div class="control-group">';
			retHTML+='<label class="control-label" for="mixinSettng_'+fieldName+'">'+fieldName+'</label>';
			retHTML+='<div class="controls">';
			retHTML+='<input type="text" name="mixinSettng_'+fieldName+'">';
			retHTML+='</div>';
			retHTML+='</div>';
		}
	}
	
	return retHTML;
}
