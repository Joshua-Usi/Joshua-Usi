Array.prototype.lastElement = function() {
	return this[this.length - 1];
}

Array.prototype.pushVector = function(v1, v2, v3) {
	this.push(v1);
	this.push(v2);
	this.push(v3);
}

Array.prototype.pushTriangle = function(v1, v2, v3) {
	this.pushVector(v1[0], v1[1], v1[2]);
	this.pushVector(v2[0], v2[1], v2[2]);
	this.pushVector(v3[0], v3[1], v3[2]);
}

Array.prototype.getVertex = function(index) {
	return [this[index], this[index + 1], this[index + 2]];
}

Array.prototype.copy = Array.prototype.slice;