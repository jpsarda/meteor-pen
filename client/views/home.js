
Session.set("timer",0);
setInterval(function() {
	//console.log(Session.get("timer"))
	Session.set("timer",Session.get("timer")+1);
},3000);


Template.home.events({
	"click #create": function (e,tmp) {
		console.log("click create");
		var input=document.getElementById("createboard");
		if (input.value) {
			window.location.href = "/"+input.value;
		}
	},
	"keydown #createboard": function (e,tmp) {
		console.log("keydown createboard");
		if (e.keyCode == 13) document.getElementById('create').click();
	},
});


Template.home.latestBoards = function (){
	var ret=Boards.find({}, {sort:{updated:-1},limit:666});
	//return ret.fetch();
	return ret;
};

Template.home.timer = function (){
	return Session.get("timer");
};

Template.boardlink.newColor = function (){
	/*
	#666666 old
	#55AA00 new
	*/
	var updated=this.updated;
	if (!updated) updated=0;
	var ratio=(new Date().getTime()-updated)/(10*60*1000);
	if (ratio>1) ratio=1;
	else if (ratio<0) ratio=0;

	ratio=1-ratio;

	var ret="#";

	var start,end,val;

	start = parseInt("66", 16); end = parseInt("55", 16); val=Math.round(start+(end-start)*ratio).toString(16); if (val.length<2) val="0"+val;
	ret+=val;

	start = parseInt("66", 16); end = parseInt("AA", 16); val=Math.round(start+(end-start)*ratio).toString(16); if (val.length<2) val="0"+val;
	ret+=val;

	start = parseInt("66", 16); end = parseInt("00", 16); val=Math.round(start+(end-start)*ratio).toString(16); if (val.length<2) val="0"+val;
	ret+=val;

	return ret;
};

/*
Template.home.reveach = function(context, options) {
	console.log("reveach");
  var fn = options.fn, inverse = options.inverse;
  var ret = "", data;

  if(context && context.length > 0) {
    for(var i=0, j=context.length; i<j; i++) {
      if (data) { data.index = i; }
      ret = ret + fn(context[i], { data: data });
    }
  } else {
    ret = inverse(this);
  }
  console.log(context);
  return ret;
};
*/




