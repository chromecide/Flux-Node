if (typeof define === 'function' && define.amd) {
	require(['FluxNode'], function(FN){
		FluxNode = FN;
		run();
	});
} else {
	FluxNode = require('../../../FluxNode.js').FluxNode;
	run();
}

function run(){
	new FluxNode({}, function(myNode){
		myNode.addSetting(
			'MyApp.Setting1',   //SETTING NAME
			false, 				//INITIAL SETTING VALUE
			false,				//no validation required, can be set to anything.
			function(){			//CALLBACK FUNCTION
				console.log(myNode._Settings);
				myNode.setSetting('MyApp.Setting1', true, function(){
					console.log(myNode._Settings);	
					myNode.addSetting(
						'MyApp.ValidatedSetting',   //SETTING NAME
						50, 				//INITIAL SETTING VALUE
						function(val){
							if(val>100 || val<1){
								return false;
							}
							
							return true;
						},				//no validation required, can be set to anything.
						function(){			//CALLBACK FUNCTION
							console.log(myNode._Settings);
							myNode.setSetting('MyApp.ValidatedSetting', 15, function(){
								console.log('SETTING 1: '+myNode.getSetting('MyApp.Setting1'));
								myNode.getSetting('MyApp.ValidatedSetting', function(err, val){
									if(!err){
										console.log('SETTING 2: '+ val);
									}
								})
							});
						}
					);
				});
			}
		);
	});
}