var c=document.getElementById("myCanvas");

var ctx=c.getContext("2d");

var qtc = document.getElementById("quadcanvas");

var w = 20;
var h = 15;

var pressure = new Array();
var velocity = new Array();

for (var i = 0; i < w; i++) {
	pressure[i] = new Array();
	velocity[i] = new Array();
	for (var j = 0; j < h; j++) {
		pressure[i][j] = 0;
		velocity[i][j] = new Vector(0, 0);
	}
}

var source = new Vector(Math.floor(w/2), Math.floor(h/2));

// phi is delta in the source pressure
// dt is delta t
// diff is the diffusion rate constant
function update(phi, dt, diff) {
	
	// propagate pressure
	// make new pressure array
	var newpressure = new Array();
	for (var i = 0; i < w; i++) {
		newpressure[i] = new Array();
		for (var j = 0; j < h; j++) {
			newpressure[i][j] = pressure[i][j];
		}
	}

	newpressure[source.x][source.y] += phi;
	
	for (var i = 1; i < w - 1; i++) {
		for (var j = 1; j < h - 1; j++) {
			newpressure[i][j] += diff * (pressure[i-1][j] + pressure[i+1][j] + pressure[i][j-1] + pressure[i][j+1] - 4*pressure[i][j]);
		}
	}
	// do edge cases (only 3 or 2 neighbors)
	newpressure[0][0] += diff*(pressure[0][1] + pressure[1][0] - 2 * pressure[0][0]);
	newpressure[w-1][0] += diff*(pressure[w-1][1] + pressure[w-2][0] - 2 * pressure[w-1][0]);
	newpressure[0][h-1] += diff*(pressure[0][h-2] + pressure[1][h-1] - 2 * pressure[0][h-1]);
	newpressure[w-1][h-1] += diff*(pressure[w-1][h-2] + pressure[w-2][h-1] - 2 * pressure[w-1][h-1]);

	for (var i = 1; i < w -1; i++) {
		//if (i == 10) debugger;
		newpressure[i][0] += diff*(pressure[i + 1][0] + pressure[i-1][0] + pressure[i][1] - 3 * pressure[i][0]);
		newpressure[i][h-1] += diff*(pressure[i+1][h-1] + pressure[i-1][h-1] + pressure[i][h-2] - 3 * pressure[i][h-1]);
	}

	for (var i = 1; i < h -1; i++) {
		newpressure[0][i] += diff*(pressure[0][i + 1] + pressure[0][i-1] + pressure[1][i] - 3 * pressure[0][i]);
		newpressure[w-1][i] += diff*(pressure[w-1][i+1] + pressure[w-1][i-1] + pressure[w-2][i] - 3 * pressure[w-1][i]);
	}


	// check for conservation of pressure (we want conservative fields)
	var prevTotal = 0;
	var curTotal = 0;
	for (var i = 0; i < w; i++) {
		for (var j = 0; j < h; j++) {
			prevTotal += pressure[i][j];
			curTotal += newpressure[i][j];
		}
	}
	if (Math.abs(prevTotal - (curTotal- phi))  > .0001) {
		console.log("pressure not conserved for diffuse! Old pressure: ", prevTotal, " New pressure - phi: ", curTotal - phi);
	} else {
		console.log("pressure conserved for diffuse!");
	}
	pressure = newpressure;
	var newpressure = new Array();
  for (var i = 0; i < w; i++) {
    newpressure[i] = new Array();
    for (var j = 0; j < h; j++) {
      newpressure[i][j] = pressure[i][j];
    }
  }
	// advect (aka propagate density through previous velocity field)	
	var maxDelta = 0;
	var maxPressure = 0;
	for (var i = 0; i < w; i++) {
		for (var j = 0; j < h; j++) {
			if (velocity[i][j].x == 0 && velocity[i][j].y == 0) {
				continue;
			}
			var newi = i - velocity[i][j].x * dt;
			var newj = j - velocity[i][j].y * dt;
			var dx = newi - Math.floor(newi);
			var dy = newj - Math.floor(newj);
			newi = Math.floor(newi);
			newj = Math.floor(newj);
			
			//var delta = getPressure(newi, newj) * (1 - dx) * (1 - dy) + getPressure(newi + 1, newj) * dx * (1 - dy) + getPressure(newi, newj + 1) * (1 - dx) * dy + getPressure(newi + 1, newj + 1) * dx * dy;
			//newpressure[i][j] += delta;

			// make it conserve pressure
			var delta = getPressure(newi, newj) * (1 - dx) * (1 - dy);
			if (delta > 0) {
				newpressure[i][j] += delta;
				newpressure[newi][newj] -= delta;
			}
			delta = getPressure(newi + 1, newj) * dx * (1 - dy);
      if (delta > 0) {
        newpressure[i][j] += delta;
        newpressure[newi + 1][newj] -= delta;
      }
			delta = getPressure(newi, newj + 1) * (1 - dx) * dy;
      if (delta > 0) {
        newpressure[i][j] += delta;
        newpressure[newi][newj + 1] -= delta;
      }
			delta = getPressure(newi + 1, newj + 1) * dx * dy;
      if (delta > 0) {
        newpressure[i][j] += delta;
        newpressure[newi + 1][newj + 1] -= delta;
      }

			maxDelta = Math.max(Math.abs(delta), maxDelta);
			maxPressure = Math.max(Math.abs(pressure[i][j]), maxPressure);
		}
	}
	prevTotal = 0;
	curTotal = 0;
	for (var i = 0; i < w; i++) {
		for (var j = 0; j < h; j++) {
			prevTotal += pressure[i][j];
			curTotal += newpressure[i][j];
		}
	}
	if (Math.abs(prevTotal - curTotal)  > .0001) {
		console.log("pressure not conserved for advect! Old pressure: ", prevTotal, " New pressure: ", curTotal);
	} else {
		console.log("pressure conserved for advect!");
	}

	pressure = newpressure;

	// pressure is set!  now use it to create velocity field
	// velocity changes to follow pressure gradient
	for (var i = 0 ; i < w; i++) {
		for (var j = 0; j < h; j++) {
			var delta = new Vector(getPressure(i - 1, j) - getPressure(i + 1, j), getPressure(i, j - 1) - getPressure(i, j + 1));
			delta.mul(dt);
			velocity[i][j].add(delta);
		}
	}
	enforceVelocityBoundaries();
}

function enforceVelocityBoundaries() {
	// asdf
}



function draw() {
	// refreshes the display
	var width = 640;
	var height = 480; //TODO make this not hacky
	var cellWidth = Math.floor(width / w);
	var cellHeight = Math.floor(height / h);
	ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);
	// draw the pressure function first and then the velocity vector
	var basePressureColor = 48;
	var maxPressureColor = 255;
	var maxLength = 0;
	var maxPressure = -100100;
	var minPressure = 100000;
	for (var i = 0; i < w; i++) {
		for (var j = 0; j < h; j++) {
			maxLength = Math.max(maxLength, velocity[i][j].len());
			maxPressure = Math.max(maxPressure, pressure[i][j]);
			minPressure = Math.min(minPressure, pressure[i][j]);
		}
	}
	var scale = Math.min(cellWidth, cellHeight) / 2;
	if (maxLength != 0) scale /= maxLength;
	for (var i = 0; i < w; i++) {
		for (var j = 0; j < h; j++) {
			var p = pressure[i][j];
			if (maxPressure == minPressure) {
				p = 1;
			}
			else {
				p -= minPressure;
				p /= (maxPressure - minPressure);
			}
			var newstyle = getPressureStyle(p, basePressureColor, maxPressureColor);
			ctx.fillStyle = newstyle;
			//ctx.fillStyle = "#888888";
			ctx.font = "18pt Arial";
			ctx.fillRect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);
			ctx.fillStyle = "#FF0000";
			ctx.strokeStyle = "#FF0000";
			ctx.beginPath();
			ctx.arc((i + .5) * cellWidth, (j + .5) * cellHeight, 2, 0, Math.PI * 2);
			ctx.fill();
			ctx.beginPath();
			ctx.moveTo((i + .5) * cellWidth, (j + .5) * cellHeight);
			ctx.lineTo((i + .5) * cellWidth + velocity[i][j].x * scale, (j + .5) * cellHeight + velocity[i][j].y * scale);
			ctx.stroke();
		}
	}

	// draw the grid lines
	ctx.strokeStyle = "#000000";
	for (var i = 1; i < w; i++) {
		ctx.moveTo(i * cellWidth, 0);
		ctx.lineTo(i * cellWidth, height);
		ctx.stroke();
	}
	for (var i = 1; i < h; i++) {
		ctx.moveTo(0, i * cellHeight);
		ctx.lineTo(width, i * cellHeight);
		ctx.stroke();
	}
}

function getPressure(i, j) {
	if (i < 0 || i >= w || j < 0 || j >= h) return 0;
	else return pressure[i][j];
}

function getPressureStyle(u, baseP, maxP) {
	var color = u * maxP + (1 - u ) * baseP;
	//console.log(u);
	var s = "#";
  var hex = "" + getHexDigit(color / 16) + getHexDigit(color % 16);
	return s + hex + hex + hex;
}

function getHexDigit(i) {
	i = Math.floor(i);
	if (i < 10) return String.fromCharCode('0'.charCodeAt(0) + i);
  else return String.fromCharCode('A'.charCodeAt(0) + (i - 10));
}

function Vector(x, y) {
	this.x = x;
	this.y = y;
}

Vector.prototype.len = function() {
	return Math.sqrt(this.x * this.x + this.y * this.y);
};

Vector.prototype.mul = function(a) {
	this.x *= a;
	this.y *= a;
};

Vector.prototype.add = function(a) {
	this.x += a.x;
	this.y += a.y;
}

$(document).keydown( function(event) {
    var code  = event.keyCode || event.which;
    if (code == 32) {
			update(10, .1, .1);
			draw();
            updateQuad();
            drawQuad();
    }
}

);

draw();
drawQuad();

function updateQuad() {

}

function drawQuad() {

}
//FOR TESTIN
