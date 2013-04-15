;!function(exports, undefined) {
	
	var channel = {
		name: 'twitter_stream',
		auth:{
			consumer_key: '',
			consumer_secret: '',
			access_token_key: '',
			access_token_secret: ''
		}
	};
	
	channel.init = function(callback){
		var self = this;
		//late load the required modules
		var twitter = require('ntwitter');
		this.twit = new twitter(this.auth);
		this.twit.verifyCredentials(function(err, data){
			
			self.twit.stream(self.endpoint, function(stream) {
				stream.on('data', function (data) {
			    	/*if(data.friends){
				    	//we're connected
				    	if(callback){
				    		callback(this);
				    	}
				    	self.emit('Channel.Ready', this);
					}else{*/
						processMessage.call(self, data);
					//}
					
				});
			});
		});
	}
	
	channel.models = [
		{
			name: 'friend_list',
			fields:{
				friend_id: {
					name: 'friend_id',
					label: 'Friend ID',
					type: 'Number',
					required: true
				}
			}
		},
		{
			name: 'Twitter_User',
			fields:{
				id:{
					name: 'id',
					label: 'ID',
					type: 'Number',
					require: true
				},
				profile_text_color:{
					name: 'profile_text_color',
					label: 'Profile Text Color',
					type: 'Text',
					require: true
				},
				contributers_enabled:{
					name: 'contributers_enabled',
					label: 'Contributers Enabled',
					type: 'Boolean'
				},
				profile_image_url_https:{
					name: 'profile_image_url_https',
					label: 'Profile Image URL (HTTPS)',
					type: 'String'
				},
				time_zone: {
					name: 'time_zone',
					label: 'Time Zone',
					type: 'String'
				},
				default_profile:{
					name: 'default_profile',
					name: 'Default Profile',
					type: 'Boolean'
				},
				followers_count: {
					name: 'followers_count',
					label: 'Followers Count',
					type: 'Number'
				},
				id_str: {
					name: 'id_string',
					label: 'ID String',
					type: 'Text'
				},
				profile_sidebar_border_color:{
					name: 'profile_sidebar_border_color',
					label: 'Profile Sidebar Border Color',
					type: 'Text'
				},
				screen_name: {
					name: 'screen_name',
					label: 'Screen Name',
					type: 'Text'
				},
				profile_background_image_url_https: {
					name: 'profile_background_image_url_https',
					label: 'Profile Background Image URL (HTTPS)',
					type: 'Text'
				},
				utc_offset: {
					name: 'utc_offset',
					label: 'UTC Offset',
					type: 'Number'
				},
				url: {
					name: 'url',
					label: 'URL',
					type: 'Text'
				},
				verified: {
					name: 'verified',
					label: 'Verified',
					type: 'Boolean'
				},
				location: {
					name: 'location',
					label: 'Location',
					type: 'Text'
				},
				profile_background_tile:{
					name: 'profile_background_tile',
					label: 'Profile Background Tile',
					type: 'Boolean' 
				},
				listed_count: {
					name: 'listed_count',
					label: 'Listed Count',
					type: 'Number'
				},
				notifications: {
					name: 'notifications',
					label: 'Notifications',
					type: 'Boolean'
				},
				geo_enabled: {
					name: 'geo_enabled',
					label: 'Geo Enabled',
					type: 'Boolean'
				},
				profile_sidebar_fill_color:{
					name: 'profile_sidebar_fill_color',
					label: 'Profile Sidebar Fill Color',
					type: 'Text'
				},
				protected: {
					name: 'protected',
					label: 'Protected',
					type: 'Boolean'
				},
				is_translator: {
					name: 'is_translator',
					label: 'Is Translator',
					type: 'Boolean'
				},
				lang: {
					name: 'lang',
					label: 'Language',
					type: 'Text'
				},
				profile_background_color:{
					name: 'profile_background_color',
					label: 'Profile Background Color',
					type: 'Text'
				},
				profile_image_url:{
					name: 'profile_image_url',
					label: 'Profile Image URL',
					type: 'Text'
				},
				statuses_count:{
					name: 'statuses_count',
					label: 'Statuses Count',
					type: 'Number'
				},
				profile_link_color:{
					name: 'profile_link_color',
					label: 'Profile Link Color',
					type: 'Text'
				},
				following:{
					name: 'following',
					label: 'Following',
					type: 'Boolean'
				},
				created_at:{
					name: 'created_at',
					label: 'Created At',
					type: 'Date'
				},
				follow_request_sent:{
					name: 'follow_request_sent',
					label: 'Follow Request Sent',
					type: 'Boolean'
				},
				description:{
					name: 'description',
					label: 'Description',
					type: 'Text'
				},
				profile_use_background_image:{
					name: 'profile_use_background_image',
					label: 'Profile use Background Image',
					type: 'Text'
				},
				friends_count:{
					name: 'friend_count',
					label: 'Friends Count',
					type: 'Number'
				},
			}
		},
		{
			name: 'Twitter_DirectMessage',
			fields:{
				created_at: {
					name: 'created_at',
					label: 'Created At',
					type: 'Date',
					required: true
				},
				sender_screen_name: {
					name: 'sender_screen_name',
					label: 'Sender Name',
					type: 'Text',
					required: true
				},
				recipient_id_str:{
					name: 'recipient_id_str',
					label: 'Recipient ID String',
					type: 'Text',
					required: true
				},
				sender: {
					name: 'sender',
					label: 'Sender',
					type: 'TwitterUser',
					required: true
				},
				id_str: {
					name: 'id_str',
					label: 'ID String',
					type: 'Text',
					required: true
				},
				recipient_screen_name: {
					name: 'recipient_screen_name',
					label: 'Recipient Name',
					type: 'Text',
					required: true
				},
				recipient_id: {
					name: 'recipient_id',
					label: 'Recipient Name',
					type: 'Text',
					required: true
				},
				text: {
					name: 'text',
					label: 'Text',
					type: 'Text',
					required: true
				},
				sender_id_str: {
					name: 'sender_id_str',
					label: 'Sender ID String',
					type: 'Text',
					required: true
				},
				sender_id: {
					name: 'sender_id',
					label: 'Sender ID',
					type: 'Number',
					required: true
				},
				id: {
					name: 'id',
					label: 'ID',
					type: 'Number',
					required: true
				},
				entities: {
					name: 'entities',
					label: 'Entities',
					type: 'Object',
					required: true,
					fields:{
						hashtags:{
							name: 'hashtags',
							type: 'Text',
							hasMany: true
						},
						user_mentions:{
							name: 'user_mentions',
							type: 'Text',
							hasMany: true
						},
						urls:{
							name: 'hashtags',
							type: 'Text',
							hasMany: true
						}
					}
				},
				recipient: {
					name: 'sender',
					label: 'Sender',
					type: 'Entity',
					model: 'TwitterUser',
					required: true
				}
			}
		}
	];
	
	channel.instance = function(data, model){
		
		console.log(this.Entity);
		//return new entity(this.model, data);
	}
	
	/*
	 * Writes data to the channel
	 */
	channel.publish = function(entity, callback){
		throw new Error('Publishing not provided');
	}
	
	/*
	 * Attaches a listener to the channel, running "fn" whenever an entity matching "query"
	 */
	channel.subscribe = function(query, fn, scope, callback){
		var self = this;
		
		
	}
	
	channel.save = function(entity, callback){
		var self = this;
		
		if(callback){
			callback(new Error('INVALID ENTITY FOR THIS CHANNEL', entity), entity);	
		}else{
			throw new Error('Channel Read Only', entity)
		}
	}
	
	channel.find = function(query, fields, callback){
		var self = this;
		if((typeof query)=='function'){
			callback = query;
			query = {};
			fields = {};
		}
		
		if((typeof fields)=='function'){
			callback = fields;
			fields = {};
		}
		
		self.collection.find(query, fields).toArray(function(err, items){
			if(err){
				if(callback){
					callback(err, items);
				}
			}else{
				if(self.model){
					
					for(var i=0;i<items.length;i++){
						items[i] = self.instance(items[i]);
					}
					
					if(callback){
						callback(err, items);
					}
				}else{
					if(callback){
						callback(err, items);
					}
				}
			}
		});
	}
	
	channel.findOne = function(query, fields, callback){
		var self = this;
		if((typeof query)=='function'){
			callback = query;
			query = {};
			fields = {};
		}
		
		if((typeof fields)=='function'){
			callback = fields;
			fields = {};
		}
		
		self.collection.findOne(query, fields, function(err, item){
			
			if(err){
				if(callback){
					callback(err, item);
				}
			}else{
				if(self.model){
					item = self.instance(item);
					
					if(callback){
						callback(err, item);
					}
				}else{
					if(callback){
						callback(err, item);
					}
				}
			}
		});
	}
	
	function processMessage(data){
		var self = this;
		var type = false;
		if(data.friends){
			var entity = self.instance(data, type);
		}else{
			if(data.direct_message){
				type = 'direct_message';
			}
			
			var entity = self.instance(data, type)	
		}
		
	}
	
	if (typeof define === 'function' && define.amd) {
		define(function() {
			return channel;
		});
	} else {
		exports.Channel = channel;
	}

}(typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);