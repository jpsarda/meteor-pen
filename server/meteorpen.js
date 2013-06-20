Meteor.methods({
  //Set the updated field of the board doc in collection with server time. If this is done on client side, we rely on client time which can be different from server time.
  boardUpdated : function(board_key) {
    var board=new Board({key:board_key});
    if (board.key) {
      var now=new Date().getTime();
      if (!board.updated || now>board.updated+10000) { //min 10s between each update
        Boards.update({_id:board._id},{ $set: {updated:now}});
      }
    }
  },
  //Clear the board
  clearLines : function(board_key) {
    var board=new Board({key:board_key});
    if (board.key) {
      board.clear();
      return true;
    } else {
      return false;
    }
  },
  //Create board is it's not already existing
  createBoard : function(board_key) {
    console.log("createBoard "+board_key)
    if (!board_key) return false;
  	var board=new Board({key:board_key},true);
  	if (board.key) {
  		return true;
  	} else {
  		return false;
  	}
  }
});
