;!(function(exports){
	function FluxBaseNavbar(thisNode, config, callback){
		var self = this;
		this.id = config.id;
		this.renderTo = config.renderTo?config.renderTo:'body';
		
		this.totalItemCount=0; //includes all sub menus, used for auto ids if needed
		
		this.vm = {
			items: ko.observableArray(),
			chosenItemId: ko.observable(),
			doNavItemClick: function(navItem) {
				if(navItem.eventName){
					var eventName = navItem.eventName;
					var eventArgs = navItem.eventArgs?navItem.eventArgs:{};
					
					thisNode.emit(eventName, eventArgs);
				}
				self.vm.chosenItemId(navItem.id);
			}
		};
		this.clearSelected = function(){
			self.vm.chosenItemId(false);
		}
		this.add = function(config, parentId){
			if(!config.items){
				config.items = [];
			}
			
			if(!config.id){
				config.id = this.id+'_item'+this.totalItemCount;
			}
			
			if(config.items && (typeof config.items)!='function'){ //ko.observableArray is a function, a standard array is an object
				config.items = ko.observableArray(config.items);
			}
			
			if(config.text && (typeof config.text)!='function'){
				config.text = ko.observable(config.text);
			}
			
			var subItems = config.items;
			config.items = ko.observableArray([]);
			
			if(!parentId){
				this.vm.items.push(config);
				//now add any sub items	
				if(subItems().length>0){
					for(var i=0;i<subItems().length;i++){
						this.add(subItems()[i], config.id)
					}
				}
			}else{
				var item;
				for(var i=0;i<this.vm.items().length;i++){
					if(this.vm.items()[i].id	==parentId){
						this.vm.items()[i].items.push(config);
					}
				}
			}
			this.totalItemCount++;
		}
		
		this.remove = function(text){
			for(var i=0;i<this.vm.items().length;i++){
				if(this.vm.items()[i]==text){
					this.vm.items.splice(i,1);
					continue;
				}
			}
		}
		
		if(config.items){
			for(var i=0;i<config.items.length;i++){
				this.add(config.items[i]);
			}
		}
		
		
		var navbarHTML = '';
		navbarHTML+='';
		navbarHTML+='<div id="'+this.id+'" class="navbar navbar-inverse navbar-fixed-top">';
      	navbarHTML+='<div class="navbar-inner">';
        navbarHTML+='<div class="container">';
        navbarHTML+='<button type="button" class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">';
        navbarHTML+='<span class="icon-bar"></span>';
        navbarHTML+='<span class="icon-bar"></span>';
        navbarHTML+='<span class="icon-bar"></span>';
        navbarHTML+='</button>';
        navbarHTML+='<a class="brand" href="#">FluxBase</a>';
        navbarHTML+='<div class="nav-collapse collapse">';
        navbarHTML+='<ul class="nav" id="'+this.id+'_itemList" data-bind="foreach: items">';
	        navbarHTML+='<li data-bind="id: id, css: {active: id == $root.chosenItemId(), dropdown: items().length>0}">';
		        navbarHTML+='<a href="#" data-toggle="dropdown" data-bind="';
				navbarHTML+='	css: { selected: text == $root.chosenItemId(), },';
		        navbarHTML+='   click: $root.doNavItemClick">';
		        navbarHTML+='<span  data-bind="text: text"></span>';
		        navbarHTML+='<span class="caret" data-bind="visible: items().length>0"></span>';
		        navbarHTML+='</a>';
	        	navbarHTML+='<ul class="dropdown-menu" id="'+this.id+'_list" data-bind="foreach: items, visible:items().length>0">';
						navbarHTML+='<!-- dropdown menu links -->';
						navbarHTML+='<li data-bind="css: {active: $data == $root.chosenItemId() }">';
	        			navbarHTML+='<a href="#" data-bind="text: text,';
	        			navbarHTML+='   click: $root.doNavItemClick">';
	        			navbarHTML+='</a>';
	        		navbarHTML+='</li>';
				navbarHTML+='</ul>';
	        navbarHTML+='</li>';
        navbarHTML+='</ul>';
        navbarHTML+='</div><!--/.nav-collapse -->';
        navbarHTML+='</div>';
      	navbarHTML+='</div>';
    	navbarHTML+='</div>';
    	
		$(this.renderTo).append(navbarHTML);
		
		ko.applyBindings(this.vm, $('#'+this.id+'_itemList')[0]);
		
		thisNode.on(this.id+'.Item.Add', function(config){
			self.add(config);
		});
	}
	
	define(function(){return FluxBaseNavbar});
})();