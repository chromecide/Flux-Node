var FluxNode = require('../FluxNode_0.0.1');
var mixinFunctions = {
	init: function(){
		var self = this;
		//add properties that are needed by this mixin
	
		//add Events that are emitted by this mixin
		
	},
	registerChildNode: function(nd){
		var parentNode = this;
		var tunnelDef = parentNode.TunnelManager.factory('IntraProcessNode').Tunnel;
		var childTunnel = new tunnelDef();
		childTunnel.setChildNode(nd);
		childTunnel.setParentNode(nd);
		parentNode.TunnelManager.registerTunnel(nd.id, childTunnel);
		nd.TunnelManager.registerTunnel(parentNode.id, childTunnel);
		parentNode.doCallback(arguments);
		return true;
	}
}

if (typeof define === 'function' && define.amd) {
	define(mixinFunctions);
} else {
	module.exports = mixinFunctions;
}
	