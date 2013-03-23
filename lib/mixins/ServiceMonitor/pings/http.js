;!function(exports, undefined) {
	var http = require('http');
	
	function ping(cfg, callback){
		var url = cfg.url;
		
		var startTime = new Date();
		var endTime = false;
		
		http.get(url, function(res) {
			endTime = new Date();
			var pingTime = endTime-startTime;
			var ok = false;
			console.log(res);
			if(res.statusCode<400){ //lazy but simple enough to tell if a http server is running
				ok = true;
			}
			
			callback({
				running: ok,
				ping: pingTime
			});
		}).on('error', function(e) {
			endTime = new Date();
			var pingTime = endTime-startTime;
			
			console.log(e);
	  		callback({
				running: false,
				ping: pingTime
			});
		});
	}

	module.exports = ping;
}(exports);