import * as utils from "../util/utils.js";
import {perlin} from "../util/perlin.js"

export class ParticleSystem {
	constructor(position) {
		this.position = position;
		this.particles = new ParticleManager();
		// this.particles = [];
	}
	addParticle(position, amount) {
		for (let i = 0; i < amount; i++) {
			this.particles.spawn(position, utils.randomFromRange(2, 5));
		}
	}
	update(dt) {
		this.particles.update(dt)
	}
}

class ParticleManager {
	constructor() {
		this.count = 0;
		this.times = [];
		this.lifetimes = [];
		this.positions = [];
		this.velocities = [];
	}
	updateSingular(index, dt) {
		this.times[index] += dt;

		// let scale = 10;
		// let perl = perlin(this.positions[index * 3 + 0] / scale, this.positions[index * 3 + 1] / scale, this.positions[index * 3 + 2] / scale);
		// let theta = utils.map(perl, 0, 1, -2 * Math.PI, 2 * Math.PI);
		// let phi = Math.acos(2 * perl - 1);

		// this.velocities[index * 3 + 0] += Math.sin(theta) * Math.cos(phi) / 50;
		// this.velocities[index * 3 + 1] += Math.sin(theta) * Math.sin(phi) / 50;
		// this.velocities[index * 3 + 2] += Math.cos(theta) / 50;

		// this.velocities[index * 3 + 1] -= 0.98 / 60;

		// this.velocities[index * 3 + 0] *= 0.95;
		// this.velocities[index * 3 + 1] *= 0.95;
		// this.velocities[index * 3 + 2] *= 0.95;

		this.positions[index * 3 + 0] += this.velocities[index * 3 + 0];
		this.positions[index * 3 + 1] += this.velocities[index * 3 + 1];
		this.positions[index * 3 + 2] += this.velocities[index * 3 + 2];
	}
	update(dt) {
		/* indexes of particles to delete once loop is done */
		let particlesToDelete = [];
		for (let i = 0; i < this.count; i++) {
			if (this.times[i] > this.lifetimes[i]) {
				particlesToDelete.push(i);
			} else {
				this.updateSingular(i, dt);
			}
		}
		let particlesToDeleteLength = particlesToDelete.length;
		for (let i = particlesToDeleteLength - 1; i >= 0; i--) {
			// this.respawn(particlesToDelete[i], [0, 0, 0], utils.randomFromRange(2, 5));
			this.times.splice(particlesToDelete[i], 1);
			this.lifetimes.splice(particlesToDelete[i], 1);
			this.positions.splice(particlesToDelete[i] * 3, 3);
			this.velocities.splice(particlesToDelete[i] * 3, 3);
		}
		this.count -= particlesToDeleteLength;
	}
	respawn(index, position, lifetime) {
		this.times[index] = 0;
		this.lifetimes[index] = lifetime;

		this.positions[index * 3 + 0] = position[0];
		this.positions[index * 3 + 1] = position[1];
		this.positions[index * 3 + 2] = position[2];

		let angle = utils.randomFromRange(0, 2 * Math.PI);
		let angle2 = Math.acos(1 - 2 * utils.randomFromRange(0, 1));
		let magnitude = utils.randomFromRange(0.2, 0.3);

		this.velocities[index * 3 + 0] = Math.sin(angle2) * Math.cos(angle) * magnitude;
		this.velocities[index * 3 + 1] = Math.sin(angle2) * Math.sin(angle) * magnitude;
		this.velocities[index * 3 + 2] = Math.cos(angle2) * magnitude;
	}
	spawn(position, lifetime) {
		this.count++;
		this.times.push(0);
		this.lifetimes.push(lifetime);

		this.positions.push(position[0]);
		this.positions.push(position[1]);
		this.positions.push(position[2]);

		let angle = utils.randomFromRange(0, 2 * Math.PI);
		let angle2 = Math.acos(1 - 2 * utils.randomFromRange(0, 1));
		let magnitude = utils.randomFromRange(1, 2);

		this.velocities.push(Math.sin(angle2) * Math.cos(angle) * magnitude);
		this.velocities.push(Math.sin(angle2) * Math.sin(angle) * magnitude + 3);
		this.velocities.push(Math.cos(angle2) * magnitude);
	}
}

class Particle {
	constructor(position, velocity, scale, lifetime) {
		this.time = 0;
		this.lifetime = lifetime;
		this.position = position;
		this.velocity = velocity;
		this.scale = scale;
	}
	update(dt) {
		this.time += dt;

		let scale = 10;	
		let perl = perlin(this.position[0] / scale, this.position[1] / scale, this.position[2] / scale);
		let theta = utils.map(perl, 0, 1, -2 * Math.PI, 2 * Math.PI);
		let phi = Math.acos(2 * perl - 1);

		this.velocity[0] += Math.sin(theta) * Math.cos(phi) / 50;
		this.velocity[1] += Math.sin(theta) * Math.sin(phi) / 50;
		this.velocity[2] += Math.cos(theta) / 50;

		this.velocity[1] -= 0.98 / 60;

		this.velocity[0] *= 0.95;
		this.velocity[1] *= 0.95;
		this.velocity[2] *= 0.95;

		this.position[0] += this.velocity[0];
		this.position[1] += this.velocity[1];
		this.position[2] += this.velocity[2];
	}
	spawn(position) {
		this.time = 0;
		let angle = utils.randomFromRange(0, 2 * Math.PI);
		let angle2 = Math.acos(1 - 2 * utils.randomFromRange(0, 1));
		let magnitude = utils.randomFromRange(1, 2);
		this.position = position;
		this.velocity[0] = Math.sin(angle2) * Math.cos(angle) * magnitude;
		this.velocity[1] = Math.sin(angle2) * Math.sin(angle) * magnitude;
		this.velocity[2] = Math.cos(angle2) * magnitude;
	}
}