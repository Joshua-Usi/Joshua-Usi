

export class EnemyDetails {
	constructor(position, angle, scale) {
		this.position = position;
		this.velocity = [0, 0, 0];
		this.angle = angle;
		this.angleX = 0;
		this.angleXOffset = (Math.random() - 0.5);
		this.baseScale = scale;
		this.scale = scale;
		this.health = 100 * this.scale;
		this.maxHealth = 100 * this.scale;
		this.timeSinceBulletHit = 0;
	}
	update(array) {
		this.timeSinceBulletHit++;
		this.scale = this.baseScale * (-(Math.E ** (-0.5 * (this.timeSinceBulletHit + 5))) + 1);

		this.angleX = Math.sin((Date.now()) / (this.baseScale * 10) + this.baseScale / 10) * 0.25;
		this.position[0] += this.velocity[0];
		this.position[1] += this.velocity[1];
		this.position[2] += this.velocity[2];

		this.position[2] += Math.sin(this.angle) * 10 / this.scale;
		this.position[0] += Math.cos(this.angle) * 10 / this.scale;

		if (Math.random() < 0.001) {
			this.angle = Math.random() * 2 * Math.PI;
		}

		if (Math.random() < 0.001) {
			this.velocity[1] += this.scale / 10;
		}

		this.velocity[1] -= 9.8 / 60;

		if (this.position[1] < -500 + this.scale / 2) {
			this.position[1] = -500 + this.scale / 2;
			this.velocity[1] = 0;
		}
	}
}

export class Bullet {
	constructor(position, velocity) {
		this.position = position;
		this.velocity = velocity;
	}
	update() {
		this.position[0] += this.velocity[0];
		this.position[1] += this.velocity[1];
		this.position[2] += this.velocity[2];

		this.velocity[1] -= 9.8 / 60;
	}
}