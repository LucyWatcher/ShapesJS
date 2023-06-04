//function to return mouse position over the canvas
function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

//clamp function clamp(num, min, max);
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

//init settings ================================================================
var drawInterval = 20;        //interval between drawing a frame onscreen. 16 is around 60fps
var playbackSpeed = 2;        //some animations are looping. how long (seconds) should they take to iterate?
var animationDivisions = 1;   //how many times should the sinusoidal animation loop throughout the objects of the box?
var divisions = 5;            //how many divisions ought to be made in the canvas for shapes
var drawIteration = 0;        //defaults at zero. just keeps track of which draw iteration we are on
var pushScale = 40;           //amount that mouse should push the orbs

//init 2D canvas drawing =======================================================
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

var mousePos = {x:"0",y:"0"}; //init to avoid errors
function handleMouse(event) { //function to update mouse position
  mousePos = getMousePos(canvas, event);
}

//use the pythagorean theorum to calculate the 2D distance to a target
//scale is what to divide the pixel distance by. IE: if you want 800 pixels to render as 1 'unit' away
//output is always between 0 and 1!
function Distance2D(x, y, targetX, targetY, scale) {
   var c2 = Math.pow(targetX-x,2)+Math.pow(targetY-y,2);
   var linearDistance =  Math.pow(c2, 0.5)/scale;
   linearDistance = clamp(linearDistance, -1, 1);
   return linearDistance;
}

//draw() is run every 'drawInterval' miliseconds, upon script initialization ===
function draw(event) {

  ctx.clearRect(0, 0, canvas.width, canvas.height); //clear the canvas between each frame

  var secondsPassed = (drawIteration*drawInterval)/1000;                //total draw() runtime seconds
  var secondsPercentage = (secondsPassed%playbackSpeed)/playbackSpeed;  //percentage completeled of current animation cycle according to secondsPassed vs playbackSpeed
  var drawSine = Math.sin( (Math.PI*2)*secondsPercentage );             //sine wave that oscilates every 'playbackSpeed' seconds.
  var canvasWidth = canvas.getBoundingClientRect().width;               //if canvas width and height are equal we only need to get one.
  var segmentSize = canvasWidth/divisions;                              //logical pixel size of each segment in the canvas

  for (let col = 0; col < divisions; col++) {
    for (let row = 0; row < divisions; row++) {

      //logical math -----------------------------------------------------------

      //returns a percentage of PI*2, where the percentage is equal to the percentage of total shapes drawn OUT OF all shapes to be drawn.
      var piDivisions = ((Math.PI*2)/Math.pow(divisions,2)) * (col*divisions+row);
      //same as above, but this value should continuously shift the fucntion start offset, so that every 'playbackSpeed' seconds, the offset loops back to zero.
      var piDivisionsWithOffset = ( piDivisions+((Math.PI*2)*secondsPercentage) )%(Math.PI*2);
      //this half sine should loop 'animationDivisions' times, by the end of all desired objects being drawn on screen.
      var uniqueSine = Math.sin( (piDivisions*animationDivisions)%(Math.PI*2) );
      //this half sine is the same as above, but should continuously shift its start offset, so that every 'playbackSpeed' seconds, the offset loops back to zero!
      var uniqueSineWithOffset = Math.sin( (piDivisionsWithOffset*animationDivisions)%(Math.PI*2) );

      //draw settings ----------------------------------------------------------

      //how many pixels each circle should be away from touching its neighbors?
      //i figure this should only let the circle drop to half it's radius.
      var sizeOffset = uniqueSineWithOffset*(segmentSize/8)+segmentSize/8;

      var desiredX = (segmentSize*row)+(segmentSize/2);
      var desiredY = (segmentSize*col)+(segmentSize/2);

      if (pushScale != 0) {
        //move the the desired locations of the circles away from the user's mouse...
        //this requires 2D vector math:
        let vectorDirection = Math.atan2((mousePos.y-desiredY), (mousePos.x-desiredX));
        let vectorAmplitude = Distance2D(desiredX, desiredY, mousePos.x, mousePos.y, 300);

        //maxking the amplitude have exponential falloff so it looks smoother
        vectorAmplitude = (Math.pow(vectorAmplitude, (pushScale-0.1)/pushScale))-1

        //calculate new 2D vector using inverted-direction and amplitude
        let mousePushX = (vectorAmplitude*pushScale)*Math.cos(vectorDirection);
        let mousePushY = (vectorAmplitude*pushScale)*Math.sin(vectorDirection);

        desiredX = desiredX+mousePushX;
        desiredY = desiredY+mousePushY;
      }


      var desiredRadius = (segmentSize/2)-sizeOffset;
      var color = "rgb(255, 165, 0)";

      //render -----------------------------------------------------------------
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(desiredX+desiredRadius, desiredY);
      ctx.arc(desiredX, desiredY, desiredRadius, 0, Math.PI * 2, false);
      ctx.fill();
      ctx.stroke();

    }
  }

  drawIteration++;
  //end my draw() function here
}


//Program initialization -------------------------------------------------------

//update animation settings when a desired change is detected
function updateSettings(event) {
  console.log(event.srcElement.id);
  switch (event.srcElement.id)
  {
    case 'playbackSpeed': //Input with ID playbackSpeed should:
      playbackSpeed = event.srcElement.value; //set var "playbackSpeed"
      var displayarg = Number.parseFloat(playbackSpeed).toFixed(2); // and update label for="playbackSpeed":
      document.querySelector('[for="playbackSpeed"]').innerHTML = " ["+displayarg+"] - the time required to loop the full pulse-animation, in seconds";
      break;

    case 'animationDivisions': //Input with ID animationDivisions should:
      animationDivisions = event.srcElement.value; //set var "animationDivisions"
      var displayarg = Number.parseFloat(animationDivisions).toFixed(2); // and update label for="animationDivisions":
      document.querySelector('[for="animationDivisions"]').innerHTML = " ["+displayarg+"] - how many times the pulsing animation should loop within this box";
      break;

    case 'divisions': //Input with ID divisions should:
      divisions = event.srcElement.value; //set var "divisions"
      var displayarg = Number.parseFloat(divisions).toFixed(2); // and update label for="divisions":
      document.querySelector('[for="divisions"]').innerHTML = " ["+displayarg+"] - how many pulsing circles to divide the box into";
      break;

    case 'pushScale': //Input with ID pushScale should:
      pushScale = event.srcElement.value; //set var "pushScale"
      var displayarg = Number.parseFloat(pushScale).toFixed(2); // and update label for="pushScale":
      document.querySelector('[for="pushScale"]').innerHTML = " ["+displayarg+"] - how much the mouse should push away the orbs";
      break;
  }
}

//init function
function shapesinit() {
  //HTML has an 'error message' by default that we need to clear to confirm the js is, in fact, runnning.
  const jserror = document.getElementById('jserror');
  if (jserror != null) {jserror.remove();}

  //ensure the settings box is the same width as the canvas...
  var settingswrapper = document.getElementById('settingswrapper');
  settingswrapper.style.minWidth = canvas.getBoundingClientRect().width+"px";

  //runs draw() every 'drawInterval' ms
  window.setInterval(draw, drawInterval);

  //there are many init varaibles controlling the behavior of this animation.
  //for interactivity, i will expose these variables to user input.
  //create input fields and labels!=============================================
  var items = [];

  //CONTROL for: playbackSpeed
  var item = document.createElement("INPUT");
  item.setAttribute("type", "range");
  item.setAttribute("min", "0.2");
  item.setAttribute("max", "8");
  item.setAttribute("value", "2");
  item.setAttribute("step", "0.1");
  item.id = "playbackSpeed";
  items.push(item);
  var item = document.createElement("LABEL");
  item.setAttribute("for", "playbackSpeed");
  item.innerHTML = " [2.00] - the time required to loop the full pulse-animation, in seconds";
  items.push(item);

  //CONTROL for: animationDivisions
  items.push(document.createElement("BR")); //newline break
  var item = document.createElement("INPUT");
  item.setAttribute("type", "range");
  item.setAttribute("min", "1");
  item.setAttribute("max", "12");
  item.setAttribute("value", "1");
  item.setAttribute("step", "1");
  item.id = "animationDivisions";
  items.push(item);
  var item = document.createElement("LABEL");
  item.setAttribute("for", "animationDivisions");
  item.innerHTML = " [1.00] - how many times the pulsing animation should loop within this box";
  items.push(item);

  //CONTROL for: divisions
  items.push(document.createElement("BR")); //newline break
  var item = document.createElement("INPUT");
  item.setAttribute("type", "range");
  item.setAttribute("min", "2");
  item.setAttribute("max", "16");
  item.setAttribute("value", "5");
  item.setAttribute("step", "1");
  item.id = "divisions";
  items.push(item);
  var item = document.createElement("LABEL");
  item.setAttribute("for", "divisions");
  item.innerHTML = " [5.00] - how many pulsing circles to divide the box into";
  items.push(item);

  //CONTROL for: pushScale
  items.push(document.createElement("BR")); //newline break
  var item = document.createElement("INPUT");
  item.setAttribute("type", "range");
  item.setAttribute("min", "0");
  item.setAttribute("max", "80");
  item.setAttribute("value", "40");
  item.setAttribute("step", "1");
  item.id = "pushScale";
  items.push(item);
  var item = document.createElement("LABEL");
  item.setAttribute("for", "pushScale");
  item.innerHTML = " [10.00] - how much the mouse should push away the orbs";
  items.push(item);



  //append all listeed input fields to the settings box.
  for (let i = 0; i < items.length; i++) {
    let item = items[i];
    settingswrapper.appendChild(item);
    if (item.tagName == 'INPUT') {
      item.addEventListener("input", updateSettings); //add a listener to updateSettings
    }
  }

  //add a mouse position listener to update mouse position over the canvas
  document.addEventListener("mousemove", handleMouse);
}

//if 2D drawings in a canvas is supported, run my init function, upon page load
if (canvas.getContext) {
  window.addEventListener('load', shapesinit);
}
