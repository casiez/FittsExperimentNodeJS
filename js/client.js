/**
 * Author: Gery Casiez
 *
 */

window.gvar = {};
var gvar = window.gvar;

document.addEventListener("DOMContentLoaded", function() {

  var socket;

  var id; // participant ID
  var expeData; // all trials obtained from server
  var trialNumber = -1;
  var currTarget; // current target to acquire data
  var last_ts = new Date().getTime();
  var error = 0;
  var results = []; // results to send
  var expeState = "START";
  // For error rate
  var total_err = 0;
  var nbTrialsDone = 0;

  loadjscssfile(window.location + "socket.io/socket.io.js", "js");
  loadjscssfile("//wurfl.io/wurfl.js", "js"); // to get info on the client
  loadjscssfile("js/utils.js", "js");

  whenAvailable(["io"], function() {
    console.log("io and js files loaded");
    // Server communication
    socket = io();
    //socket = io("",{path: "/~casiez/fitts/socket.io"});

    // Get participant ID 
    socket.on('connected', function (data) {
      id = gvar.getCookie('id');
      if (id == null) {
        id = data;
        gvar.setCookie({'id':id},200);
      }
    });

    // Get the trials
    socket.on('trials', function (data) {
      expeData = JSON.parse(data);
      moveToNexttrial();
    });

  });

  // get continueExp button
  var contExpBut = document.getElementById('continueExp');
  contExpBut.onclick = function(e) {
      contExpBut.style.visibility = "hidden";
      expeState = "RUNNING";
      redraw();  
  }

  // get canvas element and create context
  var canvas  = document.getElementById('canvas');
  var context = canvas.getContext('2d');
  var width   = window.innerWidth;
  var height  = window.innerHeight;

  // set canvas to full browser width/height
  canvas.width = width;
  canvas.height = height;

  // Set up touch events for mobile, etc
  canvas.addEventListener("touchstart", function (e) {
    //mousePos = getTouchPos(canvas, e);
    var touch = e.touches[0];
    var mouseEvent = new MouseEvent("mousedown", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
  }, false);
  canvas.addEventListener("touchend", function (e) {
    var mouseEvent = new MouseEvent("mouseup", {});
    canvas.dispatchEvent(mouseEvent);
  }, false);
  canvas.addEventListener("touchmove", function (e) {
    var touch = e.touches[0];
    var mouseEvent = new MouseEvent("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
  }, false);

  // Get the position of a touch relative to the canvas
  function getTouchPos(canvasDom, touchEvent) {
    var rect = canvasDom.getBoundingClientRect();
    return {
      x: touchEvent.touches[0].clientX - rect.left,
      y: touchEvent.touches[0].clientY - rect.top
    };
  }

  window.onresize = function(e){
    width   = window.innerWidth;
    height  = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  };

  // register mouse event handlers
  canvas.onmousedown = function(e){

    // Hack to fix problem with touch screen
    if (e.isTrusted) {
      console.log(e);
      var x = e.offsetX;
      var y = e.offsetY;
      
      if (isInside(x,y)) {
        var ts = new Date().getTime();

        results.push({d: currTarget.d,
                      w: currTarget.w,
                      o: currTarget.o,
                      t: ts - last_ts,
                      err: error});
        last_ts = ts;
        if (error > 0) total_err++;
        nbTrialsDone++;
        error = 0;
        moveToNexttrial();
      } else {
        error++;
      }
      redraw();
    }
  };
   
  canvas.onmouseup = function(e){

  };

  canvas.onmousemove = function(e) {
  
  };

  function moveToNexttrial() {
    trialNumber++;
    if (trialNumber >= expeData.length) {
      expeState = "FINISHED"
      submitResults();
    } else {
      if (expeData[trialNumber].b) {
        expeState = "BREAK";
        contExpBut.style.left = width/2 - contExpBut.offsetWidth/2 + "px";
        contExpBut.style.top = height/2 + "px";
        contExpBut.style.visibility = "visible";
      } else { 
        expeState = "RUNNING";
      }
      var min_dim = Math.min(width, height);
      var d = expeData[trialNumber].d;
      var w = expeData[trialNumber].w;
      var o = expeData[trialNumber].o;
      var radius = d/2*min_dim;
      var s = w*min_dim;
      var x = width/2 + Math.cos(Math.radians(o)) * radius;
      var y = height/2 + Math.sin(Math.radians(o)) * radius;
      currTarget = {d: d, w: w, r: radius, s: s, o: o, x: x, y: y};
    }
    redraw();
  }

  function isInside(x,y) {
    return Math.sqrt((x-currTarget.x)*(x-currTarget.x)+(y-currTarget.y)*(y-currTarget.y)) <= currTarget.s / 2.0;
  }

  function drawTargets(ctx) {
    for (var o = 0; o < 360; o += 30) {
      var x = width/2 + Math.cos(Math.radians(o)) * currTarget.r;
      var y = height/2 + Math.sin(Math.radians(o)) * currTarget.r;
      ctx.beginPath();
      ctx.arc(x,y,currTarget.s/2,0,2*Math.PI);
      if (o == currTarget.o) {
        ctx.fillStyle = "green";
        ctx.strokeStyle = "#003300";
      } else {
        ctx.fillStyle = "#DDDDDD";
        ctx.strokeStyle = "#333333";
      }
      ctx.fill();
      ctx.stroke();
    }
  }

  function redraw () {
    var txt;
    clearScreen();

    if (expeState == "START") {
      txt = "Contacting server...";
      context.font = "30px Georgia";
      context.fillStyle = "black";
      context.fillText(txt,width/2-context.measureText(txt).width/2,height/2);
    } else if (expeState == "FINISHED") {
      txt = "Experiment is finished, thank you!";
      context.font = "30px Georgia";
      context.fillStyle = "black";
      context.fillText(txt,width/2-context.measureText(txt).width/2,height/2); 
    } else if (expeState == "RUNNING"){    
      drawTargets(context)
    } else if (expeState == "BREAK"){
      var err_rate = Math.round(total_err/nbTrialsDone*1000)/10;
      txt = "Your error rate is equal to " + err_rate + " %";
      context.font = "30px Georgia";
      context.fillStyle = "black";
      context.fillText(txt,width/2-context.measureText(txt).width/2,height/4);
    } else {
      console.log("Undefined experiment state");
    } 
  }

  function clearScreen() {
     context.clearRect(0, 0, canvas.width, canvas.height);
  }

  function submitResults() {
    var res = {id: id,
               device_name: WURFL.complete_device_name,
               form_factor: WURFL.form_factor,
               is_mobile: WURFL.is_mobile,
               res: results
             };
    socket.emit('results', JSON.stringify(res));
  }

  function loadjscssfile(filename, filetype){
      //console.log(filename + " loaded");
      if (filetype == "js") {
          var fileref = document.createElement('script')
          fileref.setAttribute("type","text/javascript")
          fileref.setAttribute("src", filename)
      } else if (filetype == "css") {
          var fileref = document.createElement("link")
          fileref.setAttribute("rel", "stylesheet")
          fileref.setAttribute("type", "text/css")
          fileref.setAttribute("href", filename)
      }
      if (typeof fileref != "undefined") {
          document.getElementsByTagName("head")[0].appendChild(fileref);
      }
  }

  function whenAvailable(names, callback) {
      var interval = 10; // ms
      window.setTimeout(function() {
          var all_loaded = true;
          for (var k = 0; k < names.length; k++) {
              if (!window[names[k]]) {
                  all_loaded = false;
              }
          }
          if (all_loaded) {
              callback();
          } else {
              window.setTimeout(arguments.callee, interval);
          }
      }, interval);
  }

  redraw();

});