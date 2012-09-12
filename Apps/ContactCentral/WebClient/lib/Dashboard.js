uki({
	view: 'Box',
	rect: '0 0 990 960', 
	anchors: 'left top right bottom',
	childViews:[
		{
			view: 'Toolbar',
			rect: '0 0 1000 24',
			anchors: 'left top right',
			background: 'theme(toolbar-normal)',
			buttons:[
				{
					view:'Button',
					text: 'Flux Singularity',
					textSelectable: false
				},
				{
					view: 'Button',
					id: 'layout-button',
					text: 'Layout'
				}
			]
		},
		{
			view: 'Dashboard',
			id: 'main-dash',
			rect: '5 40 990 950', 
			anchors: 'left top right bottom',
			style:{
				border: '2px dashed #000'
			}
		}
	]
}).attachTo(window, '1000 1000');

uki({
	id: 'layout-menu',
	view: 'Popup',
	rect: '200 300',
	anchors: 'left top',
	relativeTo: uki('#layout-button')[0],
	childViews: [
		{
			view: 'ScrollableList',
			id: 'layout-menu-items',
			anchors: 'left top right bottom',
			rect: '200 300',
			draggable: true,
			textSelectable: false, 
			multiselect: false,
			data:[
				'HSplitPane',
				'VSplitPane',
				'Button'
			]
		}
	]
})[0].hide();

uki('#layout-button').click(function() {
    var button = this;
    // find relative popup and toggle it
    uki('#layout-menu').toggle();
});

uki('#layout-menu-items').dragstart(function(e) {
	var thisList = this;
    e.dataTransfer.setDragImage(uki({ view: 'Label', rect: '200 30', anchors: 'left top', 
        inset: '0 5', background: 'cssBox(border: 1px solid #CCC;background:#EEF)', 
        text: thisList.data()[this.selectedIndex()]})
        , 10, 10);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', this.selectedRows().join('\n'));
}).layout();

/*uki('Dashboard')
    .dragover(function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    })
    .dragenter(function(e) {
    	//this.back_bg = this.background();
        this.style({backgroundColor: '#fff'});
    })
    .dragleave(function(e) {
        this.style({backgroundColor: 'transparent'});
    })
    .drop(function(e) {
    	var thisDashboard = this;
        e.preventDefault();
        this.style({backgroundColor: 'transparent', border: 'none'});
        switch(e.dataTransfer.getData('text/plain')){
        	case 'HSplitPane':
        		var newSplit = uki({
        			id: 'hsplit-1',
        			view: 'HSplitPane',
        			rect: '0 0 1000 800',
        			anchors: 'left top right bottom', 
        			handleWidth: 15, 
					handlePosition: 300, 
					leftMin: 50, 
					rightMin: 50,
        			style: {
        				backgroundColor: 'transparent'
        			},
        			leftChildViews:[{
						view: 'Dashboard',
						rect: '0 0 300 800', 
						anchors: 'left top right bottom',
						style:{
							border: '2px dashed #000'
						}
					}],
        			rightChildViews:{
						view: 'Dashboard',
						rect: '0 0 1350 800', 
						anchors: 'left top right bottom',
						style:{
							border: '2px dashed #ccc'
						}
					}
        		}).appendTo(this).layout();
        		//this.appendChild(newSplit);
        		
        		//thisDashboard.appendChild(newSplit).parent().layout();
        		break;
        }
        setTimeout(uki.proxy(function() {
            
        }, this), 100)
    });*/