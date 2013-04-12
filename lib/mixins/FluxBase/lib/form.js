;!(function(exports){
	function FluxBaseForm(thisNode, config, callback){
		var self = this;
		
		this.id = config.id;
		this.renderTo = config.renderTo?config.renderTo: 'body';
		this.valid = true;
		
		this.vm = {
			horizontal: config.horizontal===false?false:true,
			items:ko.observableArray([
				
			]),
			doValidate: function(field){
				if(field.required===true){
					if(!field.value() || field.value()==''){
						field.invalid(true);
						self.valid = false;
					}else{
						field.invalid(false);
					}
				}
			}
		};
		
		if(config.items){
			for(var i=0;i<config.items.length;i++){
				var item = config.items[i];
				this.add(item);	
			}
		}
		
		var formHTML = '';
		formHTML+='<form id="'+self.id+'" data-bind="css: {\'form-horizontal\': horizontal == true},foreach: items()">';
		formHTML+='<div class="control-group">';
		formHTML+='<label class="control-label" data-bind="text: label, for: name"></label>';
		formHTML+='<div class="controls">';
		formHTML+='<!--ko if: type == "text"-->';
		formHTML+='<input type="text" data-bind="visible: type==\'text\', name: name, placeholder: placeHolder, value: value, css: {invalidField: invalid}, event: {blur: $root.doValidate}">';
		formHTML+='<!--/ko-->';
		formHTML+='<!--ko if: type == "password"-->';
		formHTML+='<input type="password" data-bind="name: name, placeholder: placeHolder, value: value, css: {invalidField: invalid}, event: {blur: $root.doValidate}">';
		formHTML+='<!--/ko-->';
		formHTML+='<!--ko if: type == "checkbox"-->';
		formHTML+='<input type="checkbox" data-bind="name: name, checked: value">';
		formHTML+='<!--/ko-->';
		formHTML+='<!--ko if: type == "fieldset"-->';
		formHTML+='<fieldset data-bind="foreach: items">';
		formHTML+='<div class="control-group">';
		formHTML+='<label class="control-label" data-bind="text: label, for: name"></label>';
		formHTML+='<div class="controls">';
		formHTML+='<!--ko if: type == "text"-->';
		formHTML+='<input type="text" data-bind="visible: type==\'text\', name: name, placeholder: placeHolder, value: value, css: {invalidField: invalid}, event: {blur: $root.doValidate}">';
		formHTML+='<!--/ko-->';
		formHTML+='<!--ko if: type == "password"-->';
		formHTML+='<input type="password" data-bind="name: name, placeholder: placeHolder, value: value, css: {invalidField: invalid}, event: {blur: $root.doValidate}">';
		formHTML+='<!--/ko-->';
		formHTML+='<!--ko if: type == "checkbox"-->';
		formHTML+='<input type="checkbox" data-bind="name: name, checked: value">';
		formHTML+='<!--/ko-->';
		formHTML+='</div>';
		formHTML+='</div>';
		formHTML+='</fieldset>';
		formHTML+='<!--/ko-->';
		formHTML+='</div>';
		formHTML+='</div>';
		formHTML+='</form>';
		
		$('#'+self.renderTo).html(formHTML);
		
		ko.applyBindings(this.vm, $('#'+self.id)[0]);
	}
	
	FluxBaseForm.prototype.isValid = function(){
		this.valid = true;
		//make sure all of the fields have been run through validation
		for(var i=0;i<this.vm.items().length;i++){
			this.vm.doValidate(this.vm.items()[i]);
			console.log(this.valid);
		}
		return this.valid;
	}
	
	FluxBaseForm.prototype.getValues = function(){
		var returnObj = {};
		var fields = this.vm.items();
		
		for(var i=0;i<fields.length;i++){
			var field = fields[i];
			if(field.type=='fieldset'){
				console.log(field);
				returnObj[field.name] = {};
				for(var l=0;l<field.items().length;l++){
					var subField = field.items()[l];
					returnObj[field.name][subField.name] = subField.value();
				}
			}else{
				returnObj[field.name] = field.value();	
			}
			
		}	
		
		return returnObj;
	}
	
	FluxBaseForm.prototype.setValues = function(valObj){
		var returnObj = {};
		var fields = this.vm.items();
		for(var fieldName in valObj){
			for(var i=0;i<fields.length;i++){
				var field = fields[i];
				if(fieldName == field.name){
					if(field.type=='fieldset'){
						for(var subFieldName in valObj[fieldName]){
							for(var l=0;l<field.items().length;l++){
								var subField = field.items()[l];
								if(subFieldName==subField.name){
									subField.value(valObj[fieldName][subField.name]);
									continue;	
								}
								 
							}	
						}
							
					}else{
						field.value(valObj[fieldName]);	
					}
				}
			}	
		}	
		
		return returnObj;
	}
	
	FluxBaseForm.prototype.add = function(config){
		//validation and transformation
		if(!config.placeHolder){
			config.placeHolder = '';
		}
		
		if((typeof config.invalid)!='function'){
			config.invalid = ko.observable(config.invalid);
		}
		
		if((typeof config.value)!='function'){
			config.value = ko.observable(config.value);
		}
		
		if(config.type=='fieldset'){
			for(var i=0;i<config.items.length;i++){
				var item = config.items[i];
				
				if(!item.placeHolder){
					item.placeHolder = '';
				}
				
						
				if((typeof item.invalid)!='function'){
					item.invalid = ko.observable(item.invalid);
				}
				
				if((typeof item.value)!='function'){
					item.value = ko.observable(item.value);
				}
				
				config.items[i] = item;
			}
			
			if((typeof config.items)!='function'){
				config.items = ko.observableArray(config.items);
			}
		}
		
		this.vm.items.push(config);
	}
	
	define(function(){return FluxBaseForm});
})();
