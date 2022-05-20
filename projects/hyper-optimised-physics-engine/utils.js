let times = [];

function calcFPS() {
	window.requestAnimationFrame(() => {
		const now = performance.now();
		while (times.length > 0 && times[0] <= now - 1000) {
			times.shift();
		}
		times.push(now);
		calcFPS();
	});
};
calcFPS();

export function getFramerate() {
	return times.length;
}

export function fastDist(x1, y1, x2, y2) {
	return Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
}

export function dist(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

export function map(num, numMin, numMax, mapMin, mapMax) {
	return mapMin + ((mapMax - mapMin) / (numMax - numMin)) * (num - numMin);
}

export function direction(originX, originY, pointingX, pointingY) {
	return Math.atan2(originY - pointingY, originX - pointingX);
	// return Math.atan2(pointingY - originY, pointingX - originX);
}

export function randomRange(min, max) {
	return min + Math.random() * (max - min);
}