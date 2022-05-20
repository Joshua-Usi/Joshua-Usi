import * as Utils from "./utils.js"
import {Vector, VectorFromAngle} from "./vector.js"

class Statistics {
	constructor() {
			this.integrationTime = 0;
			this.allocationTime = 0;
			this.collisionDetectionTime = 0;
			this.collisionResolutionTime = 0;
			this.checkedCollisionArrays = 0;
			this.collisionChecks = 0;
			this.collisionsResolved = 0;
	}
}

export class RigidBody {
	constructor(position, velocity, radius, density = 1, restitution = 0.5, isStatic = false, isColliding = true, colour = [1, 1, 1, 0.25]) {
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
		this.colour = colour;
	}
}

export class UnnamedPhysicsEngine {
	constructor(width = 5000, height = 5000, iterations = 2, gridCellsX = 50, gridCellsY = 50) {
		/* gravity is 9.8 downwards and this simulation runs at 60fps */
		this.gravity = new Vector(0, -9.8 / 120);
		/* maximal bounds of the physics engine */
		this.width = width;
		this.height = height;
		/* more iterations means more accurate simulation */
		this.iterations = iterations;
		this.timestep = 1;
		/* the amount of cells that the collision detection algorithms is allowed to sort into */
		this.collisionGridCellsX = gridCellsX;
		this.collisionGridCellsY = gridCellsY;
		/* amount of points that the rigid body allocation algorithm checks */
		this.xs = [1, Math.cos(Math.PI / 4), 0, Math.cos(3 * Math.PI / 4), -1, Math.cos(5 * Math.PI / 4), 0, Math.cos(7 * Math.PI / 4)];
		this.ys = [0, Math.sin(Math.PI / 4), 1, Math.sin(3 * Math.PI / 4), 0, Math.sin(5 * Math.PI / 4), -1, Math.sin(7 * Math.PI / 4)];

		this.statistics = new Statistics();
	}
	integrate(rigidBody, dt) {
		/* prevent integration for static objects */
		if (rigidBody.isStatic) {
			rigidBody.velocity.x = 0;
			rigidBody.velocity.y = 0;
			rigidBody.acceleration.x = 0;
			rigidBody.acceleration.y = 0;
			return;
		}
		/* verlet integration */
		let newPosX = rigidBody.position.x + rigidBody.velocity.x * dt + rigidBody.acceleration.x * (dt * dt * 0.5);
		let newPosY = rigidBody.position.y + rigidBody.velocity.y * dt + rigidBody.acceleration.y * (dt * dt * 0.5);
		let newAccX = this.gravity.x;
		let newAccY = this.gravity.y;
		let newVelX = rigidBody.velocity.x + (rigidBody.acceleration.x + newAccX) * (dt * 0.5);
		let newVelY = rigidBody.velocity.y + (rigidBody.acceleration.y + newAccY) * (dt * 0.5);
		/* update new values */
		rigidBody.position.x = newPosX;
		rigidBody.position.y = newPosY;
		rigidBody.acceleration.x = newAccX;
		rigidBody.acceleration.y = newAccY;
		rigidBody.velocity.x = newVelX;
		rigidBody.velocity.y = newVelY;
	}
	checkEdges(rigidBody, dt) {
		/* bounds checking for objects */
		let size = rigidBody.radius;
		let restitution = rigidBody.restitution;
		/* bounds check for left side of screen */
		if (rigidBody.position.x + rigidBody.velocity.x * dt < -this.width / 2 + size) {
			rigidBody.velocity.x *= -restitution;
			/* apply object friction */
			// rigidBody.velocity.y *= 1 - (1 - restitution) ** this.iterations;
			rigidBody.position.x = -this.width / 2 + size;
		}
		/* bounds check for right side of screen */
		if (rigidBody.position.x + rigidBody.velocity.x * dt > this.width / 2 - size) {
			rigidBody.velocity.x *= -restitution;
			/* apply object friction */
			// rigidBody.velocity.y *= 1 - (1 - restitution) ** this.iterations;
			rigidBody.position.x = this.width / 2 - size;
		}
		/* bounds check for top side of screen */
		if (rigidBody.position.y + rigidBody.velocity.y * dt < -this.height / 2 + size) {
			rigidBody.velocity.y *= -restitution;
			/* apply object friction */
			// rigidBody.velocity.x *= 1 - (1 - restitution) ** this.iterations;
			rigidBody.position.y = -this.height / 2 + size;
		}
		/* bounds check for bottom of screen */
		if (rigidBody.position.y + rigidBody.velocity.y * dt > this.height / 2 - size) {
			rigidBody.velocity.y *= -restitution;
			/* apply object friction */
			// rigidBody.velocity.x *= 1 - (1 - restitution) ** this.iterations;
			rigidBody.position.y = this.height / 2 - size;
		}
	}
	integrateRigidbodies(rigidBodies, dt) {
		for (let i = 0; i < rigidBodies.length; i++) {
			this.integrate(rigidBodies[i], dt);
			this.checkEdges(rigidBodies[i], dt);
		}
	}
	/* allocated rigid bodies into grid sections to reduce collision detection time */
	/* objects can be in more than 1 grid cell at a time */
	allocateRigidBodies(rigidBodies) {
		let collisionArrays = [];
		/* empty collision grid array*/
		for (let i = 0, len = this.collisionGridCellsX * this.collisionGridCellsY; i < len; i++) {
			collisionArrays.push([]);
		}
		/* loop across every object*/
		for (let i = 0; i < rigidBodies.length; i++) {
			if (rigidBodies[i].isColliding === false) continue;
			this.statistics.collisionArrays++;
			let indexes = [];
			for (let j = 0, len = this.xs.length; j < len; j++) {
				/* map the x and y values of an object to between a grid */
				let x = Math.floor(Utils.map(rigidBodies[i].position.x + rigidBodies[i].radius * this.xs[j], -this.width / 2, this.width / 2, 0, this.collisionGridCellsX));
				let y = Math.floor(Utils.map(rigidBodies[i].position.y + rigidBodies[i].radius * this.ys[j], -this.height / 2, this.height / 2, 0, this.collisionGridCellsY));
				/* bounds checks for object*/
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
					collisionArrays[y * this.collisionGridCellsX + x].push(i);
					indexes.push(x, y);
				}
			}
		}
		return collisionArrays;
	}
	detectCollisions(collisionArrays, rigidBodies, dt) {
		let collisionPairs = [];
		/* if only 1 object exists in the collision grid, then ignore */
		for (let i = 0, len = collisionArrays.length; i < len; i++) {
			if (collisionArrays[i].length <= 1) {
				continue;
			}
			/* cache length as length is accessed alot */
			const len2 = collisionArrays[i].length;
			for (let j = 0; j < len2; j++) {
				for (let k = j + 1; k < len2; k++) {
					this.statistics.collisionChecks++;
					let o1 = rigidBodies[collisionArrays[i][j]];
					let o2 = rigidBodies[collisionArrays[i][k]];
					/* ignore collision detection between static objects if they are both static */
					if (o1.isStatic && o2.isStatic) continue;
					/* approximate the distance using a fast distance estimation (without square root) to save performance */
					if (Utils.fastDist(o1.position.x, o1.position.y, o2.position.x, o2.position.y) <= (o1.radius + o2.radius) ** 2) {
						let min = Math.min(collisionArrays[i][j], collisionArrays[i][k]);
						let max = Math.max(collisionArrays[i][j], collisionArrays[i][k]);
						collisionPairs.push([min, max]);
					}
				}
			}
		}
		this.statistics.collisionsResolved += collisionPairs.length;
		return collisionPairs;
	}
	resolveCollisions(collisionPairs, rigidBodies, dt) {
		for (let i = 0; i < collisionPairs.length; i++) {
			/* store object index temporarily */
			let o1 = rigidBodies[collisionPairs[i][0]];
			let o2 = rigidBodies[collisionPairs[i][1]];

			/* store masses */
			let m1 = Math.PI * o1.radius ** 2 * o1.density;
			let m2 = Math.PI * o2.radius ** 2 * o2.density;
			let m1r = m2 / (m1 + m2);
			let m2r = m1 / (m1 + m2);
			/* impulse resolution */
			/* get angle between objects */
			let angle = Utils.direction(o1.position.x, o1.position.y, o2.position.x, o2.position.y);
			/* get true distance between objects */
			let dist = Utils.dist(o1.position.x, o1.position.y, o2.position.x, o2.position.y) - o1.radius - o2.radius;
			/* generate x and y from magnitude and direction */
			let impulse = new VectorFromAngle(angle, dist * 0.75);
			/* if object is static, multiply force on non static object */
			if (o1.isStatic || o2.isStatic) {
				impulse.x *= 2;
				impulse.y *= 2;
			}
			/* apply impulses based on iteration count */
			if (o1.isStatic === false) {
				/* subtract impulse to velocity */
				o1.velocity.x -= impulse.x * m1r * o1.restitution;
				o1.velocity.y -= impulse.y * m1r * o1.restitution;
				/* subtract impulse to position */
				o1.position.x -= impulse.x * m1r;
				o1.position.y -= impulse.y * m1r;
				this.checkEdges(o1);
			}
			if (o2.isStatic === false) {
				/* add impulse to velocity */
				o2.velocity.x += impulse.x * m2r * o2.restitution;
				o2.velocity.y += impulse.y * m2r * o2.restitution;
				/* add impulse to position */
				o2.position.x += impulse.x * m2r;
				o2.position.y += impulse.y * m2r;
				this.checkEdges(o2);
			}
		}
	}
	/* to be called every frame by other functions */
	step(rigidBodies) {
		this.statistics = new Statistics();
		/* calcualte delta time to be used by the iteration engine */
		const dt = this.timestep * (1 / this.iterations);
		for (let i = 0; i < this.iterations; i++) {
			/* integration */
			let now = window.performance.now();
			this.integrateRigidbodies(rigidBodies, dt);
			this.statistics.integrationTime += window.performance.now() - now;


			for (let i = 0; i < 1; i++) {
				/* allocation */
				now = window.performance.now();
				let collisionArrays = this.allocateRigidBodies(rigidBodies);
				this.statistics.allocationTime += window.performance.now() - now;
				/* detection */
				now = window.performance.now();
				let collisionPairs = this.detectCollisions(collisionArrays, rigidBodies, dt);
				this.statistics.collisionDetectionTime += window.performance.now() - now;

				/* resolution */
				now = window.performance.now();
				for (let j = 0; j < 1; j++) {
					this.resolveCollisions(collisionPairs, rigidBodies, dt);	
				}
				this.statistics.collisionResolutionTime += window.performance.now() - now;
			}
		}
	}
}