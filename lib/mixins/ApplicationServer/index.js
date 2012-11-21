var fs = require('fs');
var path = require('path');

var mixinFunctions = {
	ApplicationServer_Settings:{
		appPath: __dirname+'/apps',
		applications: {
			
		}
	},
	init: function(cfg, callback){
		var thisNode = this;
		//add properties that are needed by this mixin
	
		//add Events that are emitted by this mixin
		
		thisNode.on('ApplicationServer.CreateApplication', function(message, rawMessage){
			thisNode.ApplicationServer_SeedApplication(message, rawMessage);
		});
		
		//should be called when the mixin is actually ready, not simp;y at the end of the init function
		if(cfg){
			thisNode.ApplicationServer_Configure(cfg, function(){
				thisNode.emit('Mixin.Ready', {
					name: 'ApplicationServer'
				});
				
				if(callback){
					callback(thisNode);
				}		
			});
		}else{
			thisNode.emit('Mixin.Ready', {
				name: 'ApplicationServer'
			});
			
			if(callback){
				callback(thisNode);
			}
		}
		
	},
	ApplicationServer_Configure: function(cfg, callback){
		var thisNode = this;
		 
		if(cfg.path){
			thisNode.ApplicationServer_Settings.appPath = cfg.path;	
		}
	},
	ApplicationServer_getAppList: function(message, rawMessage, callback){
		if(typeof(message)=='function'){
			callback = message;
			message = {};
			rawMessage = {};
		}
		
		if((typeof rawMessage)=='function'){
			callback = rawMessage;
			rawMessage = {};
		}
		
		var thisNode = this;
		if(fs.existsSync(thisNode.ApplicationServer_Settings.appPath)){
			//load the list
			fs.readDir(thisNode.ApplicationServer_Settings.appPath, function(err, fileList){
				console.log(fileList);
			});
		}else{
			if(callback){
				callback(false, []);
			}
		}
	},
	ApplicationServer_SeedApplication: function(message){
		var thisNode = this;
		
		var appName = message.name;
		var appAuthor = message.author;
		var appVersion = message.version;
		var appDescription = message.description;
		
		var packageJSON = {
			"name": appName,
			"author": appAuthor,
			"appVersion": appVersion,
			"appDescription": appDescription
		};
		
		//create the application folder
		fs.mkdirSync(thisNode.ApplicationServer_Settings.appPath);
		//create the index.js file with seed code
		
		//create the package.json file
		
	},
	ApplicationServer_SaveApplication: function(message){
		
	},
	ApplicationServer_StartApplication: function(){
		
	},
	ApplicationServer_StopApplication: function(){
		
	},
	ApplicationServer_RestartApplication: function(){
		
	}
}

if (typeof define === 'function' && define.amd) {
	define(mixinFunctions);
} else {
	module.exports = mixinFunctions;
}
	