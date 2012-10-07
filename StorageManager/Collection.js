exports = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);
	
if (typeof define === 'function' && define.amd) {
	define(['FluxNode/util', 'EventEmitter2'], function(util, EventEmitter2) {
		var fnConstruct = CollectionBuilder(util, EventEmitter2);
		return fnConstruct;
	});		
} else {
	var util = require('util'), 
	EventEmitter2 = require('EventEmitter2').EventEmitter2;
	var fnConstruct = CollectionBuilder(util, EventEmitter2);
	exports.Collection = fnConstruct;
}

function CollectionBuilder(util, EventEmitter2){
	function Collection(cfg){
		var self = this;
		self._environment = (typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? 'nodejs' : 'browser');
		
		EventEmitter2.call({
			delimiter: '.',
			wildcard: true
		});
		
		var listeners = (cfg && cfg.listeners?cfg.listeners:false);
		if(listeners){
			for(var eventName in listeners){
				var eventListener = listeners[eventName];
				self.on(eventName, eventListener);
			}
		}
		
		self.query = {};
		self.queryHash = false;
		self.records = [];
		self.status = 'idle';
		self.stores = [];
		self.autoSync = false;
		
		if(cfg.query){
			self.setQuery(cfg.query);
		}
		
		if(cfg.stores){
			self.stores = cfg.stores;
		}
		
		if(cfg.autoSync){
			self.autoSync = cfg.autoSync;
		}
		
		if(self.autoSync===true){
			self.sync();
		}
	}
	
		util.inherits(Collection, EventEmitter2);
	
	Collection.prototype.setQuery = function(query){
		var self = this;
		
		self.query = query;
		self.queryHash = createQueryHash(query);
	}
	
	Collection.prototype.processQuery = function(callback){
		var self = this;
		if(self.stores.length>0){
			var results = [];
			
			var numStores = self.stores.length;
			var finishedStores = 0;
			for(var strIdx in self.stores){
				var store = self.stores[strIdx];
				store.find(self.query, 'master', function(err, recs){
					finishedStores++;
					results = results.concat(results, recs);
					
					if(recs.length>0){
						
						self.emit('Collection.Updated', recs);	
					}
					
					if(finishedStores==numStores){
						self.records = results;
						if(callback){
							callback(results);
						}
					}
				});
			}
		}else{
			console.log('NO STORES');
		}
	}
	
	Collection.prototype.sync = function(callback){
		var self = this;
		self.status = 'syncing';
		
		self.processQuery(function(results){
			self.status = 'idle';
			if(callback){
				callback(results);
			}
		});
	}
	
	Collection.prototype.filter = function(){
		
	}
	
	Collection.prototype.map = function(){
		
	}
	
	Collection.prototype.reduce = function(){
		
	}
	
	Collection.prototype.sort = function(){
		
	}
	
	return Collection;
}

function createQueryHash(query){
	var crypto = require('crypto');
	var queryString = query.toString();
	
	var hash = crypto.createHash('md5').update(queryString).digest("hex");
	
	return hash;
}
