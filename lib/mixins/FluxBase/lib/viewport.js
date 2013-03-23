;!(function(exports){
	
	function FluxBaseViewport(thisNode, config, callback){
		this.renderTo = config.renderTo?config.renderTo:'body';
		this.id = config.id;
		
		this.render = render;
		this.show = show;
		this.hide = hide;
		
		function render(callback){
			var self = this;
			var viewportHTML = '';
			viewportHTML+='<div class="container" id="'+self.id+'">';
			
			viewportHTML+='</div>';
	    	$(this.renderTo).append(viewportHTML);
	    	
			self.navbar = new thisNode.FluxBase.components.Navbar(thisNode, {
				renderTo: '#'+self.id,
				id: self.id+'_mainNavbar'
			});
			self.navbar.render(function(){
				if(callback){
					callback(self);
				}	
			});
		}
		
		function show(){
			$(this.renderTo).show();
			$('#'+this.id).show();
		}
		
		function hide(){
			$(this.renderTo).show();
			$('#'+this.id).hide();
		}
		
		function addItem(itemCfg, callback){
			$('#'+this.id+'_itemList').append('<li>'+itemCfg.text+'</li>');
		}
		
		if(callback){
			callback(this);
		}
		return this;
	}
	
	define(function(){return FluxBaseViewport});	
})();
