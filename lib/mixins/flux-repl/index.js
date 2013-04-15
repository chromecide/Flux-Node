
//;!function(){
	var repl = require('repl');
	var readline = require('readline');
	var mixinFunctions = {
		init: function(cfg, callback){
			var thisNode = this;
			//add properties that are needed by this mixin
			thisNode.repl = repl.start('> ').on('exit', function(){
				process.exit();
			});
			
			thisNode.repl.context.thisNode = thisNode;
			//add Events that are emitted by this mixin
			
			//add listeners
			
			/*thisNode.rl = readline.createInterface({
			  input: process.stdin,
			  output: process.stdout,
			  terminal: true
			});
			
			thisNode.rl.on('line', function(line){
				thisNode.replParseLine(line);
			});
			
			
			
			thisNode.once('FluxNode.Ready', function(){
				thisNode.rl.setPrompt('>');
				thisNode.rl.prompt();
			});
			if(callback){
				callback(mixinReturn);
			}*/
			//should be called when the mixin is actually ready, not simp;y at the end of the init function
			var mixinReturn = {
				name: 'repl',
				config: cfg
			}
			if(callback){
				callback(false, mixinReturn);
			}
			thisNode.emit('Mixin.Ready', mixinReturn);
		},
		replParseLine: function(line){
			var thisNode = this;
			try{
				eval(line);	
			}catch(e){
				console.log(e);
			}
			
			thisNode.rl.prompt();
		},
		replPrompt: function(text, callback){
			var thisNode = this;
			
			thisNode.rl.question(text, function(answer){
				console.log(answer);
			});
			
			return true;
		}
	}
	
	if (typeof define === 'function' && define.amd) {
		define(mixinFunctions);
	} else {
		module.exports = mixinFunctions;
	}
//}();
	