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