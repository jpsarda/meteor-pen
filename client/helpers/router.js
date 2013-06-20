Meteor.Router.add({

  '/': 'home',
  
  '/:_key': {
    to: 'currentboard',
    and: function(key) { 
    	Session.set("board_key", key);
    	Session.set("line_id",false);
  	}
  }

});
