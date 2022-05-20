/* physics instance is class allowing for modular use */
class PotatoPhysicsEngine {
	constructor(width = 5000, height = 5000, iterations = 2, gridCellsX = 16, gridCellsY = 9) {
		/* maximal bounds of the physics engine */
		this.width = width;
		this.height = height;
		this.xOffset = width / 2;
		this.yOffset = height / 2;
		/* more iterations means more accurate simulation */
		this.iterations = iterations;
		/* usually constant, however for delta time engines it fluctuates */
		this.timestep = 1;
		/* global gravity value */
		this.globalGravity = new Vector(0, 9.8 / 50);
		/* the amount of cells that the collision detection algorithms is allowed to sort into */
		this.collisionGridCellsX = gridCellsX;
		this.collisionGridCellsY = gridCellsY;
		/* amount of points that the rigid body allocation algorithm checks */
		/* by default checks 8 points, the 4 cardinal directions and the diagonals */
		this.xs = [1, Math.SQRT1_2, 0, -Math.SQRT1_2, -1, Math.SQRT1_2, 0, Math.SQRT1_2];
		this.ys = [0, Math.SQRT1_2, 1, Math.SQRT1_2, 0, -Math.SQRT1_2, -1, -Math.SQRT1_2];
		/* value between [0, 1] 
		 *	where 0 is no correction, however this can cause objects to phase through each other
		 *	and 1 is complete correction, however this can cause extreme jittering
		 *	0.25 is the default value
		 */
		this.errorCorrectionCoefficient = 0.5;

		/* profiling */
		this.collisions = 0;
		this.collisionChecks = 0;

		this.Line = class Line {
			constructor(x1 = 0, y1 = 0, x2 = 0, y2 = 0) {
				this.x1 = x1;
				this.y1 = y1;
				this.x2 = x2;
				this.y2 = y2;
			}
		};
	}
	isRectRectColliding(rectangleX1, rectangleY1, rectangleWidth1, rectangleHeight1, rectangleX2, rectangleY2, rectangleWidth2, rectangleHeight2) {
		if (Math.abs(rectangleX1 - rectangleX2) > (rectangleWidth1 + rectangleWidth2) / 2) {
			return false;
		}
		if (Math.abs(rectangleY1 - rectangleY2) > (rectangleHeight1 + rectangleHeight2) / 2) {
			return false;
		}
		return true;
	}
	getClosestEdge(circleX, circleY, rectangleX, rectangleY, rectangleWidth, rectangleHeight) {
		let widthOver2 = rectangleWidth / 2;
		let heightOver2 = rectangleHeight / 2;
		/* determine which edge is the closest */
		/* in order top, bottom, left, right */
		if (circleY < rectangleY - heightOver2) {
			return "top";
		}
		if (circleY > rectangleY + heightOver2) {
			return "bottom";
		}
		if (circleX < rectangleX - widthOver2) {
			return "left";
		}
		if (circleX > rectangleX + widthOver2) {
			return "right";
		}
		return null;
	}
	isCircleRectColliding(circleX, circleY, radius, rectangleX, rectangleY, rectangleWidth, rectangleHeight) {
		let widthOver2 = rectangleWidth / 2;
		let heightOver2 = rectangleHeight / 2;
		let testX = circleX;
		let testY = circleY;
		/* determine which edge is the closest */
		/* in order top, bottom, left, right */
		if (circleY < rectangleY - heightOver2) {
			testY = rectangleY - heightOver2;
		} else if (circleY > rectangleY + heightOver2) {
			testY = rectangleY + heightOver2;
		}
		if (circleX < rectangleX - widthOver2) {
			testX = rectangleX - widthOver2;
		} else if (circleX > rectangleX + widthOver2) {
			testX = rectangleX + widthOver2;
		}
		/* get distance from closest edges */
		let distance = Utils.fastDist(testX, testY, circleX, circleY);
		/* if the distance is less than the radius square (a^2 + b^2 = c^2) then a collision has happened */
		if (distance <= radius ** 2) {
			return true;
		}
		return false;
	}

	isLineCircleColliding(x1, y1, x2, y2, cx, cy, r) {
		/* if either end is in the circle, return true immediately */
		let inside1 = this.isPointCircleColliding(x1, y1, cx, cy, r);
		let inside2 = this.isPointCircleColliding(x2, y2, cx, cy, r);
		if (inside1 || inside2) {
			return true;
		}
		let closest = this.getClosestPoint(x1, y1, x2, y2, cx, cy);
		let onSegment = this.isLinePointColliding(x1, y1, x2, y2, closest.x, closest.y);
		if (onSegment === false) {
			return false;
		};
		/* get distance to closest point */
		if (Utils.fastDist(cx, cy, closest.x, closest.y) <= r ** 2) {
			return true;
		}
		return false;
	}
	distanceLinePoint(x1, y1, x2, y2, cx, cy) {
		let closest = this.getClosestPoint(x1, y1, x2, y2, cx, cy);
		let onSegment = this.isLinePointColliding(x1, y1, x2, y2, closest.x, closest.y);
		if (onSegment === false) {
			return Math.sqrt(Math.min(Utils.fastDist(cx, cy, x1, y1), Utils.fastDist(cx, cy, x2, y2)));
		}
		/* get distance to closest point */
		return Utils.dist(cx, cy, closest.x, closest.y);
	}
	getClosestPoint(x1, y1, x2, y2, cx, cy) {
		/* get length of the line */
		let len = Utils.fastDist(x1, y1, x2, y2);
		/* get dot product of the line and circle */
		let dot = (((cx - x1) * (x2 - x1)) + ((cy - y1) * (y2 - y1))) / len;
		/* find the closest point on the line */
		let closestX = x1 + (dot * (x2 - x1));
		let closestY = y1 + (dot * (y2 - y1));
		return new Vector(closestX, closestY);
	}
	/* extremely fast method for finding if a point circle collides */
	isPointCircleColliding(px, py, cx, cy, r) {
		if (Utils.fastDist(px, py, cx, cy) <= r ** 2) {
			return true;
		}
		return false;
	}
	isLinePointColliding(x1, y1, x2, y2, px, py) {
		/* get distance from the point to the two ends of the line */
		let d1 = Utils.dist(px, py, x1, y1);
		let d2 = Utils.dist(px, py, x2, y2);
		/* get the length of the line */
		let lineLen = Utils.dist(x1, y1, x2, y2);
		/* usually constant, higher buffer gives more zoning but less accuracy */
		let buffer = 0.1;
		/* if the distance between the points is equal to the lines length plus minus the buffer then it is exactly on the line*/
		if (d1 + d2 >= lineLen - buffer && d1 + d2 <= lineLen + buffer) {
			return true;
		}
		return false;
	}
	generateEdgeLine(edgeName, x, y, width, height) {
		let edgeLine = new this.Line();
		switch (edgeName) {
			case "left": {
				edgeLine.x1 = x - width / 2;
				edgeLine.y1 = y - height / 2;
				edgeLine.x2 = x - width / 2;
				edgeLine.y2 = y + height / 2;
				break;	
			}
			case "right": {
				edgeLine.x1 = x + width / 2;
				edgeLine.y1 = y - height / 2;
				edgeLine.x2 = x + width / 2;
				edgeLine.y2 = y + height / 2;
				break;	
			}
			case "top": {
				edgeLine.x1 = x - width / 2;
				edgeLine.y1 = y - height / 2;
				edgeLine.x2 = x + width / 2;
				edgeLine.y2 = y - height / 2;
				break;	
			}
			case "bottom": {
				edgeLine.x1 = x - width / 2;
				edgeLine.y1 = y + height / 2;
				edgeLine.x2 = x + width / 2;
				edgeLine.y2 = y + height / 2;
				break;	
			}
		}
		return edgeLine;
	}
	squareCollisionAngle(closestEdge) {
		switch (closestEdge) {
			case "left": {
				return 0;
			}
			case "right": {
				return Math.PI;
			}
			case "top": {
				return Math.PI / 2;
			}
			case "bottom": {
				return -Math.PI / 2;
			}
		}
	}
	distanceBetweenAABB(rectangleX1, rectangleY1, rectangleWidth1, rectangleHeight1, rectangleX2, rectangleY2, rectangleWidth2, rectangleHeight2) {
		let halfWidth1 = rectangleWidth1 / 2;
		let halfWidth2 = rectangleWidth2 / 2;
		let halfHeight1 = rectangleHeight1 / 2;
		let halfHeight2 = rectangleHeight2 / 2;
		let left = Math.min(rectangleX1 + halfWidth1, rectangleX2 + halfWidth2);
		let top = Math.min(rectangleY1 + halfHeight1, rectangleY2 + halfHeight2);
		let right = Math.max(rectangleX1 - halfWidth1, rectangleX2 - halfWidth2);
		let bottom = Math.max(rectangleY1 - halfHeight1, rectangleY2 - halfHeight2);
		let width = left - right;
		let height = top - bottom;
		return Math.min(width, height);
	}
	closestEdgeAngle(point, rect) {
		let transformPoint = point.getComponent("transform");
		let transformRect = rect.getComponent("transform");
		if (transformRect.scaleX / 2 === transformRect.scaleY / 2) {
			let angle = Utils.direction(transformPoint.x, transformPoint.y, transformRect.x, transformRect.y);
			if (angle > -Math.PI / 4 && angle < Math.PI / 4) {
				return 0;	
			} else if (angle > Math.PI / 2 - Math.PI / 4 && angle < Math.PI / 2 + Math.PI / 4) {
				return Math.PI / 2;
			} else if (angle > -Math.PI / 2 - Math.PI / 4 && angle < -Math.PI / 2 + Math.PI / 4) {
				return -Math.PI / 2;
			} else {
				return Math.PI;
			}
		} else if (transformRect.scaleX / 2 > transformRect.scaleY / 2) {
			let leftPoint = new Vector(transformRect.x - transformRect.scaleX / 2 + transformRect.scaleY / 2, transformRect.y);
			let rightPoint = new Vector(transformRect.x + transformRect.scaleX / 2 - transformRect.scaleY / 2, transformRect.y);
			let leftPointDistance = Utils.fastDist(transformPoint.x - transformRect.scaleX / 2, transformPoint.y, leftPoint.x, leftPoint.y);
			let rightPointDistance = Utils.fastDist(transformPoint.x + transformRect.scaleX / 2, transformPoint.y, rightPoint.x, rightPoint.y);
			if (leftPointDistance < rightPointDistance) {
				let dir = Utils.direction(transformPoint.x - transformRect.scaleX / 2, transformPoint.y, leftPoint.x, leftPoint.y);
				if (Math.abs(dir) < Math.PI / 4) {
					return 0;
				}
			} else {
				let dir = Utils.direction(transformPoint.x + transformRect.scaleX / 2, transformPoint.y, rightPoint.x, rightPoint.y);
				if (Math.abs(dir) > Math.PI * 3 / 4) {
					return Math.PI;
				}
			}
			let dir = Utils.direction(transformPoint.x, transformPoint.y, transformRect.x, transformRect.y);
			return Math.sign(dir) * Math.PI / 2;
		} else {
			let leftPoint = new Vector(transformRect.x, transformRect.y - transformRect.scaleY / 2 + transformRect.scaleX / 2);
			let rightPoint = new Vector(transformRect.x, transformRect.y + transformRect.scaleY / 2 - transformRect.scaleX / 2);
			let leftPointDistance = Utils.fastDist(transformPoint.x, transformPoint.y - transformRect.scaleY / 2, leftPoint.x, leftPoint.y);
			let rightPointDistance = Utils.fastDist(transformPoint.x, transformPoint.y + transformRect.scaleY / 2, rightPoint.x, rightPoint.y);
			if (leftPointDistance < rightPointDistance) {
				let dir = Utils.direction(transformPoint.x, transformPoint.y - transformRect.scaleY / 2, leftPoint.x, leftPoint.y);
				if (dir > Math.PI / 4 && dir < Math.PI * 3 / 4) {
					return Math.PI / 2;
				}
			} else {
				let dir = Utils.direction(transformPoint.x, transformPoint.y + transformRect.scaleX / 2, rightPoint.x, rightPoint.y);
				if (dir < -Math.PI / 4 && dir > -Math.PI * 3 / 4) {
					return -Math.PI / 2;
				}
			}
			let dir = Utils.direction(transformPoint.x, transformPoint.y, transformRect.x, transformRect.y);
			return Math.round(dir / Math.PI) * Math.PI;
		}
	}
	resizeBounds(width, height) {
		this.width = width;
		this.height = height;
		this.xOffset = width / 2;
		this.yOffset = height / 2;
	}
	gridCells(x, y) {
		this.collisionGridCellsX = x;
		this.collisionGridCellsY = y;
	}
	gridSize(size) {
		this.collisionGridCellsX = Math.ceil(this.width / size);
		this.collisionGridCellsY = Math.ceil(this.height / size);
	}
	integrate(dt, object) {
		let transform = object.getComponent("transform");
		let rigidbody = object.getComponent("rigidbody");
		/* prevent integration and reset derivative values for static objects */
		if (rigidbody.isStatic) {
			rigidbody.velocityX = 0;
			rigidbody.velocityY = 0;
			return;
		}
		/* bounds checking for objects */
		let sizeX = 0;
		let sizeY = 0;
		if (rigidbody.type === "circle") {
			let max = Math.max(transform.scaleX, transform.scaleY) / 2;
			sizeX = max;
			sizeY = max;
		} else if (rigidbody.type === "rectangle") {
			sizeX = transform.scaleX / 2;
			sizeY = transform.scaleY / 2;
		}
		let restitution = rigidbody.restitution;
		let friction = 1 - (1 - restitution) ** this.iterations;
		let XPositionOnNextStep = transform.x + rigidbody.velocityX * dt;
		let YPositionOnNextStep = transform.y + rigidbody.velocityY * dt;
		/* bounds check for left side of screen */
		if (XPositionOnNextStep < sizeX - this.xOffset) {
			rigidbody.velocityX *= -restitution;
			/* apply object friction */
			rigidbody.velocityY *= friction;
			transform.x = sizeX - this.xOffset;
		}
		/* bounds check for right side of screen */
		if (XPositionOnNextStep > this.width - sizeX - this.xOffset) {
			rigidbody.velocityX *= -restitution;
			/* apply object friction */
			rigidbody.velocityY *= friction;
			transform.x = this.width - sizeX - this.xOffset;
		}
		/* bounds check for top side of screen */
		if (YPositionOnNextStep < sizeY - this.yOffset) {
			rigidbody.velocityY *= -restitution;
			/* apply object friction */
			rigidbody.velocityX *= friction;
			transform.y = sizeY - this.yOffset;
		}
		/* bounds check for bottom of screen */
		if (YPositionOnNextStep > this.height - sizeY - this.yOffset) {
			rigidbody.velocityY *= -restitution;
			/* apply object friction */
			rigidbody.velocityX *= friction;
			transform.y = this.height - sizeY - this.yOffset;
		}
		/* verlet integration */
		let newPosX = transform.x + rigidbody.velocityX * dt + rigidbody.accelerationX * (dt * dt * 0.5);
		let newPosY = transform.y + rigidbody.velocityY * dt + rigidbody.accelerationY * (dt * dt * 0.5);
		let newVelX = rigidbody.velocityX + (rigidbody.accelerationX + this.globalGravity.x) * dt;
		let newVelY = rigidbody.velocityY + (rigidbody.accelerationY + this.globalGravity.y) * dt;
		/* update new values */
		transform.x = newPosX;
		transform.y = newPosY;
		rigidbody.velocityX = newVelX * 0.999;
		rigidbody.velocityY = newVelY * 0.999;
	}
	/*
	 *	allocated rigid bodies into grid sections to reduce collision detection time 
	 *	objects can be in more than 1 grid cell at a time
	 */
	allocateRigidbodies(objects) {
		let collisionGrid = [];
		/* fill collision grid array with empty arrays */
		for (let i = 0, len = this.collisionGridCellsX * this.collisionGridCellsY; i < len; i++) {
			collisionGrid.push([]);
		}
		/* loop across every object */
		for (let index = 0; index < objects.length; index++) {
			let rigidbody = objects[index].getComponent("rigidbody");
			let transform = objects[index].getComponent("transform");
			/* ignore if the object is not expected to collide */
			if (rigidbody.isColliding === false) continue;
			/* ignore if the object is not allocatable */
			if (rigidbody.type === "line") continue;
			if (rigidbody.type === "circle") {
				let indexes = [];
				for (let j = 0, len = this.xs.length; j < len; j++) {
					/* map the x and y values of an object to between a grid */
					let max = Math.max(transform.scaleX, transform.scaleY) / 2;
					let x = Math.floor(Utils.map(transform.x + max * this.xs[j], -this.width / 2, this.width / 2, 0, this.collisionGridCellsX));
					let y = Math.floor(Utils.map(transform.y + max * this.ys[j], -this.width / 2, this.width / 2, 0, this.collisionGridCellsY));
					this.addToCollisionGrid(collisionGrid, x, y, indexes, index);	
				}
			} else if (rigidbody.type === "rectangle") {
				let gridSizeX = (this.width / this.collisionGridCellsX);
				let gridSizeY = (this.height / this.collisionGridCellsY);
				let gridCellsXSpan = Math.ceil(transform.scaleX / gridSizeX);
				let gridCellsYSpan = Math.ceil(transform.scaleY / gridSizeY);
				let indexes = [];
				for (let i = 0; i < gridCellsXSpan + 1; i++) {
					for (let j = 0; j < gridCellsYSpan + 1; j++) {
						let x = Math.floor(Utils.map(transform.x - gridSizeX * gridCellsXSpan / 2 + gridSizeX * i, -this.width / 2, this.width / 2, 0, this.collisionGridCellsX));
						let y = Math.floor(Utils.map(transform.y - gridSizeY * gridCellsYSpan / 2 + gridSizeY * j, -this.width / 2, this.width / 2, 0, this.collisionGridCellsY));
						this.addToCollisionGrid(collisionGrid, x, y, indexes, index);
					}
				}
			}
		}
		return collisionGrid;
	}
	addToCollisionGrid(grid, x, y, indexes, index) {
		/* bounds checks for object (including NaN error detection) */
		if (x < 0) x = 0;
		if (y < 0) y = 0;
		if (x > this.collisionGridCellsX - 1) x = this.collisionGridCellsX - 1;
		if (y > this.collisionGridCellsY - 1) y = this.collisionGridCellsY - 1;
		let objectHasntBeenPushed = true;
		/* if the object exists already in this grid area, ignore it */
		for (let k = 0, len = indexes.length; k < len; k += 2) {
			if (indexes[k] === x && indexes[k + 1] === y) {
				objectHasntBeenPushed = false;
				break;
			}
		}
		/* push object to grid if it hasn't already been */
		if (objectHasntBeenPushed) {
			/* catching NaN errors which cause critical program errors */
			try {
				grid[y * this.collisionGridCellsX + x].push(index);
				indexes.push(x, y);
			} catch (e) {
				console.warn("dumping stack trace");
				console.warn("x: " + x);
				console.warn("y: " + y);
				throw new Error("Potato Engine Allocation ERROR: " + e);
			}
		}
	}
	isColliding(o1, o2) {
		let rigidbodyo1 = o1.getComponent("rigidbody");
		let transformo1 = o1.getComponent("transform");
		let rigidbodyo2 = o2.getComponent("rigidbody");
		let transformo2 = o2.getComponent("transform");
		let max1 = Math.max(transformo1.scaleX, transformo1.scaleY) / 2;
		let max2 = Math.max(transformo2.scaleX, transformo2.scaleY) / 2;
		if (rigidbodyo1.type === "circle" && rigidbodyo2.type === "circle") {
			/* approximate the distance using a fast distance estimation (without square root) to save performance */
			return Utils.fastDist(transformo1.x, transformo1.y, transformo2.x, transformo2.y) <= Math.pow(max1 + max2, 2);
		} else if (((rigidbodyo1.type === "circle" && rigidbodyo2.type === "rectangle") || (rigidbodyo1.type === "rectangle" && rigidbodyo2.type === "circle"))) {
			if (rigidbodyo1.type === "circle") {
				return this.isCircleRectColliding(transformo1.x, transformo1.y, max1, transformo2.x, transformo2.y, transformo2.scaleX, transformo2.scaleY);
			} else {
				return this.isCircleRectColliding(transformo2.x, transformo2.y, max2, transformo1.x, transformo1.y, transformo1.scaleX, transformo1.scaleY);
			}
		} else if (rigidbodyo1.type === "rectangle" && rigidbodyo2.type === "rectangle") {
			return this.isRectRectColliding(transformo1.x, transformo1.y, transformo1.scaleX, transformo1.scaleY, transformo2.x, transformo2.y, transformo2.scaleX, transformo2.scaleY);
		}
	}
	calculateMassRatio(o1, o2) {
		let rigidbodyo1 = o1.getComponent("rigidbody");
		let transformo1 = o1.getComponent("transform");
		let rigidbodyo2 = o2.getComponent("rigidbody");
		let transformo2 = o2.getComponent("transform");
		/* calculate mass from density */
		let masso1 = ((rigidbodyo1.type === "circle") ? Math.PI * Math.max(transformo1.scaleX, transformo1.scaleY) ** 2 : transformo1.scaleX * transformo1.scaleY) * rigidbodyo1.density;
		let masso2 = ((rigidbodyo2.type === "circle") ? Math.PI * Math.max(transformo2.scaleX, transformo2.scaleY) ** 2 : transformo2.scaleX * transformo2.scaleY) * rigidbodyo2.density;
		/* calculate the square rooted mass ratio */
		let massRatio = Math.log(Math.max(masso1, masso2) / Math.min(masso1, masso2) + 1) / Math.log(2);
		return ((masso1 > masso2) ? 1 / massRatio : massRatio);
	}
	resolveCircleCircle(o1, o2) {
		let rigidbodyo1 = o1.getComponent("rigidbody");
		let transformo1 = o1.getComponent("transform");
		let rigidbodyo2 = o2.getComponent("rigidbody");
		let transformo2 = o2.getComponent("transform");
		let max1 = Math.max(transformo1.scaleX, transformo1.scaleY) / 2;
		let max2 = Math.max(transformo2.scaleX, transformo2.scaleY) / 2;
		/* impulse resolution */
		/* get angle between objects */
		let angle = Utils.direction(transformo1.x, transformo1.y, transformo2.x, transformo2.y);
		/* get true distance between objects */
		let dist = Utils.dist(transformo1.x, transformo1.y, transformo2.x, transformo2.y) - max1 - max2;
		/* generate x and y from magnitude and direction */
		return new VectorFromAngle(angle, dist);
	}
	/* o1 must be a circle and o2 must be a rectangle */
	resolveCircleRect(o1, o2) {
		let rigidbodyo1 = o1.getComponent("rigidbody");
		let transformo1 = o1.getComponent("transform");
		let rigidbodyo2 = o2.getComponent("rigidbody");
		let transformo2 = o2.getComponent("transform");
		let max1 = Math.max(transformo1.scaleX, transformo1.scaleY) / 2;
		let closestEdge = this.getClosestEdge(transformo1.x, transformo1.y, transformo2.x, transformo2.y, transformo2.scaleX, transformo2.scaleY);
		if (closestEdge !== null) {			
			let useLine = this.generateEdgeLine(closestEdge, transformo2.x, transformo2.y, transformo2.scaleX, transformo2.scaleY);
			let distanceToLine = this.distanceLinePoint(useLine.x1, useLine.y1, useLine.x2, useLine.y2, transformo1.x, transformo1.y) - max1;
			let closestPoint = this.getClosestPoint(useLine.x1, useLine.y1, useLine.x2, useLine.y2, transformo1.x, transformo1.y);
			let angle = this.squareCollisionAngle(closestEdge);
			if (angle === Math.PI || angle === 0) {
				rigidbodyo1.velocityY *= rigidbodyo2.surfaceFriction;
				rigidbodyo2.velocityY *= rigidbodyo2.surfaceFriction;
			} else {
				rigidbodyo1.velocityX *= rigidbodyo2.surfaceFriction;
				rigidbodyo2.velocityX *= rigidbodyo2.surfaceFriction;
			}
			return new VectorFromAngle(angle, distanceToLine);
		} else {
			/* object is within the center of the square, use normal circle-circle collisions to push it out */
			/* impulse resolution */
			/* get angle between objects */
			let angle = Utils.direction(transformo1.x, transformo1.y, transformo2.x, transformo2.y);
			/* get true distance between objects */
			let dist = Utils.dist(transformo1.x, transformo1.y, transformo2.x, transformo2.y) - max1;
			/* generate x and y from magnitude and direction */
			return new VectorFromAngle(angle, dist);
		}
	}
	resolveRectRect(o1, o2) {
		let rigidbodyo1 = o1.getComponent("rigidbody");
		let transformo1 = o1.getComponent("transform");
		let rigidbodyo2 = o2.getComponent("rigidbody");
		let transformo2 = o2.getComponent("transform");
		let angle = this.closestEdgeAngle(o2, o1);
		if (Math.abs(angle) === Math.PI || angle === 0) {
			rigidbodyo1.velocityY *= rigidbodyo2.surfaceFriction;
			rigidbodyo2.velocityY *= rigidbodyo2.surfaceFriction;
		} else {
			rigidbodyo1.velocityX *= rigidbodyo1.surfaceFriction;
			rigidbodyo2.velocityX *= rigidbodyo1.surfaceFriction;
		}
		let distance = this.distanceBetweenAABB(transformo1.x, transformo1.y, transformo1.scaleX, transformo1.scaleY, transformo2.x, transformo2.y, transformo2.scaleX, transformo2.scaleY);
		return new VectorFromAngle(angle, distance);
	}
	resolveCollision(o1, o2) {
		let rigidbodyo1 = o1.getComponent("rigidbody");
		let rigidbodyo2 = o2.getComponent("rigidbody");
		if (rigidbodyo1.type === "circle" && rigidbodyo2.type === "circle") {
			return this.resolveCircleCircle(o1, o2);
		} else if (((rigidbodyo1.type === "circle" && rigidbodyo2.type === "rectangle") || (rigidbodyo1.type === "rectangle" && rigidbodyo2.type === "circle"))) {
				return this.resolveCircleRect(o1, o2);
		} else if (rigidbodyo1.type === "rectangle" && rigidbodyo2.type === "rectangle") {
				return this.resolveRectRect(o1, o2);
		} else {
			/* default case if the physics engine cannot handle this type of collision */
			return new Vector();
		}
	}
	applyImpulse(impulse, massRatio, o1, o2) {
		let rigidbodyo1 = o1.getComponent("rigidbody");
		let transformo1 = o1.getComponent("transform");
		let rigidbodyo2 = o2.getComponent("rigidbody");
		let transformo2 = o2.getComponent("transform");
		if (rigidbodyo1.isStatic === false) {
			/* subtract impulse to velocity */
			rigidbodyo1.velocityX += impulse.x * (1 - rigidbodyo1.restitution) * massRatio;
			rigidbodyo1.velocityY += impulse.y * (1 - rigidbodyo1.restitution) * massRatio;
			/* subtract impulse to position */
			transformo1.x += impulse.x * this.errorCorrectionCoefficient * massRatio;
			transformo1.y += impulse.y * this.errorCorrectionCoefficient * massRatio;
		}
		if (rigidbodyo2.isStatic === false) {
			/* add impulse to velocity */
			rigidbodyo2.velocityX -= impulse.x * (1 - rigidbodyo2.restitution) / massRatio;
			rigidbodyo2.velocityY -= impulse.y * (1 - rigidbodyo2.restitution) / massRatio;
			/* add impulse to position */
			transformo2.x -= impulse.x * this.errorCorrectionCoefficient / massRatio;
			transformo2.y -= impulse.y * this.errorCorrectionCoefficient / massRatio;
		}
	}
	detectCollisions(objects, collisionGrid) {
		/* if only 1 object exists in the collision grid, then ignore */
		for (let i = 0, len = collisionGrid.length; i < len; i++) {
			if (collisionGrid[i].length <= 1) {
				continue;
			}
			let len2 = collisionGrid[i].length;
			for (let j = 0; j < len2; j++) {
				for (let k = j + 1; k < len2; k++) {
					let o1 = objects[collisionGrid[i][j]];
					let o2 = objects[collisionGrid[i][k]];
					/* ignore collision detection between static objects if they are both static */
					if (o1.getComponent("rigidbody").isStatic && o2.getComponent("rigidbody").isStatic) {
						continue;
					}
					this.collisionChecks++;
					if (this.isColliding(o1, o2)) {
						this.collisions++;
						let massRatio = this.calculateMassRatio(o1, o2);
						if ((o2.getComponent("rigidbody").type === "circle" && o1.getComponent("rigidbody").type === "rectangle") || (o1.getComponent("rigidbody").type === "rectangle" && o2.getComponent("rigidbody").type === "rectangle" && o1.getComponent("transform").scaleX * o1.getComponent("transform").scaleY < o2.getComponent("transform").scaleX * o2.getComponent("transform").scaleY)) {
							massRatio = 1 / massRatio;
							let temp = o2;
							o2 = o1;
							o1 = temp;
						}
						let impulse = this.resolveCollision(o1, o2);
						/* in case of NaN calculation errors */
						if (isNaN(impulse.x)) {
							impulse.y = 0;
						}
						if ((isNaN(impulse.y))) {
							impulse.y = 0;
						}
						this.applyImpulse(impulse, massRatio, o1, o2);
						if (o1.hasComponent("behaviour")) {
							o1.getComponent("behaviour").runEvent("collision");
						}
						if (o2.hasComponent("behaviour")) {
							o2.getComponent("behaviour").runEvent("collision");
						}
					}
				}
			}
		}
	}
	/* to be called every frame by other functions */
	step(objects) {
		this.collisions = 0;
		this.collisionChecks = 0;
		/* calculate delta time to be used by the iteration engine */
		const dt = this.timestep * (1 / this.iterations);
		let validObjects = [];
		let lineObjects = [];
		for (let i = 0; i < objects.length; i++) {
			if (objects[i].hasComponent("rigidbody") && objects[i].hasComponent("transform") ) {
				if (objects[i].getComponent("rigidbody").type === "rectangle" || objects[i].getComponent("rigidbody").type === "circle") {
					validObjects.push(objects[i]);
				}
				if (objects[i].getComponent("rigidbody").type === "line") {
					lineObjects.push(objects[i]);
				}
			}
		}
		for (let i = 0; i < this.iterations; i++) {
			/* integrate all objects */
			for (let j = 0; j < validObjects.length; j++) {
				this.integrate(dt, validObjects[j]);
			}
			this.detectLineCollisions(lineObjects, validObjects);
			/* allocate rigid bodies into the grid */
			let collisionGrid = this.allocateRigidbodies(validObjects);
			/* detect collision between objects */
			this.detectCollisions(validObjects, collisionGrid);
		}
	}
	/* n^3 which i don't like */
	detectLineCollisions(lineObjects, objects) {
		for (let i = 0; i < objects.length; i++) {
			if (objects[i].getComponent("rigidbody").type === "circle") {
				let transform = objects[i].getComponent("transform");
				let rigidbody = objects[i].getComponent("rigidbody");
				for (let j = 0; j < lineObjects.length; j++) {
					let line = lineObjects[j].getComponent("line");
					let transformLine = lineObjects[j].getComponent("transform");
					for (let k = 0; k < line.points.length - 1; k++) {
						let max = Math.max(transform.scaleX, transform.scaleY) / 2;
						let cacheCos = Math.cos(transformLine.rotation);
						let cacheSin = Math.sin(transformLine.rotation);
						let currentPoint = new Vector(transformLine.x + line.points[k].x * cacheCos - line.points[k].y * cacheSin, transformLine.y + line.points[k].y * cacheCos + line.points[k].x * cacheSin);
						let nextPoint = new Vector(transformLine.x + line.points[k + 1].x * cacheCos - line.points[k + 1].y * cacheSin, transformLine.y + line.points[k + 1].y * cacheCos + line.points[k + 1].x * cacheSin);
						if (this.isLineCircleColliding(currentPoint.x, currentPoint.y, nextPoint.x, nextPoint.y, transform.x, transform.y, max)) {
							let distanceToLine = this.distanceLinePoint(currentPoint.x, currentPoint.y, nextPoint.x, nextPoint.y, transform.x, transform.y) - max;
							let closestPoint = this.getClosestPoint(currentPoint.x, currentPoint.y, nextPoint.x, nextPoint.y, transform.x, transform.y);
							let dir = Utils.direction(transform.x, transform.y, closestPoint.x, closestPoint.y);
							let impulse = new VectorFromAngle(dir, distanceToLine);
							rigidbody.velocityX += impulse.x * rigidbody.restitution;
							rigidbody.velocityY += impulse.y * rigidbody.restitution;
							transform.x += impulse.x * this.errorCorrectionCoefficient;
							transform.y += impulse.y * this.errorCorrectionCoefficient;
						}
					}
				}
			}
		}
	}
}
