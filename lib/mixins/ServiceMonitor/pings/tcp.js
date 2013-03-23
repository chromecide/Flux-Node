;!function(exports, undefined) {
	var net = require('net');
	
	function ping(cfg, callback){
		var url = cfg.url;
		
		var startTime = new Date();
		var endTime = false;
		
		var client = net.createConnection(cfg.port, cfg.host).on("connect", function(e) {
		    endTime = new Date();
			var pingTime = endTime-startTime;
			client.end(); //all we needed to see is if a connection could be made
			callback(false, {
				running: true,
				ping: pingTime
			});
		}).on("error", function(e) {
			endTime = new Date();
			var pingTime = endTime-startTime;
		    callback(e, {
				running: false,
				ping: pingTime
			});
		});
	}

	module.exports = ping;
}(exports);