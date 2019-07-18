/*

Javasript to handle mouse dragging and release
to drag a string around the html canvas
Keyboard arrow keys are used to move a moving box around
(The mouse co-ordinates are wrong if the canvas is scrolled with scroll bars.
 Exercise: can you fix this?)

Here we are doing all the work with javascript and jQuery. (none of the words
are HTML, or DOM, elements. The only DOM element is just the canvas on which
where are drawing.

This example shows examples of using JQuery
JQuery syntax:
$(selector).action();
e.g.
$(this).hide() - hides the current element.
$("p").hide() - hides all <p> elements.
$(".test").hide() - hides all elements with class="test".
$("#test").hide() - hides the element with id="test".

Mouse event handlers are being added and removed using jQuery and
a jQuery event object is being passed to the handlers

Keyboard keyDown handler is being used to move a "moving box" around

Notice in the .html source file there are no pre-attached handlers.
*/

//Use javascript array of objects to represent words and their locations
var words = [];
//words.push({ word: "I", x: 50, y: 50 });
//words.push({ word: "like", x: 70, y: 50 });
//words.push({ word: "the", x: 120, y: 50 });
///words.push({ word: "way", x: 170, y: 50 });
//words.push({ word: "your", x: 230, y: 50 });
//words.push({ word: "sparkling", x: 300, y: 50 });
//words.push({ word: "earings", x: 430, y: 50 });
//words.push({ word: "lay", x: 530, y: 50 });

/**var movingString = {
  word: "Moving",
  x: 100,
  y: 100,
  xDirection: 1, //+1 for leftwards, -1 for rightwards
  yDirection: 1, //+1 for downwards, -1 for upwards
  stringWidth: 50, //will be updated when drawn
  stringHeight: 24
}; //assumed height based on drawing point size
**/
//intended for keyboard control
//connect to server and retain the socket
var socket = io('http://' + window.document.location.host)
//var socket = io('http://localhost:3000')

socket.on('blueBoxData', function(data) {
  console.log("data: " + data);
  console.log("typeof: " + typeof data);
  var locationData = JSON.parse(data);
  //var locationData = data;
  movingBox.x = locationData.x;
  movingBox.y = locationData.y;
  movingBox2.x = locationData.x2;
  movingBox2.y = locationData.y2;
  //drawCanvas();
})

socket.on('PlayerData', function(data) {
  console.log("data: " + data);
  console.log("typeof: " + typeof data);
  var Pdata = JSON.parse(data);
  //var locationData = data;
  player1.name = Pdata.n1;
  player2.name = Pdata.n2;
  player1.isPlaying = Pdata.i1;
  player2.isPlaying = Pdata.i2;
  player1.score = Pdata.s1;
  player2.score = Pdata.s2;
  //drawCanvas();
})

socket.on('BallData', function(data) {
  //console.log("data: " + data);
  //console.log("typeof: " + typeof data);
  var Bdata = JSON.parse(data);
  //var locationData = data;
  movingBall.x = Bdata.x;
  movingBall.y = Bdata.y;
  movingBall.xDirection = Bdata.xd;
  movingBall.yDirection = Bdata.yd;
  //drawCanvas();
})

socket.on('disconnect', function() {
  if(control==2)
  {
	  player1.isPlaying=0;
	  player1.name='Player A';
	  player1.score=0;
	  alert("ONE Player Left room!");
  }else if(control==1)
  {
	  player2.isPlaying=0;
	  player2.name='Player B';
	  player2.score=0;
	  alert("ONE Player Left room!");
  }
  console.log("DISCONNECT!");
})

var movingBox = {
  x: 200,
  y: 250,
  width: 100,
  height: 100,
  radius: 50
};

var movingBox2 = {
  x: 800,
  y: 250,
  width: 100,
  height: 100,
  radius: 50
};


var timer; //used to control the free moving word
var wordBeingMoved; //word being dragged by mouse
var wordTargetRect = { x: 0, y: 0, width: 0, height: 0 }; //bounding box around word being targeted
var control;//control of access
var deltaX, deltaY; //location where mouse is pressed
var canvas = document.getElementById("canvas1"); //our drawing canvas
var fontPointSize = 18; //point size for word text
var wordHeight = 20; //estimated height of a string in the editor
var editorFont = "Arial"; //font for your editor
var hostNum;

var movingBall = {
  x :canvas.width /2,
  y :canvas.height/2,
  radius :25,
  xDirection:0,
  yDirection:0,
};

/* score border*/

var player1 ={
	score : 0,
	name:'Player A',
	x :240,
	y :canvas.height,
	isPlaying :0
	
};
var player2 ={
	score : 0,
	name:'Player B',
	x :840,
	y :canvas.height,
	isPlaying :0
};
var numOfplayer = 0;
/*score border*/

var leftBorder ={
  x: 0,
  y: canvas.height/2 -90,
  width:5,
  height : 180
};
var rightBorder ={
  x: canvas.width-5,
  y: canvas.height/2 -90,
  width:5,
  height : 180
};

function getWordAtLocation(aCanvasX, aCanvasY) {
  //locate the word targeted by aCanvasX, aCanvasY
  //find a word whose bounding box contains location (aCanvasX, aCanvasY)

  var context = canvas.getContext("2d");

  for (var i = 0; i < words.length; i++) {
    var wordWidth = context.measureText(words[i].word).width;
    if (
      aCanvasX > words[i].x &&
      aCanvasX < words[i].x + wordWidth &&
      (aCanvasY > words[i].y - wordHeight && aCanvasY < words[i].y)
    ) {
      //set word targeting rectangle for debugging display
      wordTargetRect = {
        x: words[i].x,
        y: words[i].y - wordHeight,
        width: wordWidth,
        height: wordHeight
      };
      return words[i]; //return the word found
    }
  }
}

var drawCanvas = function() {
  var context = canvas.getContext("2d");

  context.fillStyle = "#fff2e6";
  context.fillRect(0, 0, canvas.width, canvas.height); //erase canvas
  //var img = document.getElementById("back2");
  //context.drawImage(img,1200,600);
  context.font = "" + fontPointSize + "pt " + editorFont;
  context.fillStyle = "cornflowerblue";
  context.strokeStyle = "blue";

  for (var i = 0; i < words.length; i++) {
    var data = words[i];
    context.fillText(data.word, data.x, data.y);
    context.strokeText(data.word, data.x, data.y);
  }

 // movingBall.stringWidth = context.measureText(movingBall.word).width;
  //context.fillText(movingBall.word, movingBall.x, movingBall.y);
  /* draw vertical line */
	var c = document.getElementById("canvas1");
	var ctx = c.getContext("2d");
	ctx.beginPath();
	ctx.moveTo(600, 0);
	ctx.lineTo(600, 600);
	ctx.stroke();

  //draw moving box
  //context.fillRect(movingBox.x, movingBox.y, movingBox.width, movingBox.height);
  //context.fillRect(movingBox2.x, movingBox2.y, movingBox2.width, movingBox2.height);
 // context.fillStyle = "white";
  //draw score border

  context.fillText(player1.score, player1.x, player1.y-5);
  context.fillText(player2.score, player2.x, player2.y-5);
  context.fillText(player1.name, player1.x-25, 25);
  context.fillText(player2.name, player2.x-25, 25);
  //draw circle
  context.beginPath();
  context.arc(
    0, //x co-ord
    canvas.height/2 , //y co-ord
    90, //radius
    0, //start angle
    2 * Math.PI //end angle
  );context.lineWidth = 3;
  context.strokeStyle = "cornflowerblue";
  context.stroke();
  context.beginPath();
  context.arc(
    canvas.width, //x co-ord
    canvas.height/2 , //y co-ord
    90, //radius
    0, //start angle
    2 * Math.PI );//end angle
  context.strokeStyle = "cornflowerblue";
  context.lineWidth = 3;
  context.stroke();

  context.beginPath();
  context.arc(
    movingBall.x, //x co-ord
    movingBall.y , //y co-ord
    movingBall.radius, //radius
    0, //start angle
    2 * Math.PI );//end angle
  context.strokeStyle = "#737373";
  context.fillStyle = "#737373";
  context.closePath();
  context.fill();
  context.stroke();
  context.beginPath();
  context.arc(
    movingBox.x, //x co-ord
    movingBox.y , //y co-ord
    movingBox.radius, //radius
    0, //start angle
    2 * Math.PI //end angle
  );context.lineWidth = 3;
  context.fillStyle = "#ff944d";
  context.fill();
  context.beginPath();
  context.arc(
    movingBox2.x, //x co-ord
    movingBox2.y , //y co-ord
    movingBox2.radius, //radius
    0, //start angle
    2 * Math.PI //end angle
  );context.lineWidth = 3;
  context.fillStyle = "#79d2a6";
  context.fill();
  context.fillRect(leftBorder.x,leftBorder.y,leftBorder.width,leftBorder.height);
  context.fillRect(rightBorder.x,rightBorder.y,rightBorder.width,rightBorder.height);
  context.fillStyle = "#ff4d4d";
  //draw box around word last targeted with mouse -for debugging

  context.strokeStyle = "red";
  context.strokeRect(
    wordTargetRect.x,
    wordTargetRect.y,
    wordTargetRect.width,
    wordTargetRect.height
  );
};

function handleMouseDown(e) {
  //get mouse location relative to canvas top left
  var rect = canvas.getBoundingClientRect();
  //var canvasX = e.clientX - rect.left;
  //var canvasY = e.clientY - rect.top;
  var canvasX = e.pageX - rect.left; //use jQuery event object pageX and pageY
  var canvasY = e.pageY - rect.top;
  console.log("mouse down:" + canvasX + ", " + canvasY);

  wordBeingMoved = getWordAtLocation(canvasX, canvasY);
  //console.log(wordBeingMoved.word);
  if (wordBeingMoved != null) {
    deltaX = wordBeingMoved.x - canvasX;
    deltaY = wordBeingMoved.y - canvasY;
    //attache mouse move and mouse up handlers
    $("#canvas1").mousemove(handleMouseMove);
    $("#canvas1").mouseup(handleMouseUp);
  }

  // Stop propagation of the event and stop any default
  //  browser action
  e.stopPropagation();
  e.preventDefault();

  //drawCanvas();
}

function handleMouseMove(e) {
  console.log("mouse move");

  //get mouse location relative to canvas top left
  var rect = canvas.getBoundingClientRect();
  var canvasX = e.pageX - rect.left;
  var canvasY = e.pageY - rect.top;

  wordBeingMoved.x = canvasX + deltaX;
  wordBeingMoved.y = canvasY + deltaY;

  e.stopPropagation();

  //drawCanvas();
}

function handleMouseUp(e) {
  console.log("mouse up");
  e.stopPropagation();

  //remove mouse move and mouse up handlers but leave mouse down handler
  $("#canvas1").off("mousemove", handleMouseMove); //remove mouse move handler
  $("#canvas1").off("mouseup", handleMouseUp); //remove mouse up handler

  //drawCanvas(); //redraw the canvas
}

//JQuery Ready function -called when HTML has been parsed and DOM
//created
//can also be just $(function(){...});
//much JQuery code will go in here because the DOM will have been loaded by the time
//this runs

function handleTimer() {
  movingBall.x = movingBall.x + 8 * movingBall.xDirection;
  movingBall.y = movingBall.y + 8 * movingBall.yDirection;

  //keep moving word within bounds of canvas
  if (movingBall.x + movingBall.radius > canvas.width -rightBorder.width)   {if(movingBall.y<rightBorder.y+180 && movingBall.y>rightBorder.y){hitBord=0; player1.score++;}movingBall.xDirection = -1;}
  if (movingBall.x - movingBall.radius < leftBorder.x ) 					{if(movingBall.y<leftBorder.y+180 && movingBall.y>leftBorder.y){hitBord=1; player2.score++;}movingBall.xDirection = 1;}
  if (movingBall.y + movingBall.radius > canvas.height) 					{movingBall.yDirection = -1;}
  if (movingBall.y - movingBall.radius < 0)             					{movingBall.yDirection = 1;}
  
  //calculate the 
  xdis1 = movingBall.x - movingBox.x;
  xdis2 = movingBall.x - movingBox2.x;
  ydis1 = movingBall.y -movingBox.y;
  ydis2 = movingBall.y -movingBox2.y;
  distance1 = Math.pow((xdis1*xdis1+ydis1*ydis1),0.5);
  distance2 = Math.pow((xdis2*xdis2+ydis2*ydis2),0.5);
  if(distance1 < movingBall.radius+movingBox.radius)
  {
    if(xdis1<0 && ydis1 <0){movingBall.yDirection = -1;movingBall.xDirection = 1;}
    if(xdis1>0 && ydis1 <0){movingBall.yDirection = -1;movingBall.xDirection = -1;}
    if(xdis1<0 && ydis1 >0){movingBall.yDirection = 1;movingBall.xDirection = 1;}
    if(xdis1>0 && ydis1 >0){movingBall.yDirection = 1;movingBall.xDirection = -1;}
    if(xdis1 == 0 && ydis1>0){movingBall.yDirection = 1;}
    if(xdis1 == 0 && ydis1<0){movingBall.yDirection = -1;}
    if(ydis1 == 0 && xdis1>0){movingBall.xDirection = 1;}
    if(ydis1 == 0 && xdis1<0){movingBall.xDirection = -1;}
  }
  if(distance2 < movingBall.radius+movingBox2.radius)
  {
    if(xdis2<0 && ydis2 <0){movingBall.yDirection = -1;movingBall.xDirection = 1;}
    if(xdis2>0 && ydis2 <0){movingBall.yDirection = -1;movingBall.xDirection = -1;}
    if(xdis2<0 && ydis2 >0){movingBall.yDirection = 1;movingBall.xDirection = 1;}
    if(xdis2>0 && ydis2 >0){movingBall.yDirection = 1;movingBall.xDirection = -1;}
    if(xdis2 == 0 && ydis2>0){movingBall.yDirection = 1;}
    if(xdis2 == 0 && ydis2<0){movingBall.yDirection = -1;}
    if(ydis2 == 0 && xdis2>0){movingBall.xDirection = 1;}
    if(ydis2 == 0 && xdis2<0){movingBall.xDirection = -1;}
  }

 
  drawCanvas();
  var dataObj = { x: movingBall.x, y: movingBall.y, xd:movingBall.xDirection, yd:movingBall.yDirection};
  //create a JSON string representation of the data object
  var jsonString = JSON.stringify(dataObj);
  socket.emit('BallData', jsonString);

}

//KEY CODES
//should clean up these hard coded key codes
var RIGHT_ARROW = 39;
var LEFT_ARROW = 37;
var UP_ARROW = 38;
var DOWN_ARROW = 40;

function handleKeyDown(e) {
  console.log("keydown code = " + e.which);

  var dXY = 10; //amount to move in both X and Y direction
  if (e.which == UP_ARROW && movingBox.y-movingBox.radius>= dXY) 
  {
	if(control==1)
	{
	  movingBox.y -= dXY; //up arrow
	}
	if(control==2)
	{
	  movingBox2.y -= dXY; //up arrow
	}
  }
  
  if (e.which == RIGHT_ARROW && movingBox.x + movingBox.radius + dXY <= canvas.width)
  {
	  if(control==1 && movingBox.x < 550)
	  {
		movingBox.x += dXY; //right arrow
	  }
	  if(control==2)
	  {
		movingBox2.x += dXY; //right arrow
	  }
  }
  
  if (e.which == LEFT_ARROW && movingBox.x-movingBox.radius >= dXY) 
  {
	  if(control==1){
		movingBox.x -= dXY; //left arrow
	  }
	  if(control==2 && movingBox2.x > 650){
		movingBox2.x -= dXY; //left arrow
	  }
  }
  
  if (e.which == DOWN_ARROW && movingBox.y + movingBox.radius + dXY <= canvas.height)
  {
	  if(control==1){
		movingBox.y += dXY; //down arrow
	  }
	  if(control==2){
		movingBox2.y += dXY; //down arrow
	  }
  }
  //upate server with position data
  //may be too much traffic?
  var dataObj = { x: movingBox.x, y: movingBox.y, x2: movingBox2.x, y2: movingBox2.y};
  //create a JSON string representation of the data object
  var jsonString = JSON.stringify(dataObj);

  //update the server with a new location of the moving box
  socket.emit('blueBoxData', jsonString)
  
  	var dataObj2 = { n1: player1.name, n2: player2.name, i1: player1.isPlaying, i2: player2.isPlaying, s1: player1.score, s2: player2.score};
	var jsonString2 = JSON.stringify(dataObj2);
	socket.emit('PlayerData', jsonString2)
}

function handleKeyUp(e) {
  console.log("key UP: " + e.which);
  var dataObj = { x: movingBox.x, y: movingBox.y, x2: movingBox2.x, y2: movingBox2.y};
  //create a JSON string representation of the data object
  var jsonString = JSON.stringify(dataObj);
  socket.emit('blueBoxData', jsonString)
  	var dataObj2 = { n1: player1.name, n2: player2.name, i1: player1.isPlaying, i2: player2.isPlaying, s1: player1.score, s2: player2.score};
	var jsonString2 = JSON.stringify(dataObj2);
	socket.emit('PlayerData', jsonString2)
}

function refresh() {

}


//update username
function handleSubmitButton () {
    var userText = $('#userTextField').val(); //get text from user text input field
	
    if (userText && userText != '') {
		if(player1.isPlaying == 0)
		{
			player1.name = userText;
			player1.isPlaying = 1;
			control = 1;
			document.getElementById("SubmitButton").disabled = true;// no more dumplicate name
			alert("You are Player A now! (left side)");
		}
		else if(player1.isPlaying == 1 && player2.isPlaying == 0)
		{
			player2.name = userText;
			player2.isPlaying = 1;
			control = 2;
			document.getElementById("SubmitButton").disabled = true;// no more dumplicate name
			alert("You are Player B now! (right side)");
		}else if(player1.isPlaying == 1 && player2.isPlaying == 1)
		{
			alert("Full player!!!");
		}
		
	}	
	//drawCanvas();
	var dataObj = { n1: player1.name, n2: player2.name, i1: player1.isPlaying, i2: player2.isPlaying, s1: player1.score, s2: player2.score};
	var jsonString = JSON.stringify(dataObj);
	socket.emit('PlayerData', jsonString)
}



$(document).ready(function() {
  //add mouse down listener to our canvas object
  $("#canvas1").mousedown(handleMouseDown);
  //add keyboard handler to document
  $(document).keydown(handleKeyDown);
  $(document).keyup(handleKeyUp);
  //refresh();
  timer = setInterval(handleTimer, 30); //tenth of second
  //timer.clearInterval(); //to stop

  //drawCanvas();
});