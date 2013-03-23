;!(function(exports){
	function FluxBaseNavbar(thisNode, config, callback){
		this.renderTo = config.renderTo;
		this.id = config.id;
		
		this.render = render;
		this.show = show;
		this.hide = hide;
		this.addItem = addItem;
		function render(callback){
			var self = this;
			
			var navbarHTML = '';
			navbarHTML+='';
			navbarHTML+='<div id="'+self.id+'" class="navbar navbar-inverse navbar-fixed-top">';
	      	navbarHTML+='<div class="navbar-inner">';
	        navbarHTML+='<div class="container">';
	        navbarHTML+='<button type="button" class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">';
	        navbarHTML+='<span class="icon-bar"></span>';
	        navbarHTML+='<span class="icon-bar"></span>';
	        navbarHTML+='<span class="icon-bar"></span>';
	        navbarHTML+='</button>';
	        navbarHTML+='<a class="brand" href="#">FluxBase</a>';
	        navbarHTML+='<div class="nav-collapse collapse">';
	        navbarHTML+='<ul class="nav" id="'+self.id+'_itemList">';
	              
	        navbarHTML+='</ul>';
	        navbarHTML+='</div><!--/.nav-collapse -->';
	        navbarHTML+='</div>';
	      	navbarHTML+='</div>';
	    	navbarHTML+='</div>';
	    	
	    	$(this.renderTo).append(navbarHTML);
	    	
	    	if(callback){
	    		callback(this);
	    	}
		}
		
		function show(){
			$(this.renderTo).show();
			$('#'+this.id).show();
		}
		
		function hide(){
			$(this.renderTo).show();
			$('#'+this.id).hide();
		}
		
		function addItem(thisNode, itemCfg, callback){
			switch(itemCfg.type){
				case 'menu':
					var itemId = (itemCfg.id?itemCfg.id:this.id+'_'+itemCfg.text.replace(/ /g,'_'));
					var buttonHTML='';
					buttonHTML+='<li class="dropdown">';
					buttonHTML+='<a class="dropdown-toggle" data-toggle="dropdown" href="#">';
					buttonHTML+=itemCfg.text;
					buttonHTML+='<span class="caret"></span>';
					buttonHTML+='</a>';
					buttonHTML+='<ul class="dropdown-menu" id="'+itemId+'_list">';
					buttonHTML+='<!-- dropdown menu links -->';
					if(itemCfg.items){ 
						for(var i=0;i<itemCfg.items.length;i++){
							var subItemCfg = itemCfg.items[i];
							var subItemId = subItemCfg.id?subItemCfg.id:itemId+'_'+i;
							if(subItemCfg.html){
								buttonHTML+=subItemCfg.html
							}else{
								buttonHTML+='<li><a href="'+(subItemCfg.url?itemCfg.url:'#')+'" id="'+subItemId+'">'+subItemCfg.text+'</a></li>'
							}
						}
					}
					buttonHTML+='</ul>';
					buttonHTML+='</li>';
					$('#'+this.id+'_itemList').append(buttonHTML);
					if(itemCfg.items){ 
						for(var i=0;i<itemCfg.items.length;i++){
							var subItemCfg = itemCfg.items[i];
							var subItemId = subItemCfg.id?subItemCfg.id:itemId+'_'+i;
							if(subItemCfg.click){
								
								$('#'+subItemId).click(subItemCfg.click);
							}
						}
					}
					break;
				default:  //normal nav item
					var itemId = (itemCfg.id?itemCfg.id:this.id+'_'+itemCfg.text.replace(/ /g,'_'));
					$('#'+this.id+'_itemList').append('<li><a href="'+(itemCfg.url?itemCfg.url:'#')+'" id="'+itemId+'">'+itemCfg.text+'</a></li>');
					if(itemCfg.click){
						$('#'+itemId).click(itemCfg.click);
					}	
					break;
			}
			
		}
		
		return this;
	}
	
	
	define(function(){return FluxBaseNavbar});	
})();
