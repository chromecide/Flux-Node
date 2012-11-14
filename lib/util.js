;!function(exports, undefined){
var util = {
	inherits: function(ctor, superCtor) {
	  ctor.super_ = superCtor;
	  ctor.prototype = Object.create(superCtor.prototype, {
	    constructor: {
	      value: ctor,
	      enumerable: false,
	      writable: true,
	      configurable: true
	    }
	  });
	},
	extend: function(obj, superObj){
		for(var key in superObj){
			if((typeof superObj[key])=='function'){
				var objFunc = obj[key];
				if(!obj._extended){
					obj._extended = {};
				}
				obj._extended[key] = objFunc;	
			}
			obj[key] = superObj[key];
		}
	}
}

if (typeof define === 'function' && define.amd) {
	define(function() {
		return util;
	});
} else {
	exports.util = util;
}
}(typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);	