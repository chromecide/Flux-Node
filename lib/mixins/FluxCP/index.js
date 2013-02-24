var fs = require('fs');
var path = require('path');

var mixinFunctions = {
	init: function(cfg, callback){
		var thisNode = this;
		var defUserName = 'admin';
		var defUserPass = 'admin';
		//add properties that are needed by this mixin
	
		//add Events that are emitted by this mixin
		if(!cfg){
			cfg = {};
		}
		
		if(cfg.username){
			defUserName = cfg.username;
		}
		
		if(cfg.password){
			defUserPass = cfg.password;
		}
		
		if(!thisNode.getSetting('CP.User.username')){
			thisNode.setSetting('CP.User', {
				username: defUserName,
				password: defUserPass
			});	
		}
		
		thisNode.mixin('debug', {events:true});
		//first we need to make sure the webserver mixin has been added
		
		thisNode.mixin('webserver', {
			webroot: __dirname+'/webroot',
			port: 8500,
			autoStart: true
		}, function(){
			thisNode.mixin('WebsocketTunnels', {
				port: 8501
			}, function(){
				var mixinReturn = {
					name: 'CP',
					meta: require(__dirname+'/package.json'),
					config: cfg
				}
				if(callback){
					callback(false, mixinReturn);
				}
				
				thisNode.emit('Mixin.Ready', mixinReturn);
			});	
		});
		
		//should be called when the mixin is actually ready, not simp;y at the end of the init function
		thisNode.on('CP.DoLogin', thisNode.CP_processLogin);
		
		thisNode.on('CP.SaveConfiguration', thisNode.CP_SaveConfiguration);
	},
	CP_processLogin: function(message, rawMessage){
		var thisNode = this;
		var user = thisNode.getSetting('CP.User');
		
		var authed = false;
		
		if(user.username==message.username && user.password==message.password){
			authed = true;
		}
		
		thisNode.sendEvent(
			rawMessage._message.sender, 
			authed?'CP.LoginSuccess':'CP.LoginFailed',
			{
				loginSuccess: authed
			},
			rawMessage._message.id
		);
		
		if(authed){
			//send the navigation items for this user
			thisNode.sendEvent(
				rawMessage._message.sender,
				'CP.Client.UpdateNavbar',
				{
					items:[
						{
							text: 'Mixins'
						},
						{
							text: 'Stores'
						},
						{
							text: 'Tunnels'
						},
						{
							text: 'Settings'
						}
					]
				}
			)
		}
	},
	CP_SaveConfiguration: function(message, rawMessage){
		var thisNode = this;
		var savePath = message.path;
		
		var fileContents = '';
		var pathToFlux = path.resolve(savePath, __dirname+'/../../../')+'/FluxNode.js';
		fileContents +='var FluxNode = require("'+pathToFlux+'").FluxNode;\n\n';
		var mixinInfo = thisNode._mixins;
		var mixinConfig = [];
		for(var mixinName in mixinInfo){
			mixinConfig.push({
				name: mixinName,
				options: mixinInfo[mixinName] && mixinInfo[mixinName].config?mixinInfo[mixinName].config:{}
			});
		}
		
		var saveNodeConfig = {
			id: thisNode.id,
			settings: thisNode.getSettings(),
			mixins: mixinConfig
		};
		
		fileContents += 'new FluxNode('+JSON.stringify(saveNodeConfig, null, 4)+', function(thisNode){\n';
		fileContents += '});'
		
		console.log(fileContents);
		
		fs.writeFile(savePath, fileContents, function(){
			console.log(arguments);
		});
	}
}

if (typeof define === 'function' && define.amd) {
	define(mixinFunctions);
} else {
	module.exports = mixinFunctions;
}
	