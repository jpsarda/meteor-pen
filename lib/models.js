Boards = new Meteor.Collection('Boards');
// { started : 1234567 , key : "xd4fg5" , updated : 1234567 }

Lines = new Meteor.Collection('Lines');
// { board_id:"XXX_UNIC_ID"  color : "#ff123456" , width : 5 , points:[ {x:100 , y:140} , {x:120 , y:130} , ... ] }



if (Meteor.is_client) {
	Session.set("subscribe_board_key","");
	Deps.autorun(function () {
		Meteor.subscribe("board_lines", Session.get("board_key"), function() {
			console.log("subscribe board_lines "+Session.get("board_key"));
			Session.set("subscribe_board_key",Session.get("board_key"));
		});
	});
	Meteor.subscribe("boards", null, function() {
			console.log("subscribe boards");
	});
}

if (Meteor.is_server) {
  Meteor.publish("board_lines", function (board_key) {
  	console.log("publish board_lines "+board_key);
  	var board=Boards.findOne({key:board_key});
  	if (board) {
			return Lines.find({board_id:board._id});
		} else {
			return null;
		}
	});

	Meteor.publish("boards", function () {
  	console.log("publish boards");
		return Boards.find();
	});
}



//Board "class", can be used server side or client side

//if create true, we try to create a doc with args.key value
//if create false, we only try to query a doc with args.key
//if args is empty, we create a doc with random key
Board = function (args,create) {
	if (!args) args={};
	if (!create) create=false;
	var createInDb=true;
	if (args.key) {
		var boardDoc=Boards.findOne({key:args.key});
		if (boardDoc) {
			createInDb=false;
			this.key=args.key;
			//this.width=boardDoc.width;
			//this.height=boardDoc.height;
			this.started=boardDoc.started;
			this.updated=boardDoc.updated;
			this._id=boardDoc._id;
		} else {
			if (!create) {
				return;
			}
		}
	}
	if (createInDb) {
		//if (args.width) this.width=args.width; else this.width=500;
		//if (args.height) this.height=args.height; else this.height=500;
		if (args.key) this.key=args.key; else this.key=this.randomKey();

		while(true) {
			var keyDoc=Boards.findOne({this:args.key});
			if (keyDoc) {
				if (args.key) {
					this.key=false;
					//Failure, the args.key is already used
					return;
				} else {
					this.key=this.randomKey();
				}
			} else {
				this._id=Meteor.uuid();
				var started=new Date().getTime();
				Boards.insert({ _id:this._id , key:this.key , started:started, updated:started });
				break;
			}
		}
	}
};

Board.prototype.randomKey = function() {
	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
	var string_length = 8;
	var ret = '';
	for (var i=0; i<string_length; i++) {
		var rnum = Math.floor(Math.random() * chars.length);
		ret += chars.substring(rnum,rnum+1);
	}
	return ret;
}

Board.prototype.clear = function() {
	Lines.remove({ board_id:this._id });
}

Board.prototype.insertLine = function(color,width,x0,y0,x1,y1) {
	return Lines.insert({ _id:Meteor.uuid() , board_id:this._id , width:width , color:color , points: [ {x:x0 , y:y0} , {x:x1 , y:y1} ] });
}
Board.prototype.pushPoint = function(line_id,x,y) {
	Lines.update({_id:line_id},{$push: { points : {x:x,y:y} } });
}

