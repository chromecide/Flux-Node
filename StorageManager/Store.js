exports = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);
	
if (typeof define === 'function' && define.amd) {
	define(['FluxNode/util', 'EventEmitter2'], function(util, EventEmitter2) {
		var fnConstruct = StoreBuilder(util, EventEmitter2);
		return fnConstruct;
	});		
} else {
	var util = require('util'), 
	EventEmitter2 = require('EventEmitter2').EventEmitter2;
	var fnConstruct = StoreBuilder(util, EventEmitter2);
	exports.Store = fnConstruct;
}

function StoreBuilder(util, EventEmitter2){

	function Store(){
		var self = this;
		self._environment = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? 'nodejs' : 'browser');
	}
	
	Store.prototype.generateID = function(){
		var newID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		    return v.toString(16);
		});
		return newID;
	}
	
	function save(record){
		return false;
	}
	
	function find(query){
		return false;
	}
	
	function findOne(query){
		return false;
	}
	
	function remove(query){
		return false;
	}
	
	return Store;
}