var mixinFunctions = {
	init: function(cfg){
		var self = this;
		//add properties that are needed by this mixin
		self.UserProfile = {
			Avatar: cfg&&cfg.Avatar?cfg.Avatar:'',
			DisplayName: cfg&&cfg.DisplayName?cfg.DisplayName:'',
			Email: [
				'chromecide@chromecide.com'
			]
		};
		//add Events that are emitted by this mixin
		
	}
}

if (typeof define === 'function' && define.amd) {
	define(mixinFunctions);
} else {
	module.exports = mixinFunctions;
}
	