minZoom=0.1;
minZone=960; //pixels, min square zone that every body can see
lineGrow=5; //the greater, the thiner the line is when starting/ending
Session.set("board_w",minZone);
Session.set("board_h",minZone);
Session.set("zoom",1);



//
// Template helpers
//

Template.currentboard.board = function () {
	var board=Boards.findOne({key:Session.get("board_key")});
	return board;
}

Template.board.size = function() {
	var canvas = document.getElementById('board');
	if (canvas) {
		var rect = canvas.getBoundingClientRect();
		return {w:window.innerWidth-20 , h:(window.innerHeight-rect.top-20)};
	}
	return {w:500,h:500};
}

Template.board.sizeAttr = function () {
	setZoom();
	return 'width="'+Session.get("board_w")+'" height="'+Session.get("board_h")+'"'
}

Template.board.rendered = function() {
	//console.log("Template.board.rendered");
	boardRender(true);
}

Template.board.destroyed = function() {
	//console.log("Template.board.destroyed");
	if (document.getElementById('board')) {
		Session.set("board_key",false);
		Session.set("subscribe_board_key","");
	}
}


//
// AUTORUN 
//


//Manage the lines to draw
var linesToDraw=null;
Deps.autorun(function () {
	try {
		var board=Boards.findOne({key:Session.get("subscribe_board_key")});
		if (board) {
			linesToDraw=Lines.find({board_id:board._id});
		} else {
			linesToDraw=null;
		}
		//console.log("subscribe_board_key "+board._id);
		Deps.nonreactive(boardRenderWithOverlay());
	} catch (e) {}
});

//Manage border color
Deps.autorun(function () {
  var color=Session.get("color");
  var canvas = document.getElementById('board');
  if (canvas) {
  	canvas.style.border="4px solid "+color;
  }
});




//
// DRAW on CANVAS
//


function boardRenderWithOverlay() {
	boardRender(true);
}
// This is where we draw on canvas
// if "overlay" is true, we draw the square representing the area that everybody can see on any device
function boardRender(overlay) {

	var canvas = document.getElementById('board');

	var s=Template.board.size();
	if (canvas.width!=s.w || canvas.height!=s.h) {
		canvas.width=s.w;
		canvas.height=s.h;
		Session.set("board_w",s.w);
		Session.set("board_h",s.h);
	}
  var context = canvas.getContext('2d');

	var board=Boards.findOne({key:Session.get("board_key")});

	var center={x:canvas.width/2,y:canvas.height/2};
	var zoom=Session.get("zoom");

	context.clearRect ( 0 , 0 , canvas.width , canvas.height );

	if (overlay) {
	  context.beginPath();
		context.strokeStyle = "rgba(240, 240, 240, 255)";
		context.lineWidth = 4;
		context.moveTo(center.x+minZone*0.5*zoom,center.y+minZone*0.5*zoom);
		context.lineTo(center.x+minZone*0.5*zoom,center.y-minZone*0.5*zoom);
		context.lineTo(center.x-minZone*0.5*zoom,center.y-minZone*0.5*zoom);
		context.lineTo(center.x-minZone*0.5*zoom,center.y+minZone*0.5*zoom);
		context.lineTo(center.x+minZone*0.5*zoom,center.y+minZone*0.5*zoom);
		context.stroke();
	}

	if (Session.get("subscribe_board_key")!=Session.get("board_key")) {
		return;
	}

	var lines=linesToDraw; //Lines.find({board_id:board._id});
	//console.log(lines);

	if (lines) {

		lines.rewind();

		lines.forEach(function (line) {
	    context.beginPath();
			context.strokeStyle = line.color;
			context.lineWidth = line.width*zoom;

			var i=0;
			var nb=line.points.length;
			line.points.forEach(function (point) {
				if (i==0) {
					context.moveTo(center.x+point.x*zoom,center.y+point.y*zoom);
				} else {
					context.lineTo(center.x+point.x*zoom,center.y+point.y*zoom);
					if (i<=lineGrow) {
						context.lineWidth = line.width*zoom*i/lineGrow;
						if (i<lineGrow) {
							context.stroke();
							context.beginPath();
							context.moveTo(center.x+point.x*zoom,center.y+point.y*zoom);
						}
					} else {
						if (i>nb-lineGrow) {
							context.lineWidth = line.width*zoom*(nb-i)/lineGrow;
							context.stroke();
							if (i<nb-1) {
								context.beginPath();
								context.moveTo(center.x+point.x*zoom,center.y+point.y*zoom);
							}
						}	
					}
				}
				i++;
			});
			context.stroke();
	  });
	}
}


//
// ZOOM and RESIZE
//

// Set new size of the canvas on browser window resize (or mobile rotation for example)
window.onresize = function(event) {
	var s=Template.board.size();

	var canvas = document.getElementById('board');
	if (canvas) {
		if (canvas.width!=s.w || canvas.height!=s.h) {
			Session.set("board_w",s.w);
			Session.set("board_h",s.h);

			setZoom();

			canvas.width=s.w;
			canvas.height=s.h;
			Template.board.rendered();
		}
	}
}
function setZoom() {
	var zoom=1;
	if (Session.get("board_w")<minZone) {
		zoom=Session.get("board_w")/minZone;
	}
	if (Session.get("board_h")<Session.get("board_w")) {
		zoom=Session.get("board_h")/minZone;
	}
	if (zoom<minZoom) zoom=minZoom;
	Session.set("zoom",zoom);	
}



//
// EVENTS
//


var isTouchSupported = 'ontouchstart' in window;
if (isTouchSupported) {
	Template.board.events({
		"touchstart #board": function (e,tmp) {
			//console.log("touchstart");
			mpTouchStart(e);
		},
		"touchmove #board": function (e,tmp) {
			//console.log("touchmove");
			mpTouchMove(e);
		},
		"touchend #board": function (e,tmp) {
			//console.log("touchend");
			mpTouchEnd(e);
		},
	});
} else {
	Template.board.events({
		"mousedown #board": function (e,tmp) {
			mpTouchStart(e);
		},
		"mousemove #board": function (e,tmp) {
			mpTouchMove(e);
		},
		"mouseup #board": function (e,tmp) {
			mpTouchEnd(e);
		},
	});
}

closeCapture= function() {
	 $('#capturebox').remove();
}
Template.board.events({
	"click #clear": function (e,tmp) {
		//console.log("click clear");
		// Calling a method here as affecting too many docs in a collection from the client is not allowed
  	Meteor.call("clearLines", Session.get("board_key") , function(error, ret){
 			console.log("clearLines error="+error+" ret="+ret);
		});
	},
	"click #capture": function (e,tmp) {
		console.log("click clear");
		boardRender(false);
		var canvas = document.getElementById('board');
		var img    = canvas.toDataURL("image/png");
		boardRender(true);

		var $overlay=$('<div id="capturebox" style="background-color:#eee; display: block; position: absolute; z-index: 100; top: 0px; left: 0px; width:100%; height:100%;"><center><br><a class="abtn" id="close" onclick="closeCapture();">Close</a><br><img src="'+img+'" style="background-color:#fff;width:75%;border:1px solid red;margin:25px;" /></center></div>');
		$("body").append($overlay);
	},
	"click #black": function (e,tmp) {
		Session.set("color","black");
	},
	"click #red": function (e,tmp) {
		Session.set("color","red");
	},
	"click #orange": function (e,tmp) {
		Session.set("color","orange");
	},
	"click #yellow": function (e,tmp) {
		Session.set("color","yellow");
	},
	"click #green": function (e,tmp) {
		Session.set("color","green");
	},
	"click #blue": function (e,tmp) {
		Session.set("color","blue");
	},
	"click #purple": function (e,tmp) {
		Session.set("color","purple");
	},
	"click #create": function (e,tmp) {
		console.log("click create");
		var input=document.getElementById("createboard");
		if (input.value) {
			window.location.href = "/"+input.value;
		}
	},
	"click #zoomin": function (e,tmp) {
		Session.set("zoom",Session.get("zoom")*1.25);
		Template.board.rendered();
	},
	"click #zoomout": function (e,tmp) {
		var zoom=Session.get("zoom");
		zoom*=0.75;
		if (zoom<minZoom) zoom=minZoom;
		Session.set("zoom",zoom);
		Template.board.rendered();
	},
	"keydown #createboard": function (e,tmp) {
		console.log("keydown createboard");
		if (e.keyCode == 13) document.getElementById('create').click();
	},
});

function convertTouchEvent(e) {
	if (isTouchSupported) {
		if (e.touches[0]) {
			e.insideX=e.touches[0].pageX - document.getElementById('board').getBoundingClientRect().left;
			e.insideY=e.touches[0].pageY - document.getElementById('board').getBoundingClientRect().top;
		} else {
			e.insideX=e.changedTouches[0].pageX - document.getElementById('board').getBoundingClientRect().left;
			e.insideY=e.changedTouches[0].pageY - document.getElementById('board').getBoundingClientRect().top;
		}
	} else {
		e.insideX=(e.offsetX || e.pageX - document.getElementById('board').getBoundingClientRect().left);
		e.insideY=(e.offsetY || e.pageY - document.getElementById('board').getBoundingClientRect().top);
	}
	e.insideX-=4;
	e.insideY-=4;
}

function mpTouchStart(e) {
	try { convertTouchEvent(e); } catch (err) {return;}
	//console.log("mpTouchStart "+e.insideX+","+e.insideY);
	previousTouchPosition={x:e.insideX,y:e.insideY};
	e.preventDefault();
}
function mpTouchMove(e) {
	try { convertTouchEvent(e); } catch (err) {return;}
	//console.log("mpTouchMove "+e.insideX+","+e.insideY+" previousTouchPosition="+previousTouchPosition);
	if (previousTouchPosition) {
		var board=new Board({key:Session.get("board_key")});
		//console.log(board);
  	if (board.key) {
  		var canvas = document.getElementById('board');
  		var center={x:canvas.width/2,y:canvas.height/2};

  		var zoom=Session.get("zoom");
  		if (Session.get("line_id")) {
  			board.pushPoint(Session.get("line_id"), (e.insideX-center.x)/zoom, (e.insideY-center.y)/zoom );
  		} else {
  			Session.set("line_id", board.insertLine(Session.get("color"), 6, (previousTouchPosition.x-center.x)/zoom, (previousTouchPosition.y-center.y)/zoom, (e.insideX-center.x)/zoom, (e.insideY-center.y)/zoom )  );
  			Meteor.call("boardUpdated", Session.get("board_key") , function(error, ret){
 					console.log("boardUpdated error="+error+" ret="+ret);
				});
  		}

  	}

		previousTouchPosition={x:e.insideX,y:e.insideY};
	}
	e.preventDefault();
}
function mpTouchEnd(e) {
	// No need of the touch coordinates
	//convertTouchEvent(e);
	//console.log("mpTouchEnd "+e.insideX+","+e.insideY);
	resetLine();
	e.preventDefault();
}

var previousTouchPosition;
resetLine();
function resetLine() {
	previousTouchPosition=false;
	Session.set("line_id",false);
}


