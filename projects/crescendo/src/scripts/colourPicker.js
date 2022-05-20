class ColourPicker {
	constructor(canvasId, outputTextId, outputColourId) {
		this.canvas = document.getElementById(canvasId);
		/*
		 *	because canvas has 2 types of width and height properties:
		 *	width and height of render regions, width and height of element;
		 *	for simplicity, this is set 1:1 so the pixel ratio is 1:1
		 */
		let computedStyle = window.getComputedStyle(this.canvas);
		/* align both width properties*/
		this.canvas.width = parseFloat(computedStyle.getPropertyValue("width"));
		this.canvas.height = parseFloat(computedStyle.getPropertyValue("height"));
		/* use 2D canvas API instead of 3D webgl */
		this.ctx = this.canvas.getContext("2d");
		this.currentHue = 0;
		/* outer referencing */
		let that = this;
		this.cursor = {
			down: false,
			/* either circle or square */
			area: null,
		};
		this.currentColourPosition = new Vector(that.width(0.25), that.width(0.25));
		this.outputTextId = outputTextId;
		this.outputColourId = outputColourId;
		this.onmousemove = function(event) {
			/* prevent default actions (such as showing a context menu) */
			event.preventDefault();
			/* calculate the true position of the mouse relative to the ELEMENT, not the screen top left corner */
			let rect = event.target.getBoundingClientRect();
			let trueCursorPosition = new Vector(event.x - rect.left, event.y - rect.top);
			let distance = Utils.dist(that.width(0.5), that.width(0.5), trueCursorPosition.x, trueCursorPosition.y);
			/* 
			 *	determine if the mouse is within the colour ring or colour square
			 *	change the style of the pointer for user feedback
			 */
			if ((distance > that.width(0.375) && distance < that.width(0.5)) || (trueCursorPosition.x > that.width(0.25) && trueCursorPosition.x < that.width(0.75) && trueCursorPosition.y > that.width(0.25) && trueCursorPosition.y < that.width(0.75))) {
				that.canvas.style.cursor = "pointer";
			} else {
				that.canvas.style.cursor = "default";
			}
			/* if the area is determined to be within the circle, change the hue */
			if (that.cursor.down && that.cursor.area === "circle") {
				/* determine the direction of the */
				that.currentHue = Utils.direction(that.width(0.5), that.width(0.5), trueCursorPosition.x, trueCursorPosition.y) * 180 / Math.PI + 90;
				that.render();
			}
			/* otherwise if within the square, change the colour chosen */
			if (that.cursor.down && that.cursor.area === "square") {
				that.currentColourPosition.x = Utils.clampRange(trueCursorPosition.x, that.width(0.25), that.width(0.75) - 1);
				that.currentColourPosition.y = Utils.clampRange(trueCursorPosition.y, that.width(0.25), that.width(0.75) - 1);
				that.render();
			}
		};
		this.onmousedown = function(event) {
			/* prevent default actions (such as showing a context menu) */
			event.preventDefault();
			/* calculate the true position of the mouse relative to the ELEMENT, not the screen top left corner */
			let rect = event.target.getBoundingClientRect();
			let trueCursorPosition = new Vector(event.x - rect.left, event.y - rect.top);
			that.cursor.down = true;
			let distance = Utils.dist(that.width(0.5), that.width(0.5), trueCursorPosition.x, trueCursorPosition.y);
			/* determine if the mouse is within the square or colour ring */
			if (trueCursorPosition.x > that.width(0.25) && trueCursorPosition.x < that.width(0.75) && trueCursorPosition.y > that.width(0.25) && trueCursorPosition.y < that.width(0.75)) {
				that.currentColourPosition.x = trueCursorPosition.x;
				that.currentColourPosition.y = trueCursorPosition.y;
				that.cursor.area = "square";
				that.render();
			} else if (distance > that.width(0.375) && distance < that.width(0.5)) {
				that.currentHue = Utils.direction(that.width(0.5), that.width(0.5), trueCursorPosition.x, trueCursorPosition.y) * 180 / Math.PI + 90;
				that.cursor.area = "circle";
				that.render();
			}
		};
		this.onmouseup = function(event) {
			that.cursor.down = false;
		};
	}
	/* used by the class to quickly calculate widths using a little lines of code, it also compacts code */
	width(decimal) {
		return this.canvas.width * decimal;
	}
	/* renders don't happen constantly, they only happen on changes to minimise processing usage */
	render() {
		/* clear the canvas */
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		/* render to canvas */
		this.renderColourSquare();
		this.renderHueCircle();
		/* cache result for better cpu efficiency */
		let currentColour = this.currentHex();
		/* update text and previews */
		document.getElementById(this.outputTextId).textContent = currentColour;
		document.getElementById(this.outputColourId).style.background = currentColour;
	}
	renderColourSquare() {
		/* allows the white part of the gradient to be more defined */
		const HSL_OFFSET = -10;
		/* constant as this is the 100% is the max values for hsl */
		const HSL_ROWS = 100;
		this.ctx.translate(this.width(0.25), 0);
		for (let row = HSL_OFFSET; row < HSL_ROWS + HSL_OFFSET; row++) {
			/* the stretch of the gradient by 0.009, makes the white values more defined and gives a larger range of values */
			let gradient = this.ctx.createLinearGradient(0, 0, HSL_ROWS * this.width(0.009) - this.width(0.5), 0);
			/* create the colour stops for each individual section*/
			gradient.addColorStop(0.1, `hsl(${this.currentHue}, 0%, ${(HSL_ROWS - row)}%)`);
			gradient.addColorStop(0.8, `hsl(${this.currentHue}, 100%, ${(50 - row / 1.5)}%)`);
			this.ctx.fillStyle = gradient;
			/* determine the height of each row */
			let y = (row - HSL_OFFSET) * (this.canvas.height / HSL_ROWS);
			/* map the row height to the canvas width*/
			let yMapped = Utils.map(y, 0, (HSL_ROWS) * (this.canvas.height / HSL_ROWS), this.width(0.25), this.width(0.75));
			this.ctx.fillRect(0, yMapped, this.width(0.5), this.canvas.height / HSL_ROWS);
		}
		this.ctx.resetTransform();
		/* show a pointer was to the current position of the selected colour */
		this.ctx.beginPath();
		this.ctx.strokeStyle = "#e4ecef";
		this.ctx.lineWidth = this.width(0.01);
		this.ctx.arc(this.currentColourPosition.x, this.currentColourPosition.y, this.width(0.01875), 0, Math.PI * 2);
		this.ctx.stroke();
	}
	renderHueCircle() {
		this.ctx.translate(this.width(0.5), this.width(0.5));
		/* draw the HSL colour circle around the square*/
		for (let i = 0; i < 360; i++) {
			this.ctx.strokeStyle = `hsl(${i + 90}, 100%, 50%)`;
			this.ctx.lineWidth = this.width(0.01);
			this.ctx.beginPath();
			/* using sin and cos, convert the cartesian coordinates to polar coordinates */
			this.ctx.moveTo(Math.cos(i * (Math.PI / 180)) * this.width(0.375), Math.sin(i * (Math.PI / 180)) * this.width(0.375));
			this.ctx.lineTo(Math.cos(i * (Math.PI / 180)) * this.width(0.5), Math.sin(i * (Math.PI / 180)) * this.width(0.5));
			this.ctx.stroke();
		}
		/* draw the current position of the selected hue for feedback*/
		this.ctx.rotate(this.currentHue * Math.PI / 180 + Math.PI);
		this.ctx.strokeStyle = "#e4ecef";
		this.ctx.lineWidth = this.width(0.015);
		this.ctx.strokeRect(-this.width(0.0375), this.width(0.375), this.width(0.075), this.width(0.125));
		this.ctx.resetTransform();
	}
	/* gets the hex code of the current position, returns a CSS compatible hex string */
	currentHex() {
		let data = this.ctx.getImageData(this.currentColourPosition.x, this.currentColourPosition.y, 1, 1);
		let rgb = data.data;
		let r = Utils.pad(rgb[0].toString(16), 2, "0", true);
		let g = Utils.pad(rgb[1].toString(16), 2, "0", true);
		let b = Utils.pad(rgb[2].toString(16), 2, "0", true);
		return `#${r}${g}${b}`;
	}
	init() {
		this.canvas.addEventListener("mousemove", this.onmousemove);
		this.canvas.addEventListener("mousedown", this.onmousedown);
		this.canvas.addEventListener("mouseup", this.onmouseup);
		this.render();
	}
	destroy() {
		this.canvas.removeEventListener("mousemove", this.onmousemove);
		this.canvas.removeEventListener("mousedown", this.onmousedown);
		this.canvas.removeEventListener("mouseup", this.onmouseup);
	}
}