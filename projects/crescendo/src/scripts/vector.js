/* x, y vectors are used alot in this project, therefore it makes sense to make a vector class */
class Vector {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}
	/* clones the vector and creates a new instance */
	clone() {
		return new this.constructor(this.x, this.y);
	}
	/* simple vector methods */
	add(x, y) {
		this.x += x;
		this.y += y;
	}
	subtract(x, y) {
		this.x -= x;
		this.y -= y;
	}
	multiply(x, y) {
		this.x *= x;
		this.y *= y;
	}
	divide(x, y) {
		this.x /= x;
		this.y /= y;
	}
	/* rotates a vector by given radians (clockwise) around the centre point */
	rotate(radians) {
		let x1 = this.x;
		let y1 = this.y;
		this.x = Math.cos(radians) * x1 - Math.sin(radians) * y1;
		this.y = Math.sin(radians) * x1 + Math.cos(radians) * y1;
	}
	/* gets the angle of the vector relative to the east cardinal direction */
	angle() {
		return Math.atan2(this.x, this.y);
	}
	/* gets the euclidean length of a vector */
	len() {
		return Math.sqrt(this.x ** 2 + this.y ** 2);
	}
}

/* simple vector extension that allows for specifing a require length and angle */
class VectorFromAngle extends Vector {
	constructor(angle, length) {
		super(Math.cos(angle) * length, Math.sin(angle) * length);
	}
}