Handlebars.registerHelper('session',function(input){
    return Session.get(input);
});


Session.set("color","red");

Deps.autorun(function () {
  var board_key=Session.get("board_key");
  console.log("createBoard "+board_key);
  if (board_key) {
    Meteor.call("createBoard", board_key);
  }
});


