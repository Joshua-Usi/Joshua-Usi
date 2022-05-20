export Physics = (function() {
	"use strict";
	/* physics instance is constructor allowing for modular use */
	class PhysicsInstance {
		constructor(width, height, iterations, gridCellsX, gridCellsY) {
			this.gravityX = 0;
			/* gravity is 9.8 and this simulation runs at 60fps */
			this.gravityY = 9.8 / 60;
			/* maximal bounds of the physics engine */
			this.width = width;
			this.height = height;
			/* more iterations means more accurate simulation*/
			this.iterations = iterations;
			this.timestep = 1;
			/* the amount of cells that the collision detection algorithms is allowed to sort into */
			this.collisionGridCellsX = gridCellsX;
			this.collisionGridCellsY = gridCellsY;
			this.collisionGrid = [];
			/* amount of points that the rigid body allocation algorithm checks */
			this.xs = [1, Math.cos(Math.PI / 4), 0, Math.cos(3 * Math.PI / 4), -1, Math.cos(5 * Math.PI / 4), 0, Math.cos(7 * Math.PI / 4)];
			this.ys = [0, Math.sin(Math.PI / 4), 1, Math.sin(3 * Math.PI / 4), 0, Math.sin(5 * Math.PI / 4), -1, Math.sin(7 * Math.PI / 4)];
			this.objects = {
				rigidBodies: [],
				constraints: [],
			};
		}
		/* colour must be css compatible */
		createRigidBody(posX, posY, velX, velY, accX, accY, size, mass, restitution, colour, isColliding, isStatic) {
			return {
				positionX: posX,
				positionY: posY,
				velocityX: velX,
				velocityY: velY,
				accelerationX: accX,
				accelerationY: accY,
				size: size,
				mass: mass,
				restitution: restitution,
				colour: colour,
				isColliding: isColliding,
				isStatic: isStatic,
			};
		}
		getRigidBody(index) {
			return this.objects.rigidBodies[index];
		}
		addRigidBody(rigidBody) {
			this.objects.rigidBodies.push(rigidBody);
			return this.objects.rigidBodies.length - 1;
		}
		removeRigidBody(index) {
			/* if no rigidBodies exist prevent deletion */
			if (this.objects.rigidBodies.length === 0) {
				return;
			}
			let toRemove = [];
			/* removes all attached constraints as well and also readjusts indexes */
			for (let i = 0; i < this.objects.constraints.length; i++) {
				/* push any attached constraint to a temporary array */
				if (this.objects.constraints[i].body1 === index || this.objects.constraints[i].body2 === index) {
					toRemove.push(i);
				}
				/* reduce the attached body index by one to ensure constraint remain attached to their proper bodies*/
				if (this.objects.constraints[i].body1 > index) {
					this.objects.constraints[i].body1--;
				}
				if (this.objects.constraints[i].body2 > index) {
					this.objects.constraints[i].body2--;
				}
			}
			for (let i = 0; i < toRemove.length; i++) {
				this.removeConstraint(toRemove[i] - i);
			}
			this.objects.rigidBodies.splice(index, 1);
		}
		cloneRigidBody(index) {
			this.objects.rigidBodies.push(JSON.parse(JSON.stringify(this.objects.rigidBodies[index])));
		}
		createConstraint(body1, body2, targetLength, strength, dampening) {
			return {
				body1: body1,
				body2: body2,
				targetLength: targetLength,
				length: targetLength,
				strength: strength,
				dampening: dampening,
			};
		}
		getConstraint(index) {
			return this.objects.constraints[index];
		}
		addConstraint(constraint) {
			this.objects.constraints.push(constraint);
		}
		removeConstraint(index) {
			/* if no constraint exist, prevent deletion */
			if (this.objects.constraints.length === 0) {
				return;
			}
			this.objects.constraints.splice(index, 1);
		}
		applyConstraint(dt, i) {
			/* get the distance between the two objects, this is constraint length */
			let springX = this.objects.rigidBodies[this.objects.constraints[i].body1].positionX - this.objects.rigidBodies[this.objects.constraints[i].body2].positionX;
			let springY = this.objects.rigidBodies[this.objects.constraints[i].body1].positionY - this.objects.rigidBodies[this.objects.constraints[i].body2].positionY;
			this.objects.constraints[i].length = utils.dist(0, 0, springX, springY);
			/* get the angle between of the spring */
			const angle = Math.atan2(springX, springY);
			/* nornalise x and y between -1 and 1 */
			let normalisedX = Math.sin(angle);
			let normalisedY = Math.cos(angle);
			/* figure out the strength of the constraint given by hookes law: F = -kx */
			let n = -this.objects.constraints[i].strength * (this.objects.constraints[i].length - this.objects.constraints[i].targetLength) * dt;
			/* multiply normalised values by force */
			normalisedX *= n;
			normalisedY *= n;
			/* calculate dampening for constraint */
			let springRelativeVelocityX = this.objects.rigidBodies[this.objects.constraints[i].body1].velocityX - this.objects.rigidBodies[this.objects.constraints[i].body2].velocityX;
			let springRelativeVelocityY = this.objects.rigidBodies[this.objects.constraints[i].body1].velocityY - this.objects.rigidBodies[this.objects.constraints[i].body2].velocityY;
			/* calculate force based on velocity of objects */
			let dampingForce = this.objects.constraints[i].dampening * utils.dist(0, 0, springRelativeVelocityX, springRelativeVelocityY);
			/* calulate the direction of the impulse */
			let dampeningDirection = Math.atan2(springRelativeVelocityX, springRelativeVelocityY);
			/* convert a direction and magnitude into x and y components */
			let dampingForceX = dampingForce * Math.sin(dampeningDirection);
			let dampingForceY = dampingForce * Math.cos(dampeningDirection);
			/* add the acceleration to the attached rigidBodies */
			this.objects.rigidBodies[this.objects.constraints[i].body1].accelerationX += (normalisedX - dampingForceX) / this.objects.rigidBodies[this.objects.constraints[i].body1].mass;
			this.objects.rigidBodies[this.objects.constraints[i].body1].accelerationY += (normalisedY - dampingForceY) / this.objects.rigidBodies[this.objects.constraints[i].body1].mass;
			this.objects.rigidBodies[this.objects.constraints[i].body2].accelerationX -= (normalisedX - dampingForceX) / this.objects.rigidBodies[this.objects.constraints[i].body2].mass;
			this.objects.rigidBodies[this.objects.constraints[i].body2].accelerationY -= (normalisedY - dampingForceY) / this.objects.rigidBodies[this.objects.constraints[i].body2].mass;
		}
		integrate(dt, i) {
			/* prevent integration for static objects */
			if (this.objects.rigidBodies[i].isStatic) {
				this.objects.rigidBodies[i].velocityX = 0;
				this.objects.rigidBodies[i].velocityY = 0;
				this.objects.rigidBodies[i].accelerationX = 0;
				this.objects.rigidBodies[i].accelerationY = 0;
				return;
			}
			/* bounds checking for objects */
			let size = this.objects.rigidBodies[i].size;
			let restitution = this.objects.rigidBodies[i].restitution;
			/* bounds check for left side of screen */
			if (this.objects.rigidBodies[i].positionX + this.objects.rigidBodies[i].velocityX * dt < size) {
				this.objects.rigidBodies[i].velocityX *= -restitution;
				/* apply object friction */
				this.objects.rigidBodies[i].velocityY *= 1 - (1 - restitution) ** this.iterations;
				this.objects.rigidBodies[i].positionX = size;
			}
			/* bounds check for right side of screen */
			if (this.objects.rigidBodies[i].positionX + this.objects.rigidBodies[i].velocityX * dt > this.width - size) {
				this.objects.rigidBodies[i].velocityX *= -restitution;
				/* apply object friction */
				this.objects.rigidBodies[i].velocityY *= 1 - (1 - restitution) ** this.iterations;
				this.objects.rigidBodies[i].positionX = this.width - size;
			}
			/* bounds check for top side of screen */
			if (this.objects.rigidBodies[i].positionY + this.objects.rigidBodies[i].velocityY * dt < size) {
				this.objects.rigidBodies[i].velocityY *= -restitution;
				/* apply object friction */
				this.objects.rigidBodies[i].velocityX *= 1 - (1 - restitution) ** this.iterations;
				this.objects.rigidBodies[i].positionY = size;
			}
			/* bounds check for bottom of screen */
			if (this.objects.rigidBodies[i].positionY + this.objects.rigidBodies[i].velocityY * dt > this.height - size) {
				this.objects.rigidBodies[i].velocityY *= -restitution;
				/* apply object friction */
				this.objects.rigidBodies[i].velocityX *= 1 - (1 - restitution) ** this.iterations;
				this.objects.rigidBodies[i].positionY = this.height - size;
			}
			/* verlet integration */
			let newPosX = this.objects.rigidBodies[i].positionX + this.objects.rigidBodies[i].velocityX * dt + this.objects.rigidBodies[i].accelerationX * (dt * dt * 0.5);
			let newPosY = this.objects.rigidBodies[i].positionY + this.objects.rigidBodies[i].velocityY * dt + this.objects.rigidBodies[i].accelerationY * (dt * dt * 0.5);
			let newAccX = this.gravityX;
			let newAccY = this.gravityY;
			let newVelX = this.objects.rigidBodies[i].velocityX + (this.objects.rigidBodies[i].accelerationX + newAccX) * (dt * 0.5);
			let newVelY = this.objects.rigidBodies[i].velocityY + (this.objects.rigidBodies[i].accelerationY + newAccY) * (dt * 0.5);
			/* update new values */
			this.objects.rigidBodies[i].positionX = newPosX;
			this.objects.rigidBodies[i].positionY = newPosY;
			this.objects.rigidBodies[i].accelerationX = newAccX;
			this.objects.rigidBodies[i].accelerationY = newAccY;
			this.objects.rigidBodies[i].velocityX = newVelX;
			this.objects.rigidBodies[i].velocityY = newVelY;
		}
		/* allocated rigid bodies into grid sections to reduce collision detection time */
		/* objects can be in more than 1 grid cell at a time */
		allocateRigidBodies() {
			/* empty collision grid array*/
			for (let i = 0, len = this.collisionGridCellsX * this.collisionGridCellsY; i < len; i++) {
				this.collisionGrid[i] = [];
			}
			/* loop across every object*/
			for (let i = 0; i < this.objects.rigidBodies.length; i++) {
				if (this.objects.rigidBodies[i].isColliding === false) continue;
				let indexes = [];
				for (let j = 0, len = this.xs.length; j < len; j++) {
					/* map the x and y values of an object to between a grid */
					let x = Math.floor(utils.map(this.objects.rigidBodies[i].positionX + this.objects.rigidBodies[i].size * this.xs[j], 0, this.width, 0, this.collisionGridCellsX));
					let y = Math.floor(utils.map(this.objects.rigidBodies[i].positionY + this.objects.rigidBodies[i].size * this.ys[j], 0, this.height, 0, this.collisionGridCellsY));
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
							this.collisionGrid[y * this.collisionGridCellsX + x].push(i);
							indexes.push(x, y);
						} catch (e) {
							/* NaN Error catching */
						}
					}
				}
			}
		}
		detectCollisions(dt) {
			/* if only 1 object exists in the collision grid, then ignore */
			for (let i = 0, len = this.collisionGrid.length; i < len; i++) {
				if (this.collisionGrid[i].length <= 1) {
					continue;
				}
				/* cache length as length is accessed alot */
				const len2 = this.collisionGrid[i].length;
				for (let j = 0; j < len2; j++) {
					for (let k = j + 1; k < len2; k++) {
						/* ignore collision detection between static objects if they are both static */
						if (this.objects.rigidBodies[this.collisionGrid[i][j]].isStatic && this.objects.rigidBodies[this.collisionGrid[i][k]].isStatic) continue;
						/* approximate the distance using a fast distance estimation (without square root) to save performance */
						if (utils.fastDist(this.objects.rigidBodies[this.collisionGrid[i][j]].positionX, this.objects.rigidBodies[this.collisionGrid[i][j]].positionY, this.objects.rigidBodies[this.collisionGrid[i][k]].positionX, this.objects.rigidBodies[this.collisionGrid[i][k]].positionY) < (this.objects.rigidBodies[this.collisionGrid[i][j]].size + this.objects.rigidBodies[this.collisionGrid[i][k]].size) * (this.objects.rigidBodies[this.collisionGrid[i][j]].size + this.objects.rigidBodies[this.collisionGrid[i][k]].size)) {
							/* store object index temporarily */
							let o1 = this.collisionGrid[i][j];
							let o2 = this.collisionGrid[i][k];
							/* impulse resolution */
							/* get angle between objects */
							let angle = utils.direction(this.objects.rigidBodies[o1].positionX, this.objects.rigidBodies[o1].positionY, this.objects.rigidBodies[o2].positionX, this.objects.rigidBodies[o2].positionY);
							/* get true distance between objects */
							let dist = (utils.dist(this.objects.rigidBodies[o1].positionX, this.objects.rigidBodies[o1].positionY, this.objects.rigidBodies[o2].positionX, this.objects.rigidBodies[o2].positionY) - this.objects.rigidBodies[o1].size - this.objects.rigidBodies[o2].size) * 1;
							/* generate x and y from magnitude and direction */
							let impulseX = Math.sin(angle) * dist;
							let impulseY = Math.cos(angle) * dist;
							/* if object is static, multiply force on non static object */
							if (this.objects.rigidBodies[o1].isStatic || this.objects.rigidBodies[o2].isStatic) {
								impulseX *= 2;
								impulseY *= 2;
							}
							/* apply impulses based on iteration count */
							if (this.objects.rigidBodies[o1].isStatic === false) {
								/* subtract impulse to velocity */
								this.objects.rigidBodies[o1].velocityX -= impulseX / this.iterations;
								this.objects.rigidBodies[o1].velocityY -= impulseY / this.iterations;
								/* subtract impulse to position */
								this.objects.rigidBodies[o1].positionX -= impulseX / this.iterations;
								this.objects.rigidBodies[o1].positionY -= impulseY / this.iterations;
							}
							if (this.objects.rigidBodies[o2].isStatic === false) {
								/* add impulse to velocity */
								this.objects.rigidBodies[o2].velocityX += impulseX / this.iterations;
								this.objects.rigidBodies[o2].velocityY += impulseY / this.iterations;
								/* add impulse to position */
								this.objects.rigidBodies[o2].positionX += impulseX / this.iterations;
								this.objects.rigidBodies[o2].positionY += impulseY / this.iterations;
							}
						}
					}
				}
			}
		}
		/* to be called every frame by other functions */
		step() {
			/* calcualte delta time to be used by the iteration engine*/
			const dt = this.timestep * (1 / this.iterations);
			for (let i = 0; i < this.iterations; i++) {
				/* integrate all objects */
				for (let j = 0; j < this.objects.rigidBodies.length; j++) {
					this.integrate(dt, j);
				}
				/* apply constraint to all objects */
				for (let j = 0; j < this.objects.constraints.length; j++) {
					this.applyConstraint(dt, j);
				}
				/* allocate rigid bodies into the grid */
				this.allocateRigidBodies();
				/* detect collision between objects */
				this.detectCollisions(dt);
			}
		}
		/* initialise the physics engine, to be called once */
		/* must be called before calling step */
		init() {
			for (let i = this.collisionGridCellsY * this.collisionGridCellsX; i > 0; i--) {
				this.collisionGrid.push([]);
			}
		}
		/* fun functions */
		explode(index, amount) {
			/* get the body at the index */
			let initalBody = this.getRigidBody(index);
			/* generate new objects in a circle with velocities in a circle */
			for (let i = 0; i < amount; i++) {
				/* maps the amount of balls to between a circle */
				let angle = utils.map(i, 0, amount, 0, 2 * Math.PI);
				let rb = this.createRigidBody(initalBody.positionX + Math.cos(angle) * 10, initalBody.positionY + Math.sin(angle) * 10, initalBody.velocityX + Math.cos(angle) * 10, initalBody.velocityY + Math.sin(angle) * 10, 0, 0, initalBody.size / Math.sqrt(amount), initalBody.mass / amount, initalBody.restitution, initalBody.colour, initalBody.isColliding, initalBody.isStatic);
				/* add the exploded bodies to the simulation */
				this.addRigidBody(rb);
			}
			/* remove the exploded object */
			this.removeRigidBody(index);
		}
	}
	return {
		instance: PhysicsInstance,
	};
})();