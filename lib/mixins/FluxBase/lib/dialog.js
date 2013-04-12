;!(function(exports){
	function FluxBaseDialog(thisNode, config, callback){
		var self = this;
		
		this.id = config.id;
		this.renderTo = config.renderTo?config.renderTo: 'body';
		
		this.vm = {
			id: this.id,
			title: config.title,
			closeable: config.closeable==false?false:true,
			buttons: config.buttons?config.buttons:[],
			content: config.content?config.content:'',
			doButtonClick: function(button){
				if(button.eventName){
					thisNode.emit(button.eventName, button.eventParams);
				}
			}
		};
		
		if(!config.template){
			var dialogHTML='';
			dialogHTML+='<div class="modal hide fade" id="'+this.id+'">';
		    dialogHTML+='<div class="modal-header">';
		    dialogHTML+='<button type="button" class="close" data-dismiss="modal" aria-hidden="true" data-bind="visible: closeable">&times;</button>';
		    dialogHTML+='<h3 data-bind="text: title"></h3>';
		    dialogHTML+='</div>';
		    dialogHTML+='<div class="modal-body">';
		    dialogHTML+='<p id="'+this.id+'_Content" data-bind="text: content"></p>';
		    dialogHTML+='</div>';
		    dialogHTML+='<div class="modal-footer" data-bind="foreach: buttons">';
		    dialogHTML+='<a href="#" class="btn" data-bind="text: text, click: $root.doButtonClick, css: buttonStyle"></a>';
		    dialogHTML+='</div>';
		    dialogHTML+='</div>';
		    
		    this.template = dialogHTML;
		}
		
	    $(this.renderTo).append(this.template);
	    ko.applyBindings(self.vm, $('#'+this.id)[0]);
	    
	    this.show();
	}
	
	FluxBaseDialog.prototype.show = function(){
		$('#'+this.id).modal('show');
	}
	
	FluxBaseDialog.prototype.hide = function(){
		$('#'+this.id).modal('hide');
	}
	
	define(function(){return FluxBaseDialog});
})();
