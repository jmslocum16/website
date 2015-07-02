var c = document.getElementById("quadcanvas");

var ctx = c.getContext("2d");
var MAXLEVEL = 6;
var root = new Node(0, 640, 0, 640, 0);
function Node(x, x2, y, y2, level) {
	this.x = x;
	this.x2 = x2;
	this.y = y;
	this.y2 = y2;
	this.level = level;
	this.ur = this.ul = this.lr = this.ll = undefined;
	var midx = (x+x2)/2;
	var midy = (y+y2)/2;
	this.color = "#" + toHex(midx/10*4) + toHex(midy/10*4) + "00";
}

function toHex(num) {
	return "" + hexdigit(num/16) + hexdigit(num%16);
}
function hexdigit(digit) {
 	if (digit < 10) return String.fromCharCode('0'.charCodeAt(0) + digit);
  else return String.fromCharCode('A'.charCodeAt(0) + (digit - 10));
}

Node.prototype.split = function() {
	if (this.level === MAXLEVEL) {
		return;
	}
	if (this.ul != undefined) {
		console.log("splitting node with children...?");
		return;
	}
	var midx = (this.x+this.x2)/2;
	var midy = (this.y+this.y2)/2;
	this.ul = new Node(this.x, midx, this.y, midy, this.level + 1);
	this.ur = new Node(midx, this.x2, this.y, midy, this.level + 1);
	this.ll = new Node(this.x, midx, midy, this.y2, this.level + 1);
	this.lr = new Node(midx, this.x2, midy, this.y2, this.level + 1);
}

Node.prototype.find = function(x, y) {
	if (this.ul === undefined) return this;
	var midx = (this.x + this.x2)/2;
	var midy = (this.y + this.y2)/2;
	if (x <= midx && y <= midy) return this.ul.find(x, y);
	else if (midx <= x && y <= midy) return this.ur.find(x, y);
	else if (x <= midx && midy <= y) return this.ll.find(x, y);
	else return this.lr.find(x, y);
}

Node.prototype.draw = function () {
	ctx.fillStyle = this.color;
	ctx.fillRect(this.x, this.y, this.x2, this.y2);
	if (this.ul === undefined) return;	
	this.ul.draw();
	this.ur.draw();
	this.ll.draw();
	this.lr.draw();
	var midx = (this.x+this.x2)/2;
	var midy = (this.y+this.y2)/2;
	drawLine(midx, this.y, midx, this.y2);
	drawLine(this.x, midy, this.x2, midy);
}

function draw() {
	ctx.strokeStyle = "#000000";
	ctx.fillRect(0, 0, 640, 640);
	root.draw();
	ctx.fillStyle = "#FFFFFF";
	drawLine(0, 0, 0, 640);
	drawLine(0, 0, 640, 0);
	drawLine(640, 640, 0, 640);
	drawLine(640, 640, 640, 0);
}

function drawLine(x1, y1, x2, y2) {
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
}

//root.split();
draw();


$(document).ready(function(){
	$("#canvasdiv").click(function(e){
		root.find(e.offsetX, e.offsetY).split();
		draw();
	});
});
