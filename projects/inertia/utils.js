function point (x, y) {
	if (arguments.length === 2) {
		return {
			x: x,
			y: y,
		};
	} else if (arguments.length === 1) {
		return {
			x: x.x,
			y: x.y,
		};
	}
}

class InertiaWalls {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		/* | is x */
		this.verticalWalls = [];
		/* _ is y */
		this.horizontalWalls = [];

		for (let i = 0; i < y; i++) {
			let array = [];
			for (let j = 0; j < x + 1; j++) {
				array.push(false);
			}
			this.verticalWalls.push(array);
		}

		for (let i = 0; i < y + 1; i++) {
			let array = [];
			for (let j = 0; j < x; j++) {
				array.push(false);
			}
			this.horizontalWalls.push(array);
		}
	}
	set(direction, x, y, value) {
		if (direction === "y") {
			this.verticalWalls[y][x] = value;
		} else if (direction === "x") {
			this.horizontalWalls[y][x] = value;
		}
	}
}

function map(num, numMin, numMax, mapMin, mapMax) {
	return mapMin + ((mapMax - mapMin) / (numMax - numMin)) * (num - numMin);
}