var c=document.getElementById("myCanvas");
var ctx=c.getContext("2d");

var paused = false;
ms = 100;

var frame = 0;



var dist = 20;

var width = 400;
var height = 300;

var deltax;
var deltay;
var prevdeltax;
var prevdeltay;
var points;
var food;
var foodEaten;

function init() {
    deltax = 1;
    deltay = 0;
    prevdeltax = 1;
    prevdeltay = 0;
    points = [{x: 20, y: 140}, {x: 40, y: 140}, {x: 60, y:140}, {x:80, y:140}];
    food = {x:220, y:40};
    foodEaten = 0;
    $(document.getElementById("scorediv")).text("score: " + foodEaten);
}


init();



$(document).keydown( function(event) {
    //console.log(event);
    var code  = event.keyCode || event.which;
    //console.log("deltax before press:" + deltax);
    //console.log("deltay before press:" + deltay);
    if (code == 37) {
        console.log("left arrow");
        if (prevdeltax == 0) {
            deltay = 0;
            deltax = -1;
        }
    } else if (code == 38) {
        console.log("up arrow");
        if (prevdeltay == 0) {
            deltax = 0;
            deltay = -1;
        }
    } else if (code == 39) {
        console.log("right arrow");
        if (prevdeltax == 0) {
            deltay = 0;
            deltax = 1;
        }
    } else if (code == 40) {
        console.log("down arrow");
        if (prevdeltay == 0) {
            deltax = 0;
            deltay = 1;
        }
    } else if (code == 32) {
        if (paused) {
            unpause();
            init();
        }
    }
    //console.log("deltax after press:" + deltax);
    //console.log("deltay after press:" + deltay);
}
);


function unpause() {
    if (paused) {
        paused = false;
        setTimeout(loop,10);
        ctx.globalAlpha = 1;
    }
}

function pause() {
    paused = true;//hope no thread conflicts here; at worst would just loop another time
}

function loop() {
    time = -new Date().getTime();
    update();

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0,0,width, height);

    draw();

    if (paused) {
        ctx.fillStyle = "#000000";
        ctx.globalAlpha = .3;
        ctx.fillRect(0,0,width, height);
    }
    
    time += new Date().getTime();


    frame++;
    if (!paused) {
        setTimeout(loop, Math.max(ms - time,0));
    }
}
 	
function update() {
    //console.log("deltax: " + deltax);
    //console.log("deltay: " + deltay);
    var nextx = points[points.length - 1].x + deltax*dist;
    var nexty = points[points.length - 1].y + deltay*dist;

    //check to see if collide with self
    var hitself = false;
    for (var i = 0; i < points.length; i++) {
        point = points[i];
        if (point.x == nextx && point.y == nexty) {
            hitself = true;
            break;
        }
    }
    
    if (nextx < 0 || nextx >= width || nexty < 0 || nexty>= height || hitself) {
        //alert("You lose! Press space to play again.");
        pause();
        return;
    }
    //see if food at next point (not done now)


    if (food.x == nextx && food.y == nexty) {

        points.push({x: nextx, y:nexty});

        foodEaten++;
        $(document.getElementById("scorediv")).text("score: " + foodEaten);	

        var newfoodx, newfoody;
        do {
            newfoodx = Math.floor(Math.random() * width/dist) * dist;
            newfoody = Math.floor(Math.random() * height/dist) * dist;
            console.log("new food: (" + newfoodx + ", " + newfoody + ")");
            inpoints = false;
            for (var i = 0; i < points.length; i++) {
                point = points[i];
                if (point.x == newfoodx && point.y == newfoody) {
                    inpoints = true;
                    break;
                }
            }
        } while (inpoints);

        food.x = newfoodx;
        food.y = newfoody;
    } else {
        points.push({x: nextx, y:nexty});
        points.shift();
    }

    
    prevdeltax = deltax;
    prevdeltay = deltay;
}

function draw() {
    //ctx.fillStyle="#0000FF";
    ctx.fillStyle="#7FFFD4";
    var i;
    for (i = 0; i < points.length; i++) {
        point = points[i];
        ctx.beginPath();
        ctx.arc(point.x + dist/2, point.y + dist/2, dist/2, 0, 2*Math.PI, false);
        ctx.fill();
    }
   //draw food
   ctx.beginPath();
   //ctx.fillStyle = "#00FF00";
   ctx.fillStyle = "#8B008B";
   ctx.arc(food.x + dist/2, food.y + dist/2, dist/2, 0, 2*Math.PI, false);
   ctx.fill();
}

loop();


