class LineEditor {
	constructor(canvasId, backreference) {
		this.GuiHandler = backreference;
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
		let that = this;
		this.onmousemove = function(event) {
			/* prevent default actions (such as showing a context menu) */
			event.preventDefault();
			/* calculate the true position of the mouse relative to the ELEMENT, not the screen top left corner */
			let rect = event.target.getBoundingClientRect();
			let trueCursorPosition = new Vector(event.x - rect.left, event.y - rect.top);
			if (that.lastPoints && that.isDragging && that.selectedPointIndex !== null) {
				that.lastPoints.points[that.selectedPointIndex].x = (trueCursorPosition.x - that.canvas.width / 2) / that.scale;
				that.lastPoints.points[that.selectedPointIndex].y = (trueCursorPosition.y - that.canvas.height / 2) / that.scale;
				that.render(that.lastPoints);
				that.GuiHandler.renderApplication();
			}
		};
		this.onmousedown = function(event) {
			/* prevent default actions (such as showing a context menu) */
			event.preventDefault();
			/* calculate the true position of the mouse relative to the ELEMENT, not the screen top left corner */
			let rect = event.target.getBoundingClientRect();
			let trueCursorPosition = new Vector(event.x - rect.left, event.y - rect.top);
			that.isDragging = true;
			if (that.lastPoints) {
				const CIRCLE_SIZE = 15;
				for (let i = 0; i < that.lastPoints.points.length; i++) {
					if (Utils.fastDist(trueCursorPosition.x - that.canvas.width / 2, trueCursorPosition.y - that.canvas.height / 2, that.lastPoints.points[i].x * that.scale, that.lastPoints.points[i].y * that.scale) < CIRCLE_SIZE ** 2) {
						that.selectedPointIndex = i;
						that.render(that.lastPoints);
						return;
					}
				}
				that.selectedPointIndex = null;
			}
		};
		this.onmouseup = function(event) {
			/* prevent default actions (such as showing a context menu) */
			event.preventDefault();
			that.isDragging = false;
			that.GuiHandler.updateApplicationCode();
		};
		this.removepoint = function(event) {
			if (that.lastPoints && that.selectedPointIndex != null) {
				that.lastPoints.removePoint(that.selectedPointIndex);
				that.render(that.lastPoints);
				that.GuiHandler.renderApplication();
				that.GuiHandler.updateApplicationCode();
			}
		}
		this.addpoint = function(event) {
			if (that.lastPoints) {
				that.lastPoints.addPoint(new Vector(0, 0));
				that.render(that.lastPoints);
				that.GuiHandler.renderApplication();
				that.GuiHandler.updateApplicationCode();
			}
		}
		this.onwheel = function(event) {
			/* to give a more realistic zoom in out effect, the zoom should be based on the pixel unit */
			/* also flip the direction as it it more intuitive for scrolling up to zoom in*/
			that.scale -= event.deltaY / 1000 * that.scale;
			/* ensure ppu is between [0.01, 500] */
			if (that.scale < 0.01) {
				that.scale = 0.01;
			}
			if (that.scale > 500) {
				that.scale = 500;
			}
			/* re render the ui */
			that.render(that.lastPoints);
		};
		this.isDragging = false;
		this.selectedPointIndex = null;
		this.lastPoints = null;
		this.scale = 0.5;
	}
	render(p) {
		let points = p.points;
		this.lastPoints = p;
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.renderGrid();
		this.ctx.translate(this.canvas.width / 2, this.canvas.width / 2);
		this.ctx.beginPath();
		this.ctx.strokeStyle = "#171717";
		this.ctx.lineCap = "round";
		this.ctx.lineJoin = "round";
		for (let i = 0; i < points.length; i++) {
			this.ctx.lineTo(points[i].x * this.scale, points[i].y * this.scale);
		}
		this.ctx.stroke();
		const CIRCLE_SIZE = 15;
		for (let i = 0; i < points.length; i++) {
			if (this.selectedPointIndex === i) {
				this.ctx.fillStyle = "#fff7";
			} else {
				this.ctx.fillStyle = "#7777";
			}
			this.ctx.beginPath();
			this.ctx.arc(points[i].x * this.scale, points[i].y * this.scale, CIRCLE_SIZE, 0, 2 * Math.PI);
			this.ctx.fill();
		}

		this.ctx.resetTransform();
	}
	renderGrid(camera) {
		let GRID_SIZE = 50 * this.scale;
		this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
		/* auxillary lines */
		let negHeight = Math.ceil(this.canvas.height / GRID_SIZE);
		let negWidth = Math.ceil(this.canvas.width / GRID_SIZE);
		this.ctx.strokeStyle = "#777777";
		this.ctx.lineWidth = 1;
		this.ctx.beginPath();
		for (let i = -negWidth - 1; i <= negWidth; i++) {
			this.ctx.moveTo(i * GRID_SIZE + 0 % GRID_SIZE, -this.canvas.height / 2);
			this.ctx.lineTo(i * GRID_SIZE + 0 % GRID_SIZE, this.canvas.height / 2);
		}
		for (let i = -negHeight - 1; i <= negHeight; i++) {
			this.ctx.moveTo(this.canvas.width / 2, i * GRID_SIZE + 0 % GRID_SIZE);
			this.ctx.lineTo(-this.canvas.width / 2, i * GRID_SIZE + 0 % GRID_SIZE);
		}
		this.ctx.stroke();
		/* wide center lines from to denote 0, 0 */
		this.ctx.strokeStyle = "#999";
		this.ctx.lineWidth = 3;
		this.ctx.beginPath();
		this.ctx.moveTo(-this.canvas.width / 2, 0);
		this.ctx.lineTo(this.canvas.width / 2, 0);
		this.ctx.moveTo(0, -this.canvas.height / 2);
		this.ctx.lineTo(0, this.canvas.height / 2);
		this.ctx.stroke();
		this.ctx.resetTransform();
	}
	init() {
		this.canvas.addEventListener("mousemove", this.onmousemove);
		this.canvas.addEventListener("mousedown", this.onmousedown);
		this.canvas.addEventListener("mouseup", this.onmouseup);
		this.canvas.addEventListener("wheel", this.onwheel, {passive: true});
		document.getElementById("remove-line-point").addEventListener("click", this.removepoint);
		document.getElementById("new-line-point").addEventListener("click", this.addpoint);
	}
	destroy() {
		this.canvas.removeEventListener("mousemove", this.onmousemove);
		this.canvas.removeEventListener("mousedown", this.onmousedown);
		this.canvas.addEventListener("mouseup", this.onmouseup);
		this.canvas.addEventListener("wheel", this.onwheel);
		document.getElementById("remove-line-point").removeEventListener("click", this.removepoint);
		document.getElementById("new-line-point").removeEventListener("click", this.addpoint);
	}
} 