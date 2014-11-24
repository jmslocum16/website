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
var enemyAlive;
var enemyPoints;
var food;
var foodEaten;
var enemyFoodEaten;
var wonStatus;

function init() {
    deltax = 1;
    deltay = 0;
    prevdeltax = 1;
    prevdeltay = 0;
    points = [{x: 20, y: 140}, {x: 40, y: 140}, {x: 60, y:140}, {x:80, y:140}];
    enemyAlive = true;
		enemyPoints = [{x: 20, y: 220}, {x: 40, y:220}, {x:60, y:220}, {x:80, y: 220}];
    food = {x:220, y:40};
    foodEaten = 0;
    enemyFoodEaten = 0;
    $(document.getElementById("scorediv")).text("score: " + foodEaten);
    $(document.getElementById("enemyscorediv")).text("ai score: " + foodEaten);
    wonStatus = "neither";
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
        ctx.globalAlpha = 1.0;
        var text;
        if (wonStatus === 'won') {
          text = 'You win!';
        } else if ('lost') {
          text = 'You lose :(';
        } else {
          text = 'draw..';
        }
        ctx.font = '40px Georgia';
        ctx.fillText(text, 100, 100);
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
  updateAI();
  updatePlayer();

}

var deltas  = [[1, 0], [-1, 0], [0, 1], [0, -1]];

function updateAI() {
	// do bfs to food
  if (!enemyAlive) return;

  var start = enemyPoints[enemyPoints.length  - 1];

  var movePt = undefined;

  var prev = bfs(start);

  if (prev === null) {
		console.log('no direct path to food, random walk');
    // TODO make move greedily to food
		var next = undefined;
    for (var k = 0; k < 4; k++) {
      var nextx = start.x + deltas[k][0] * dist;
      var nexty = start.y + deltas[k][1] * dist;
			if (validMove(nextx, nexty)) {
        next = {x: nextx, y: nexty};
        break;
      }
    }
    if (next === undefined) {
      // totally trapped
      enemyAlive = false;
      wonStatus = "won";
      pause();
    } else {
      movePt = next;
    }
  } else {
    var foodstr = ptstr(food);
		var movePt = food;
    while (prev[foodstr].x != start.x || prev[foodstr].y != start.y) {
			movePt = prev[foodstr];
      foodstr = ptstr(movePt);
    }
		console.log('best bfs was to move to ', movePt);
  }
  if (movePt !== undefined) {
    move(movePt.x, movePt.y, enemyPoints, false);
    if (enemyFoodEaten == 15) {
      wonStatus = "lost";
      pause();
    }
  }
}

function bfs(start) {
  var queue = [start];
  var prev = {};
  prev[ptstr(start)] = 'done';
  while (queue.length > 0) {
    var cur = queue.shift();
    for (var k = 0; k < 4; k++) {
      var nextx = cur.x + deltas[k][0] * dist;
      var nexty = cur.y + deltas[k][1] * dist;
      var nextstr = ptstr({x: nextx, y: nexty});
			if (!(nextstr in prev) && validMove(nextx, nexty)) {
        queue.push({x: nextx, y: nexty});
        prev[nextstr] = cur;
        if (nextx == food.x && nexty == food.y) {
          console.log('found food!');
          return prev;
        }
      }
    }
  }
  console.log('food is nowhere to be found');
  return null;
}

function ptstr(pt) {
  return pt.x + "," + pt.y;
}

function updatePlayer() {
  var nextx = points[points.length - 1].x + deltax*dist;
  var nexty = points[points.length - 1].y + deltay*dist;

  //check to see if valid
  if (!validMove(nextx, nexty)) { 
    //alert("You lose! Press space to play again.");
    //pause();
    wonStatus = "lost";
    pause();
  } else {
    move(nextx, nexty, points, true);
    prevdeltax = deltax;
    prevdeltay = deltay;
    if (foodEaten == 15) {
      wonStatus = "won";
      pause();
    }
  }
}

function move(nextx, nexty, pts, addToScore) {
  if (food.x == nextx && food.y == nexty) {
    pts.push({x: nextx, y:nexty});
    if (addToScore) {
      foodEaten++;
      $(document.getElementById("scorediv")).text("score: " + foodEaten);	
    } else {
      enemyFoodEaten++;
      $(document.getElementById("enemyscorediv")).text("ai score: " + enemyFoodEaten);	
    }
    getNewFood();
  } else {
    pts.push({x: nextx, y:nexty});
    pts.shift();
  }
}

function validMove(nextx, nexty) {
  if (nextx < 0 || nextx >= width || nexty < 0 || nexty >= height) {
    return false;
  }
  for (var i = 0; i < points.length; i++) {
    point = points[i];
    if (point.x == nextx && point.y == nexty) {
      return false;
    }
  }
  // check to see if hit enemy
  for (var i = 0; i < enemyPoints.length; i++) {
    if (enemyPoints[i].x == nextx && enemyPoints[i].y == nexty) {
      return false;
    }
  }
	return true;
}

function getNewFood() {
  var newfoodx, newfoody, inpoints;
  do {
    newfoodx = Math.floor(Math.random() * width/dist) * dist;
    newfoody = Math.floor(Math.random() * height/dist) * dist;
    inpoints = false;
    for (var i = 0; i < points.length; i++) {
      point = points[i];
      if (point.x == newfoodx && point.y == newfoody) {
        inpoints = true;
        break;
      }
    }
    if (!inpoints) {
      for (var i = 0; i < enemyPoints.length; i++) {
        if (enemyPoints[i].x == newfoodx && enemyPoints[i].y == newfoody) {
          inpoints = true;
          break;
        }
      }
    }
  } while (inpoints);
  console.log("new food: (" + newfoodx + ", " + newfoody + ")");
  food.x = newfoodx;
  food.y = newfoody;
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

  ctx.fillStyle = "#FF7F50";
  for (i = 0; i < enemyPoints.length; i++) {
    ctx.beginPath();
    ctx.arc(enemyPoints[i].x + dist/2, enemyPoints[i].y + dist/2, dist/2, 0, 2*Math.PI, false);
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


