import * as Utils from "./utils.js"
import {Vector, VectorFromAngle} from "./vector.js"

class Statistics {
	constructor() {
			this.integrationTime = 0;
			this.allocationTime = 0;
			this.collisionDetectionTime = 0;
			this.collisionResolutionTime = 0;
			this.collisionPairs = 0;
			this.checkedCollisionArrays = 0;
			this.collisionChecks = 0;
			this.collisionsResolved = 0;
	}
}

export class RigidBody {
	constructor(position, velocity, radius, density = 1, restitution = 0.5, isStatic = false, isColliding = true) {
		this.position = position;
		this.velocity = velocity;
		this.acceleration = new Vector(0, 0);
		this.radius = radius;
		/* used instead of mass */
		this.density = density;
		/*	value in the range [0, 1] where
		 *	0 is no bounciness (all energy is lost, ball doesnt bounce)
		 *	and 1 is no energy loss (ball usually bounces forever)
		 */
		this.restitution = restitution;
		this.isStatic = isStatic;
		this.isColliding = isColliding;
	}
}


/* based off potato physics engine */
export class UnnamedPhysicsEngine {
	constructor(width = 5000, height = 5000, iterations = 4, gridCellsX = 25, gridCellsY = 25) {
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
		this.globalGravity = new Vector(0, -9.8 / 10);
		/* the amount of cells that the collision detection algorithms is allowed to sort into */
		this.collisionGridCellsX = gridCellsX;
		this.collisionGridCellsY = gridCellsY;
		/* 
		 *	amount of points that the rigid body allocation algorithm checks
		 *	by default checks 8 points, the 4 cardinal directions and the diagonals
		 *	it can potentially miss collision for extremely small grids or large objects
		 */
		this.xs = [1, Math.SQRT1_2, 0, -Math.SQRT1_2, -1, Math.SQRT1_2, 0, Math.SQRT1_2];
		this.ys = [0, Math.SQRT1_2, 1, Math.SQRT1_2, 0, -Math.SQRT1_2, -1, -Math.SQRT1_2];
		/* value between [0, 1] 
		 *	where 0 is no correction, however this can cause objects to phase through each other
		 *	and 1 is complete correction, however this can cause extreme jittering
		 *	0.25 is the default value
		 */
		this.errorCorrectionCoefficient = 0.5;

		this.statistics = new Statistics();
	}
	integrate(dt, object) {
		let newPosX = object.position.x + object.velocity.x * dt + object.acceleration.x * (dt * dt * 0.5);
		let newPosY = object.position.y + object.velocity.y * dt + object.acceleration.y * (dt * dt * 0.5);
		let newVelX = object.velocity.x + (object.acceleration.x + this.globalGravity.x) * dt;
		let newVelY = object.velocity.y + (object.acceleration.y + this.globalGravity.y) * dt;
		/* update new values */
		object.position.x = newPosX;
		object.position.y = newPosY;
		object.velocity.x = newVelX;
		object.velocity.y = newVelY;
	}
	checkEdges(object) {
		/* check edges */
		if (object.position.x < -this.width / 2 + object.radius) {
			object.position.x = -this.width / 2 + object.radius;
			object.velocity.x *= -object.restitution;
		}
		if (object.position.x > this.width / 2 - object.radius) {
			object.position.x = this.width / 2 - object.radius;
			object.velocity.x *= -object.restitution;
		}
		if (object.position.y < -this.height / 2 + object.radius) {
			object.position.y = -this.height / 2 + object.radius;
			object.velocity.y *= -object.restitution;
		}
		if (object.position.y > this.height / 2 - object.radius) {
			object.position.y = this.height / 2 - object.radius;
			object.velocity.y *= -object.restitution;
		}
	}
	allocateRigidbodies(objects) {
		let collisionGrid = [];
		/* fill collision grid array with empty arrays */
		// for (let i = 0, len = this.collisionGridCellsX * this.collisionGridCellsY; i < len; i++) {
		// 	collisionGrid.push([]);
		// }
		/* loop across every object */
		for (let index = 0; index < objects.length; index++) {
			let object = objects[index];
			/* ignore if the object is not expected to collide */
			if (object.isColliding === false) continue;
			let indexes = [];
			for (let j = 0, len = this.xs.length; j < len; j++) {
				/* map the x and y values of an object to between a grid */
				let x = Math.floor(Utils.map(object.position.x + object.radius * this.xs[j], -this.width / 2, this.width / 2, 0, this.collisionGridCellsX));
				let y = Math.floor(Utils.map(object.position.y + object.radius * this.ys[j], -this.width / 2, this.width / 2, 0, this.collisionGridCellsY));
				this.addToCollisionGrid(collisionGrid, x, y, indexes, index);	
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
			if (!grid[y * this.collisionGridCellsX + x]) {
				grid[y * this.collisionGridCellsX + x] = [];
			}
			grid[y * this.collisionGridCellsX + x].push(index);
			indexes.push(x, y);
		}
	}
	isColliding(o1, o2) {
		/* approximate the distance using a fast distance estimation (without square root) to save performance */
		return Utils.fastDist(o1.position.x, o1.position.y, o2.position.x, o2.position.y) <= Math.pow(o1.radius + o2.radius, 2);
	}
	calculateMassRatio(o1, o2) {
		let masso1 = Math.PI * o1.radius ** 2 * o1.density;
		let masso2 = Math.PI * o2.radius ** 2 * o1.density;
		/* calculate mass from density */
		/* calculate the square rooted mass ratio */
		let massRatio = Math.max(masso1, masso2) / (masso1 + masso2);
		// let massRatio = Math.log(Math.max(masso1, masso2) / Math.min(masso1, masso2)) + 1;
		return ((masso1 > masso2) ? 1 / massRatio : massRatio);
	}
	resolveCircleCircle(o1, o2) {
		/* impulse resolution */
		/* get angle between objects */
		let angle = Utils.direction(o1.position.x, o1.position.y, o2.position.x, o2.position.y);
		/* get true distance between objects */
		let dist = Utils.dist(o1.position.x, o1.position.y, o2.position.x, o2.position.y) - o1.radius - o2.radius;
		/* generate x and y from magnitude and direction */
		return new VectorFromAngle(angle, dist / 2);
	}
	resolveCollisions(collisionPairs, dt) {
		this.statistics.collisionsResolved += collisionPairs.length;
		this.statistics.collisionPairs += collisionPairs.length;
		for (let i = 0; i < collisionPairs.length; i++) {
			let o1 = collisionPairs[i][0];
			let o2 = collisionPairs[i][1];
			let massRatio = this.calculateMassRatio(o1, o2);
			let impulse = this.resolveCircleCircle(o1, o2);
			this.applyImpulse(impulse, massRatio, o1, o2, dt);
			this.checkEdges(o1);
			this.checkEdges(o2);
		}
	}
	applyImpulse(impulse, massRatio, o1, o2, dt) {
		if (o1.isStatic || o2.isStatic) {
			impulse.x *= 2;
			impulse.y *= 2;
		}
		if (o1.isStatic === false) {
			/* subtract impulse to velocity */
			o1.velocity.x += impulse.x * (1 - o1.restitution) * massRatio * dt;
			o1.velocity.y += impulse.y * (1 - o1.restitution) * massRatio * dt;
			/* subtract impulse to position */
			o1.position.x += impulse.x * this.errorCorrectionCoefficient * massRatio * dt;
			o1.position.y += impulse.y * this.errorCorrectionCoefficient * massRatio * dt;
		}
		if (o2.isStatic === false) {
			/* add impulse to velocity */
			o2.velocity.x -= impulse.x * (1 - o2.restitution) / massRatio * dt;
			o2.velocity.y -= impulse.y * (1 - o2.restitution) / massRatio * dt;
			/* add impulse to position */
			o2.position.x -= impulse.x * this.errorCorrectionCoefficient / massRatio * dt;
			o2.position.y -= impulse.y * this.errorCorrectionCoefficient / massRatio * dt;
		}
	}
	detectCollisions(objects, collisionGrid) {
		let collisionPairs = [];
		/* remove empty arrays */
		collisionGrid = collisionGrid.filter(Boolean);
		/* if only 1 object exists in the collision grid, then ignore */
		for (let i = 0, len = collisionGrid.length; i < len; i++) {
			if (collisionGrid[i].length > 1) {
				this.statistics.checkedCollisionArrays++;
				let len2 = collisionGrid[i].length;
				for (let j = 0; j < len2; j++) {
					for (let k = j + 1; k < len2; k++) {
						let o1 = objects[collisionGrid[i][j]];
						let o2 = objects[collisionGrid[i][k]];
						/* ignore collision detection between static objects if they are both static */
						if (o1.isStatic && o2.isStatic) {
							continue;
						}
						this.statistics.collisionChecks++;
						if (this.isColliding(o1, o2)) {
							collisionPairs.push([o1, o2]);
						}
					}
				}
			}
		}
		return collisionPairs;
	}
	/* to be called every frame by other functions */
	step(objects) {
		this.statistics.integrationTime = 0;
		this.statistics.allocationTime = 0;
		this.statistics.collisionDetectionTime = 0;
		this.statistics.collisionResolutionTime = 0;
		this.statistics.collisionPairs = 0;
		this.statistics.checkedCollisionArrays = 0;
		this.statistics.collisionChecks = 0;
		this.statistics.collisionsResolved = 0;
		/* calculate delta time to be used by the iteration engine */
		const dt = this.timestep * (1 / this.iterations);
		for (let i = 0; i < this.iterations; i++) {

			let now = window.performance.now();
			/* integration*/
			for (let j = 0; j < objects.length; j++) {
				this.integrate(dt, objects[j]);
				this.checkEdges(objects[j]);
			}
			this.statistics.integrationTime += window.performance.now() - now;

			now = window.performance.now();
			/* allocation */
			let collisionGrid = this.allocateRigidbodies(objects);
			this.statistics.allocationTime += window.performance.now() - now;

			let collisionPairs = [];
			let passes = 0;
			let maxPasses = 1;
			while (passes === 0 || (collisionPairs.length > 0 && passes < maxPasses)) {
				now = window.performance.now();
				/* detection */
				collisionPairs = this.detectCollisions(objects, collisionGrid);
				this.statistics.collisionDetectionTime += window.performance.now() - now;
				
				now = window.performance.now();
				/* resolution */
				this.resolveCollisions(collisionPairs, dt);
				this.statistics.collisionResolutionTime += window.performance.now() - now;

				passes++;
			}
		}
	}
}