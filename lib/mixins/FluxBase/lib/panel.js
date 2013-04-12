;!(function(exports){
	
	function FluxBasePanel(thisNode, config, callback){
		this.renderTo = config.renderTo?config.renderTo:'body';
		this.id = config.id;
		this.title = config.title;
		
		this.render = render;
		this.show = show;
		this.hide = hide;
		
		this.add = add;
		
		this.vm = {
			
		}
		
		function render(callback){
			var self = this;
			var panelHTML = '';
			panelHTML='<div id="'+self.id+'" class="well well-small">'; //Start Panel
			panelHTML+='<h4 data-toggle="collapse" data-target="#'+self.id+'_collapse" id="'+self.id+'_title">'+self.title+'</h4>';
			panelHTML+='<div id="'+self.id+'_collapse" class="collapse">'; //start Panel collapsible area
			
			panelHTML+='</div>';
			panelHTML+='</div>';
	    	$(this.renderTo).append(panelHTML);
		}
		
		function show(){
			$(this.renderTo).show();
			$('#'+this.id).show();
		}
		
		function hide(){
			$(this.renderTo).show();
			$('#'+this.id).hide();
		}
		
		function add(item, callback){
			var self = this;
			$('#'+self.id+'_collapse').append(item);
		}
		
		if(callback){
			callback(this);
		}
		return this;
	}
	
	define([], function(){return FluxBasePanel});	
})();
