export default class Mouse {
	constructor(element, sensitivity = 1) {
		/* Element id */
		this.element = element;
		this.position = {
			x: 0,
			y: 0,
		};
		this.isLeftButtonDown = false;
		this.isRightButtonDown = false;
		this.canUserControl = true;
		this.locked = false;
		this.useRawPosition = false;
		this.sensitivity = sensitivity;
		this.positionLimit = false;
		this.bounds = {
			lowerX: 0,
			lowerY: 0,
			upperX: 0,
			upperY: 0,
		};
		/* needed to access outside scope */
		let that = this;
		/* References to functions for destroying */
		this.mousemove = function(event) {
			if (that.canUserControl) {
				that.position.x = event.clientX;
				that.position.y = event.clientY;
			}
		};
		this.mousemovelocked = function(event) {
			if (that.canUserControl) {
				that.position.x += event.movementX * that.sensitivity;
				that.position.y += event.movementY * that.sensitivity;
				if (that.positionLimit === true) {
					if (that.position.x < that.bounds.lowerX) {
						that.position.x = that.bounds.lowerX;
					}
					if (that.position.y < that.bounds.lowerY) {
						that.position.y = that.bounds.lowerY;
					}
					if (that.position.x > that.bounds.upperX) {
						that.position.x = that.bounds.upperX;
					}
					if (that.position.y > that.bounds.upperY) {
						that.position.y = that.bounds.upperY;
					}
				}
			}
		};
		this.contextmenu = event => event.preventDefault();
		this.mousedown = function(event) {
			if (that.canUserControl) {
				that.isLeftButtonDown = true;
			}
		};
		this.mouseup = function(event) {
			if (that.canUserControl) {
				that.isLeftButtonDown = false;
			}
		};
	}
	init() {
		document.getElementById(this.element).addEventListener("mousemove", this.mousemove);
		document.getElementById(this.element).addEventListener('contextmenu', this.contextmenu);
		document.getElementById(this.element).addEventListener("mousedown", this.mousedown);
		document.getElementById(this.element).addEventListener("mouseup", this.mouseup);
	}
	destroy() {
		document.getElementById(this.element).removeEventListener("mousemove", this.mousemove);
		document.getElementById(this.element).removeEventListener('contextmenu', this.contextmenu);
		document.getElementById(this.element).removeEventListener("mousedown", this.mousedown);
		document.getElementById(this.element).removeEventListener("mouseup", this.mouseup);
	}
	getPosition() {
		return {
			x: this.position.x,
			y: this.position.y,
		};
	}
	getX() {
		return this.position.x;
	}
	getY() {
		return this.position.y;
	}
	setPosition(x, y) {
		this.position.x = x;
		this.position.y = y;
	}
	changePosition(x, y) {
		this.position.x += x;
		this.position.y += y;
	}
	click() {
		this.isLeftButtonDown = true;
	}
	unClick() {
		this.isLeftButtonDown = false;
	}
	disableUserControl() {
		this.canUserControl = false;
	}
	enableUserControl() {
		this.canUserControl = true;
	}
	lockPointer() {
		this.locked = true;
		document.getElementById(this.element).requestPointerLock();
		document.getElementById(this.element).removeEventListener("mousemove", this.mousemove);
		document.getElementById(this.element).addEventListener("mousemove", this.mousemovelocked);
	}
	unlockPointer() {
		this.locked = false;
		document.exitPointerLock();
		document.getElementById(this.element).removeEventListener("mousemove", this.mousemovelocked);
		document.getElementById(this.element).addEventListener("mousemove", this.mousemove);
	}
	positionBound(lowerX, lowerY, upperX, upperY) {
		this.positionLimit = true;
		this.bounds.lowerX = lowerX;
		this.bounds.lowerY = lowerY;
		this.bounds.upperX = upperX;
		this.bounds.upperY = upperY;
	}
	unbound() {
		this.positionLimit = false;
	}
	show() {
		document.getElementById(this.element).style.cursor = "pointer";
	}
	hide() {
		document.getElementById(this.element).style.cursor = "none";
	}
};