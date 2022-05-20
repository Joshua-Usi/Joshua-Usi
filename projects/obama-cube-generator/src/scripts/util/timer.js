import * as utils from "./utils.js";

export class Timer {
	constructor(max) {
		this.now;
		this.times = [];
		this.framesLength = max;
	}
	start() {
		this.now = window.performance.now();
	}
	finish() {
		this.times.push(window.performance.now() - this.now);
		if (this.times.length > this.framesLength) {
			this.times.shift(0, 1);
		}
	}
	getLast() {
		return this.times[this.times.length - 1];
	}
	getAverage() {
		return utils.average(this.times);
	}
}