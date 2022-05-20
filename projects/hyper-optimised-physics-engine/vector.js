export class Vector {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

export class VectorFromAngle extends Vector {
	constructor(angle, length) {
		super(Math.cos(angle) * length, Math.sin(angle) * length);
	}
}