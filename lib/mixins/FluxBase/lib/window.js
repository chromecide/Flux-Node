;!(function(exports){
	
	function FluxBaseWindow(thisNode, config, callback){
		this.renderTo = config.renderTo?config.renderTo:'body';
		this.id = config.id;
		this.title = config.title;
		this.content = config.content;
		this.buttons = config.buttons;
		this.render = render;
		this.show = show;
		this.hide = hide;
		this.render();
		
		function render(callback){
			var self = this;
			if($('#'+self.id).length==0){
				var windowHTML = '';
				windowHTML+='<div class="modal hide fade" id="'+self.id+'">';
	    		windowHTML+='<div class="modal-header">';
	    		windowHTML+='<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>';
	    		windowHTML+='<h3 id="'+self.id+'_title">'+self.title+'</h3>';
	    		windowHTML+='</div>';
	    		windowHTML+='<div class="modal-body">';
	    		windowHTML+=this.content;
	    		windowHTML+='</div>';
	    		windowHTML+='<div class="modal-footer">';
	    		
	    		for(var btnIdx=0;btnIdx<this.buttons.length;btnIdx++){
	    			var btnCfg = this.buttons[btnIdx];
	    			console.log(btnCfg);
	    			windowHTML+='<a href="#" class="btn" id="'+btnCfg.id+'">'+btnCfg.text+'</a>';
	    		}
	    		windowHTML+='</div>';
	    		windowHTML+='</div>';
		    	$(this.renderTo).append(windowHTML);
		    	
		    	for(var btnIdx=0;btnIdx<this.buttons.length;btnIdx++){
		    		var btnCfg = this.buttons[btnIdx];
		    		$('#'+btnCfg.id).click(btnCfg.click);
		    	}
		    	
		    	if(callback){
		    		callback(this);
		    	}
			}else{
				if(callback){
		    		callback(this);
		    	}
			}
		}
		
		function show(){
			//$(this.renderTo).show();
			$('#'+this.id).modal('show');
		}
		
		function hide(){
			//$(this.renderTo).show();
			$('#'+this.id).modal('hide');
		}
		
		if(callback){
			callback(this);
		}
		return this;
	}
	
	define(function(){return FluxBaseWindow});	
})();
