(function(){
	uki.view.declare('uki.view.Dashboard', uki.view.Container, function(Base){
		this.typeName = function() { return 'uki.view.Dashboard'; };
		var self = this;
		
		this._initClassName = function() {
	        Base._initClassName.call(this);
	        this.initDrop();
	    }
	    
		this.clearDrop = function(type){
			if(type){
				this['allowDrop_'+type] = false;	
			}else{
				this.allowDrop_Layout = false;
				this.allowDrop_Module = false;
			}
			if(!this.allowDrop_Module){
				this.style({backgroundColor: 'transparent', border: 'none'});
			}	
		}
		
		this.dragOver = function(e){
			e.preventDefault();
		    //e.dataTransfer.dropEffect = 'copy';
		}
		
		this.dragEnter = function(e) {
			switch(e.dataTransfer.getData('text/plain')){
		        case 'HSplitPane':
		        case 'VSplitPane':
		    		if(this.allowDrop_Layout){
		    			this.style({backgroundColor: '#fff'});
		    		}    
		        	break;
		        default:
		        	if(this.allowDrop_Module){
		    			this.style({backgroundColor: '#fff'});
		    		}
		        	break;
		    }
	    }
	    
		this.dragLeave = function(e) {
	        this.style({backgroundColor: 'transparent'});
	    }
	    
	    this.drop = function(e) {
	    	if(!this.allowDrop_Layout && !this.allowDrop_Module){//just in case the unbind in clearDrop doesn't work
	    		return;
	    	}
	    	this.style({backgroundColor: 'transparent'});
		    	var thisDashboard = this;
		        e.preventDefault();
		        switch(e.dataTransfer.getData('text/plain')){
		        	case 'HSplitPane':
		        		if(!this.allowDrop_Layout){
		        			return;
		        		}
		        		this.clearDrop();
		        		var parentHeight = this.height();
		        		var parentWidth = this.width();
		        		var itemWidth = (parentWidth-15)/2;
		        		var newSplit = uki({
		        			id: 'hsplit-1',
		        			view: 'HSplitPane',
		        			rect: '0 0 1000 800',
		        			anchors: 'left top right bottom', 
		        			handleWidth: 15, 
							handlePosition: itemWidth, 
							leftMin: 50, 
							rightMin: 50,
		        			style: {
		        				backgroundColor: 'transparent'
		        			},
		        			leftChildViews:[{
								view: 'Dashboard',
								rect: '0 0 '+itemWidth+' '+parentHeight, 
								anchors: 'left top right bottom',
								style:{
									border: '2px dashed #000'
								}
							}],
		        			rightChildViews:{
								view: 'Dashboard',
								rect: '0 0 '+itemWidth+' '+parentHeight, 
								anchors: 'left top right bottom',
								style:{
									border: '2px dashed #000'
								}
							}
		        		}).appendTo(this).layout();
		        		break;
		        	case 'VSplitPane':
		        		if(!this.allowDrop_Layout){
		        			return;
		        		}
		        		this.clearDrop();
		        		var parentHeight = this.height();
		        		console.log(parentHeight); 
		        		var parentWidth = this.width();
		        		var itemHeight = (parentHeight-15)/2;
		        		var newSplit = uki({
		        			id: 'vsplit-1',
		        			view: 'VSplitPane',
		        			rect: '0 0 '+parentWidth+' '+parentHeight,
		        			anchors: 'left top right bottom', 
		        			handleWidth: 15, 
							handlePosition: itemHeight,
							topMin: 50, 
							bottomMin: 50,
							draggable:false,
		        			style: {
		        				backgroundColor: 'transparent'
		        			},
		        			topChildViews:[{
							draggable:false,
								view: 'Dashboard',
								id: 'main-dash-2',
								rect: '0 0 '+parentWidth+' '+itemHeight, 
								anchors: 'left top right bottom',
								style:{
									border: '2px dashed #000'
								}
							}],
		        			bottomChildViews:{
							draggable:false,
								view: 'Dashboard',
								id: 'main-dash-3',
								rect: '0 0 '+parentWidth+' '+itemHeight, 
								anchors: 'left top right bottom',
								style:{
									border: '2px dashed #000'
								}
							}
		        		}).appendTo(this).layout();
		        		break;
		        	case 'Button':
		        		this.clearDrop('Layout');
		        		uki({
		        			view: 'Button',
		        			text:'Hello World',
		        			draggable:true,
		        			anchors: 'left right top',
		        			rect: '0 '+(this.contentsHeight()+3)+' '+(this.width()-4)+' 23'
		        		}).appendTo(this).layout();
		        		break;
		        }
			}
			
		this.initDrop = function(){
			this.allowDrop_Layout = true;//just in case the unbind in clearDrop doesn't work
			this.allowDrop_Module = true;//just in case the unbind in clearDrop doesn't work
	        uki(this).bind('dragover', this.dragOver).bind('dragenter', this.dragEnter).bind('dragleave', this.dragLeave).bind('drop', this.drop);
	    };
	});
})();
