;!function(exports, undefined) {
	var fs = require('fs');
	var EventEmitter2 = require('EventEmitter2').EventEmitter2;
	var util = require('util');
	
	var channelTypes = {};
	
	var fileList = fs.readdirSync(__dirname+'/channels/');
	for(var i=0;i<fileList.length;i++){
		var chanType = require(__dirname+'/channels/'+fileList[i]).Channel;
		channelTypes[chanType.name] = chanType;
	}
	
	var entity = require(__dirname+'/entity').Entity;
	var modelCtr = require(__dirname+'/model').Model;
	
	function channel(name, type, model, callback){
		this.Entity = this._Entity = entity;
		this._Model = modelCtr;
		
		this.Models = {
			Command: new this._Model({
				name: 'Command',
				fields: [
					{
						name: 'action',
						label: 'Action',
						required: true,
						type: 'Text'
					},
					{
						name: 'entity',
						label: 'entity',
						type: 'Entity',
						required: true
					}
				]
			}),
		}
		
		if((typeof model)=='function'){
			callback = model;
			model = false;
		}
		
		if((typeof type)=='function'){
			callback = type;
			model = false;
			type = false;
		}
		
		this.name = name;
		
		if(!type){
			type='Memory';
		}
		
		var typeOptions = {};
		
		if((typeof type)=='object'){
			typeOptions = type;
			type = typeOptions.type;
		}
		
		this.type = type===undefined?'Memory':type;
		this.model = model===undefined?false: model;
		
		if(channelTypes[this.type]){
			var chanType = channelTypes[this.type];
			
			for(var key in chanType){
				this[key] = chanType[key];
			}
		}
		
		if(typeOptions!={}){
			for(var key in typeOptions){
				this[key] = typeOptions[key];
			}
		}
		
		EventEmitter2.apply(this, arguments);
		
		this.init(callback);
	}
	
		util.inherits(channel, EventEmitter2);
	
		channel.prototype.init = function(callback){
			if(callback){
				callback(this);
			}
		}
	
		channel.prototype.instance = function(data){
			return new entity(this.model, data);
		}
		
		channel.prototype.publish = function(data){
			
		}
		
		channel.prototype.subscribe = function(){
			
		}
		
		//get the value of a channel setting
		channel.prototype.get = function(name){
			if(name){
				return this[name];	
			}else{
				return this;	
			}
		}
		
		
		//set the value of a channel setting
		channel.prototype.set = function(name, value){
			if(value==undefined){
				value = name;
				name = false;
			}
			
			if(name){
				this[name] = value;
			}else{
				if((typeof value)=='object'){
					for(var key in value){
						this[key] = value[key];
					}
				}else{
					throw new Error('Invalid Value for set: '+__filename);
				}
			}
			
		}
		
		
		channel.prototype.setType = function(model){
			this.model = model
		}
		
		channel.prototype.getType = function(){
			return this.model;
		}
	
		channel.prototype.create = function(entity){
			
		}
		
		channel.prototype.save = function(entity){
			
		}
		
		channel.prototype.delete = function(entity){
			
		}
		
		channel.prototype.find = function(query){
			
		}
		
		channel.prototype.findOne = function(query){
			
		}
		
	if (typeof define === 'function' && define.amd) {
		define(function() {
			return channel;
		});
	} else {
		exports.Channel = channel;
	}
}(typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);