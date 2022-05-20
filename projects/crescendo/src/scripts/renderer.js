/* the render class handles the rendering of gameobjects */
class Renderer {
	constructor(canvasId) {
		this.canvas = document.getElementById(canvasId);
		/*
		 *	because canvas has 2 types of width and height properties:
		 *	width and height of render regions, width and height of element;
		 *	for simplicity, this is set 1:1 so the pixel ratio is 1:!
	 	 */
		let computedStyle = window.getComputedStyle(this.canvas);
		this.canvas.width = parseFloat(computedStyle.getPropertyValue("width"));
		this.canvas.height = parseFloat(computedStyle.getPropertyValue("height"));
		/* use 2D canvas API instead of 3D webgl */
		this.ctx = this.canvas.getContext("2d");
		/* typically 1 pixel = 1 unit, however this can be changed */
		this.pixelsPerUnit = 1;
		/* increases performance by not rendering elements outside of the screen, usually true, increases performance by 50% */
		this.doFrustumCulling = true;
		/* profiling */
		this.totalGivenElements = 0;
		this.totalRenderedElements = 0;
		/* debugging */
		this.drawBoundingBoxes = false;
		this.drawGrid = false;
		this.gridSize = 50;
		this.boundingBoxAroundIndex = null;
	}
	/* from a given width, height and angle, generates an axis aligned bounding box that guarantees to be perfectly bound a rectangle*/
	calculateRectangleAxisAlignedBoundingBox(width, height, angle) {
		let newPoints = [];
		/* array of untransformed points*/
		let points = [
			new Vector(-0.5, -0.5),
			new Vector(-0.5, 0.5),
			new Vector(0.5, -0.5),
			new Vector(0.5, 0.5),
		];
		/* loop over points and transform them to be the corners of the rectangle */
		for (let i = 0; i < points.length; i++) {
			/* scale up points */
			points[i].multiply(width, height);
			/* fancy math */
			let transformedX = points[i].x * Math.cos(angle) + points[i].y * Math.sin(angle);
			let transformedY = points[i].x * Math.sin(angle) + points[i].y * Math.cos(angle);
			let vector = new Vector(transformedX, transformedY);
			newPoints.push(vector);
		}
		/* determine which points need to be used for the edge's of the aligned bounding box */
		let minX = Math.min(newPoints[0].x, newPoints[1].x, newPoints[2].x, newPoints[3].x);
		let maxX = Math.max(newPoints[0].x, newPoints[1].x, newPoints[2].x, newPoints[3].x);
		let minY = Math.min(newPoints[0].y, newPoints[1].y, newPoints[2].y, newPoints[3].y);
		let maxY = Math.max(newPoints[0].y, newPoints[1].y, newPoints[2].y, newPoints[3].y);
		/* center aligned bounding box */
		return new Vector(maxX - minX, maxY - minY);
	}
	calculateOvalAxisAlignedBoundingBox(width, height, angle) {
		/* very simple math */
		let x = Math.sqrt(width ** 2 * Math.cos(angle) ** 2 + height ** 2 * Math.sin(angle) ** 2);
		let y = Math.sqrt(width ** 2 * Math.sin(angle) ** 2 + height ** 2 * Math.cos(angle) ** 2);
		return new Vector(x, y);
	}
	setRenderProperties(renderDetails) {
		/* set colours */
		this.ctx.fillStyle = renderDetails.fillColour;
		this.ctx.strokeStyle = renderDetails.strokeColour;
		this.ctx.lineWidth = renderDetails.strokeWidth / this.pixelsPerUnit;
		this.ctx.globalAlpha = renderDetails.opacity;
	}
	setTransformProperties(calculatedTransform, transform, camera) {
		this.ctx.translate(calculatedTransform.x, calculatedTransform.y);
		this.ctx.rotate(transform.rotation + camera.getComponent("transform").rotation);
		this.ctx.scale(this.pixelsPerUnit, this.pixelsPerUnit);
	}
	/* 
	 *	instead of the canvas doing its transformations, then realising it's out of screen and discarding said calculations
	 *	which are expensive, calculate it beforehand using vectors which saves much performance (8ms 1k render --> 3ms 1k render)
	 */
	calculateTransformations(transform, camera) {
		let cameraTransform = camera.getComponent("transform");
		let objectTransform = new Vector(this.canvas.width / 2, this.canvas.height / 2);
		/* ignore camera transform if the object is expected to stay on screen */
		if (transform.fixedOnScreen === false) {
			objectTransform.subtract(cameraTransform.x * this.pixelsPerUnit, cameraTransform.y * this.pixelsPerUnit);
			objectTransform.add(camera.followOffsetX * this.pixelsPerUnit, camera.followOffsetY * this.pixelsPerUnit);
		}
		/* specific object transforms next */
		objectTransform.add(transform.x * this.pixelsPerUnit, transform.y * this.pixelsPerUnit);

		return objectTransform;
	}
	/* given a text and the maximum bounding width, split's the text into multiple lines */
	multilineTextSplitBySpace(text, maxWidth) {
		/* first split text by new lines*/
		let split = text.split(/[\n]/);
		let output = [];
		let last = 0;
		let i = 0;
		while (i < split.length) {
			if (split[i] === "") {
				output.push(split[i]);
				i++;
				last = i;
				continue;
			}
			let width = this.ctx.measureText(split[i]).width;
			if (width > maxWidth) {
				let split2 = split[i].split(" ");
				let sumTotal = split2[0];
				let jLoops = 0;
				let MAX_J_LOOPS = 1000;
				for (let j = 1; j < split2.length; j++) {
					jLoops++;
					if (jLoops > MAX_J_LOOPS) {
						break;
					}
					if (this.ctx.measureText(sumTotal + " " + split2[j]).width < maxWidth) {
						sumTotal += " " + split2[j];
					} else {
						output.push(sumTotal);
						sumTotal = "";
						if (this.ctx.measureText(split2[j]).width < maxWidth) {
							j--;
						} else {
							break;
						}
					}
				}
				output.push(sumTotal);
			} else {
				output.push(split[i]);
			}
			i++;
		}
		return output;
	}
	renderAxisAlignedBoundingBox(transform, renderDetails, camera) {
		/* calculate theta, which minuses the rotations of the object and the camera */
		let theta = -transform.rotation - camera.getComponent("transform").rotation;
		/* anti rotate the canvas so that all bounding boxes are aligned th the horizontal */
		this.ctx.rotate(theta);
		/* set styles */
		this.ctx.strokeStyle = "#e4ecef";
		this.ctx.setLineDash([5, 5]);
		this.ctx.beginPath();
		/* calculate bounding box for rectangles and ovals */
		if (renderDetails.shape === "rectangle") {
			let boundingBox = this.calculateRectangleAxisAlignedBoundingBox(transform.scaleX, transform.scaleY, transform.rotation);
			this.ctx.rect(-boundingBox.x / 2, -boundingBox.y / 2, boundingBox.x, boundingBox.y);
		} else if (renderDetails.shape === "circle" || renderDetails.type === "text") {
			let boundingBox = this.calculateOvalAxisAlignedBoundingBox(transform.scaleX, transform.scaleY, transform.rotation);
			this.ctx.rect(-boundingBox.x / 2, -boundingBox.y / 2, boundingBox.x, boundingBox.y);
		} else if (renderDetails.type === "line") {

		}
		this.ctx.stroke();
		/* reset line dash */
		this.ctx.setLineDash([]);
	}
	/* rendering the grid is useful for debugging, it gives users a sense of the size of objects*/
	renderGrid(camera) {
		let gridSize = this.gridSize * this.pixelsPerUnit;
		let cameraTransform = camera.getComponent("transform");
		let transformX = -cameraTransform.x * this.pixelsPerUnit;
		let transformY = -cameraTransform.y * this.pixelsPerUnit;
		this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
		/* auxillary lines */
		let negHeight = Math.ceil(this.canvas.height / gridSize);
		let negWidth = Math.ceil(this.canvas.width / gridSize);
		this.ctx.strokeStyle = "#777777";
		this.ctx.lineWidth = 1;
		this.ctx.beginPath();
		for (let i = -negWidth - 1; i <= negWidth; i++) {
			this.ctx.moveTo(i * gridSize + transformX % gridSize, -this.canvas.height / 2);
			this.ctx.lineTo(i * gridSize + transformX % gridSize, this.canvas.height / 2);
		}
		for (let i = -negHeight - 1; i <= negHeight; i++) {
			this.ctx.moveTo(this.canvas.width / 2, i * gridSize + transformY % gridSize);
			this.ctx.lineTo(-this.canvas.width / 2, i * gridSize + transformY % gridSize);
		}
		this.ctx.stroke();
		/* wide center lines from to denote 0, 0 */
		this.ctx.strokeStyle = "#999";
		this.ctx.lineWidth = 3;
		this.ctx.beginPath();
		this.ctx.moveTo(-this.canvas.width / 2, transformY);
		this.ctx.lineTo(this.canvas.width / 2, transformY);
		this.ctx.moveTo(transformX, -this.canvas.height / 2);
		this.ctx.lineTo(transformX, this.canvas.height / 2);
		this.ctx.stroke();
	}
	renderShape(transform, renderDetails) {
		/*	
		 *	since the base unit one pixel and everything is rendered based on the radius, the values 
		 *	for rendering size is 0.5
		 */
		if (renderDetails.shape === "circle") {
			/* ellipse has a built in rotation function, so no rotations must be done */
			/* ellipses render from the center, so no offset required */
			this.ctx.ellipse(0, 0, 0.5 * transform.scaleX, 0.5 * transform.scaleY, 0, 0, 2 * Math.PI);
		} else if (renderDetails.shape === "rectangle") {
			/* since rectangle draw from the upper left, the transform must be subtracted so it is based off the center */
			this.ctx.rect(-0.5 * transform.scaleX, -0.5 * transform.scaleY, transform.scaleX, transform.scaleY);
		}
		this.ctx.fill();
		this.ctx.stroke();
	}
	renderLine(transform, renderDetails, lineData) {
		if (lineData) {
			this.ctx.beginPath();
			this.ctx.strokeStyle = renderDetails.strokeColour;
			this.ctx.lineWidth = renderDetails.strokeWidth;
			this.ctx.lineCap = renderDetails.lineCap;
			this.ctx.lineJoin = renderDetails.lineJoin;
			for (let i = 0; i < lineData.points.length; i++) {
				this.ctx.lineTo(lineData.points[i].x, lineData.points[i].y);
			}
			if (lineData.connectEnds === true && lineData.points.length > 2) {
				this.ctx.lineTo(lineData.points[0].x, lineData.points[0].y)
			}
			this.ctx.stroke();
			if (renderDetails.fill) {
				this.ctx.fill();
			}
		}
	}
	renderTexture(transform, renderDetails) {
		/* since images render from upper left, transform must be subtracted so it is based off the center */
		this.ctx.drawImage(renderDetails.texture, -0.5 * transform.scaleX * renderDetails.textureScaleX, -0.5 * transform.scaleY * renderDetails.textureScaleY, transform.scaleX * renderDetails.textureScaleX, transform.scaleY * renderDetails.textureScaleY);
	}
	renderText(transform, renderDetails, camera) {
		/* stringify first */
		let text = renderDetails.text.toString();
		/* generate the text's font */
		this.ctx.font = `${renderDetails.style} ${renderDetails.variant} ${renderDetails.weight} ${renderDetails.size}px ${renderDetails.font}`;
		/* gather metrics about the text */
		let metrics = this.ctx.measureText(text);
		/* since text in canvas renders from the bottom left, calulcating the font height is required so the center of the text is used */
		let fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
		/* set alignment */
		this.ctx.textAlign = renderDetails.alignment;

		let offset = 0;
		if (renderDetails.alignment === "left") {
			offset = -transform.scaleX / 2;
		} else if (renderDetails.alignment === "right") {
			offset = transform.scaleX / 2;
		}

		let multilineText = this.multilineTextSplitBySpace(text, transform.scaleX);
		for (let i = 0; i < multilineText.length; i++) {
			let calculatedTransform = this.calculateTransformations(transform, camera);
			this.ctx.fillText(multilineText[i], offset, -transform.scaleY / 2 + fontHeight + fontHeight * i);
		}
	}
	renderObject(object, camera, index) {
		/* get render specific components */
			let transform = object.getComponent("transform");
			let renderDetails = object.getComponent("renderer");
			if (renderDetails === null || transform === null) {
				return;
			}
			let componentType = renderDetails.type;
			/* get bounds for frustom culling */
			let maxObjectBounds = Math.max(transform.scaleX, transform.scaleY) / 2 * this.pixelsPerUnit;
			/* calculate if the given object will be in frame and determine if it should be rendered */
			let calculatedTransform = this.calculateTransformations(transform, camera);
			let isInFrame = calculatedTransform.x > -maxObjectBounds && calculatedTransform.x < this.canvas.width + maxObjectBounds && calculatedTransform.y > -maxObjectBounds && calculatedTransform.y < this.canvas.height + maxObjectBounds;
			/* don't frustum cull lines */
			if ((isInFrame && this.doFrustumCulling) || componentType === "line" || componentType === "text" || this.doFrustumCulling === false) {
				this.setTransformProperties(calculatedTransform, transform, camera);
				this.ctx.beginPath();
				this.setRenderProperties(renderDetails);
				/*	chooses between rendering shapes and images 
				 *	if a texture is defined it will render images
				 *	otherwise a shape
				 *	shapes are a fallback in case an image cannot be rendered
				 */
				/* specific component renderers */
				if (componentType === "mesh") {
					if (renderDetails.texture === null) { 
						/* draw specific shapes */
						this.renderShape(transform, renderDetails);
					} else {
						/* drawing iamges */
						this.renderTexture(transform, renderDetails);
					}
				} else if (componentType === "text") {
					this.renderText(transform, renderDetails, camera);
				} else if (componentType === "line") {
					this.renderLine(transform, renderDetails, object.getComponent("line"));
				}
				if (this.drawBoundingBoxes || this.boundingBoxAroundIndex === index) {
					this.renderAxisAlignedBoundingBox(transform, renderDetails, camera);
				}
				this.totalRenderedElements++;
				/* reset transformations in preparation of new object */
				this.ctx.resetTransform();
			}
	}
	render(scene, camera) {
		if (this.pixelsPerUnit <= 0) {
			this.pixelsPerUnit = 1;
		}
		if (camera === undefined || camera.hasComponent("transform") === false) {
			return;
		}
		this.totalRenderedElements = 0;
		this.totalGivenElements = scene.objects.length;
		this.ctx.globalAlpha = 1;
		/* get background colour and fill the background */
		if (scene.background.texture !== null) {
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.ctx.translate(-scene.background.offsetX + this.canvas.width / 2 + camera.getComponent("transform").x, -scene.background.offsetY + this.canvas.height / 2 + camera.getComponent("transform").y);
			this.ctx.drawImage(scene.background.texture, -scene.background.texture.width * scene.background.textureScaleX / 2, -scene.background.texture.height * scene.background.textureScaleY / 2, scene.background.texture.width * scene.background.textureScaleX, scene.background.texture.height * scene.background.textureScaleY);
		} else {
			this.ctx.fillStyle = scene.background.colour;
			this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		}
		this.ctx.resetTransform();
		if (this.drawGrid) {
			this.renderGrid(camera);
			this.ctx.resetTransform();
		}
		/* loop through and render all objects */
		for (let i = 0; i < scene.objects.length; i++) {
			this.renderObject(scene.objects[i], camera, i);
		}
	}
}