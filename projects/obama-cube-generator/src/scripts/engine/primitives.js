import "../util/prototypes.js";
import * as primitivesUtil from "./primitivesUtil.js";

export class Quad {
	constructor() {
		this.vertices = [
			0.0,  0.5,  0.5, // 0
			0.0,  0.5, -0.5, // 1
			0.0, -0.5, -0.5, // 2
			0.0, -0.5, -0.5, // 2
			0.0, -0.5,  0.5, // 3
			0.0,  0.5,  0.5, // 0
		];
		this.normals = [
			-1.0,  0.0,  0.0,
			-1.0,  0.0,  0.0,
			-1.0,  0.0,  0.0,
			-1.0,  0.0,  0.0,
			-1.0,  0.0,  0.0,
			-1.0,  0.0,  0.0,
		];
		this.indices = [
			0, 1, 2, 3, 4, 5, 
		];
		this.textureCoord = [
			1.0, 1.0,
			0.0, 1.0,
			0.0, 0.0,
			0.0, 0.0,
			1.0, 0.0,
			1.0, 1.0,
		];
		this.colours = [];
		for (let i = 0; i < this.vertices.length / 3; i++) {
			this.colours.push(1.0);
			this.colours.push(1.0);
			this.colours.push(1.0);
		}
	}
}
export class Skybox {
	constructor() {
		/* facing towards positive x, sides are inverted compared to a cube */
		this.vertices = [
			/* left */
			 0.5,  0.5,  0.5,
			 0.5, -0.5,  0.5,
			-0.5, -0.5,  0.5,
			-0.5, -0.5,  0.5,
			-0.5,  0.5,  0.5,
			 0.5,  0.5,  0.5,
			/* right */
			-0.5, -0.5, -0.5,
			 0.5, -0.5, -0.5,
			 0.5,  0.5, -0.5,
			 0.5,  0.5, -0.5,
			-0.5,  0.5, -0.5,
			-0.5, -0.5, -0.5,
			/* front */
			-0.5, -0.5, -0.5,
			-0.5,  0.5, -0.5,
			-0.5,  0.5,  0.5,
			-0.5,  0.5,  0.5,
			-0.5, -0.5,  0.5,
			-0.5, -0.5, -0.5,
			/* back */
			 0.5,  0.5,  0.5,
			 0.5,  0.5, -0.5,
			 0.5, -0.5, -0.5,
			 0.5, -0.5, -0.5,
			 0.5, -0.5,  0.5,
			 0.5,  0.5,  0.5,
			
			/* bottom */
			 0.5, -0.5,  0.5,
			 0.5, -0.5, -0.5,
			-0.5, -0.5, -0.5,
			-0.5, -0.5, -0.5,
			-0.5, -0.5,  0.5,
			 0.5, -0.5,  0.5,
			/* top */
			-0.5,  0.5, -0.5,
			 0.5,  0.5, -0.5,
			 0.5,  0.5,  0.5,
			 0.5,  0.5,  0.5,
			-0.5,  0.5,  0.5,
			-0.5,  0.5, -0.5,
		]
		this.normals = [
			 0.0,  0.0,  1.0,
			 0.0,  0.0,  1.0,
			 0.0,  0.0,  1.0,
			 0.0,  0.0,  1.0,
			 0.0,  0.0,  1.0,
			 0.0,  0.0,  1.0,

			 0.0,  0.0, -1.0,
			 0.0,  0.0, -1.0,
			 0.0,  0.0, -1.0,
			 0.0,  0.0, -1.0,
			 0.0,  0.0, -1.0,
			 0.0,  0.0, -1.0,

			 1.0,  0.0,  0.0,
			 1.0,  0.0,  0.0,
			 1.0,  0.0,  0.0,
			 1.0,  0.0,  0.0,
			 1.0,  0.0,  0.0,
			 1.0,  0.0,  0.0,

			-1.0,  0.0,  0.0,
			-1.0,  0.0,  0.0,
			-1.0,  0.0,  0.0,
			-1.0,  0.0,  0.0,
			-1.0,  0.0,  0.0,
			-1.0,  0.0,  0.0,

			 0.0,  1.0,  0.0,
			 0.0,  1.0,  0.0,
			 0.0,  1.0,  0.0,
			 0.0,  1.0,  0.0,
			 0.0,  1.0,  0.0,
			 0.0,  1.0,  0.0,

			 0.0, -1.0,  0.0,
			 0.0, -1.0,  0.0,
			 0.0, -1.0,  0.0,
			 0.0, -1.0,  0.0,
			 0.0, -1.0,  0.0,
			 0.0, -1.0,  0.0,
		];
		this.indices = [
			0,  1,  2,  3,  4,  5, 
			6,  7,  8,  9,  10, 11,
			12, 13, 14, 15, 16, 17,
			18, 19, 20, 21, 22, 23,
			24, 25, 26, 27, 28, 29,
			30, 31, 32, 33, 34, 35,
		];
		this.textureCoord = [
			0.0, 1.0,
			0.0, 0.0,
			1.0, 0.0,
			1.0, 0.0,
			1.0, 1.0,
			0.0, 1.0,

			0.0, 0.0,
			1.0, 0.0,
			1.0, 1.0,
			1.0, 1.0,
			0.0, 1.0,
			0.0, 0.0,

			1.0, 0.0,
			1.0, 1.0,
			0.0, 1.0,
			0.0, 1.0,
			0.0, 0.0,
			1.0, 0.0,

			1.0, 1.0,
			0.0, 1.0,
			0.0, 0.0,
			0.0, 0.0,
			1.0, 0.0,
			1.0, 1.0,

			0.0, 0.0,
			1.0, 0.0,
			1.0, 1.0,
			1.0, 1.0,
			0.0, 1.0,
			0.0, 0.0,

			1.0, 0.0,
			1.0, 1.0,
			0.0, 1.0,
			0.0, 1.0,
			0.0, 0.0,
			1.0, 0.0,
		];
		this.colours = [];
		for (let i = 0; i < this.vertices.length / 3; i++) {
			this.colours.push(1.0);
			this.colours.push(1.0);
			this.colours.push(1.0);
		}
	}
}

export class Cube {
	constructor() {
		/* facing towards positive x */
		this.vertices = [
			/* left */
			 0.5,  0.5, -0.5,
			 0.5, -0.5, -0.5,
			-0.5, -0.5, -0.5,
			-0.5, -0.5, -0.5,
			-0.5,  0.5, -0.5,
			 0.5,  0.5, -0.5,
			/* right */
			-0.5, -0.5,  0.5,
			 0.5, -0.5,  0.5,
			 0.5,  0.5,  0.5,
			 0.5,  0.5,  0.5,
			-0.5,  0.5,  0.5,
			-0.5, -0.5,  0.5,
			/* front */
			-0.5,  0.5,  0.5,
			-0.5,  0.5, -0.5,
			-0.5, -0.5, -0.5,
			-0.5, -0.5, -0.5,
			-0.5, -0.5,  0.5,
			-0.5,  0.5,  0.5,
			/* back */
			 0.5, -0.5, -0.5,
			 0.5,  0.5, -0.5,
			 0.5,  0.5,  0.5,
			 0.5,  0.5,  0.5,
			 0.5, -0.5,  0.5,
			 0.5, -0.5, -0.5,
			
			/* bottom */
			-0.5, -0.5, -0.5,
			 0.5, -0.5, -0.5,
			 0.5, -0.5,  0.5,
			 0.5, -0.5,  0.5,
			-0.5, -0.5,  0.5,
			-0.5, -0.5, -0.5,
			/* top */
			 0.5,  0.5,  0.5,
			 0.5,  0.5, -0.5,
			-0.5,  0.5, -0.5,
			-0.5,  0.5, -0.5,
			-0.5,  0.5,  0.5,
			 0.5,  0.5,  0.5,
		]
		this.normals = [
			 0.0,  0.0, -1.0,
			 0.0,  0.0, -1.0,
			 0.0,  0.0, -1.0,
			 0.0,  0.0, -1.0,
			 0.0,  0.0, -1.0,
			 0.0,  0.0, -1.0,

			 0.0,  0.0,  1.0,
			 0.0,  0.0,  1.0,
			 0.0,  0.0,  1.0,
			 0.0,  0.0,  1.0,
			 0.0,  0.0,  1.0,
			 0.0,  0.0,  1.0,

			-1.0,  0.0,  0.0,
			-1.0,  0.0,  0.0,
			-1.0,  0.0,  0.0,
			-1.0,  0.0,  0.0,
			-1.0,  0.0,  0.0,
			-1.0,  0.0,  0.0,

			 1.0,  0.0,  0.0,
			 1.0,  0.0,  0.0,
			 1.0,  0.0,  0.0,
			 1.0,  0.0,  0.0,
			 1.0,  0.0,  0.0,
			 1.0,  0.0,  0.0,

			 0.0, -1.0,  0.0,
			 0.0, -1.0,  0.0,
			 0.0, -1.0,  0.0,
			 0.0, -1.0,  0.0,
			 0.0, -1.0,  0.0,
			 0.0, -1.0,  0.0,

			 0.0,  1.0,  0.0,
			 0.0,  1.0,  0.0,
			 0.0,  1.0,  0.0,
			 0.0,  1.0,  0.0,
			 0.0,  1.0,  0.0,
			 0.0,  1.0,  0.0,
		];
		this.indices = [
			0,  1,  2,  3,  4,  5, 
			6,  7,  8,  9,  10, 11,
			12, 13, 14, 15, 16, 17,
			18, 19, 20, 21, 22, 23,
			24, 25, 26, 27, 28, 29,
			30, 31, 32, 33, 34, 35,
		];
		this.textureCoord = [
			1.0, 0.0,
			0.0, 0.0,
			0.0, 1.0,
			0.0, 1.0,
			1.0, 1.0,
			1.0, 0.0,

			1.0, 1.0,
			1.0, 0.0,
			0.0, 0.0,
			0.0, 0.0,
			0.0, 1.0,
			1.0, 1.0,

			0.0, 1.0,
			1.0, 1.0,
			1.0, 0.0,
			1.0, 0.0,
			0.0, 0.0,
			0.0, 1.0,

			0.0, 0.0,
			0.0, 1.0,
			1.0, 1.0,
			1.0, 1.0,
			1.0, 0.0,
			0.0, 0.0,

			1.0, 1.0,
			1.0, 0.0,
			0.0, 0.0,
			0.0, 0.0,
			0.0, 1.0,
			1.0, 1.0,

			0.0, 1.0,
			1.0, 1.0,
			1.0, 0.0,
			1.0, 0.0,
			0.0, 0.0,
			0.0, 1.0,
		];
		this.colours = [];
		for (let i = 0; i < this.vertices.length / 3; i++) {
			this.colours.push(1.0);
			this.colours.push(1.0);
			this.colours.push(1.0);
		}
	}
}

export class Icosphere {
	constructor(subdivisions) {
		// compute 12 vertices of icosahedron
		let tempVertices = primitivesUtil.icosphere(1);
		let vertices = [];
		let normals = [];
		let indices = [];

		let v0, v1, v2, v3, v4, v5;
		let index = 0;

		// compute and add 20 tiangles
		v0 = [tempVertices[0], tempVertices[1], tempVertices[2]];	   // 1st vertex
		v5 = [tempVertices[11 * 3], tempVertices[11 * 3 + 1], tempVertices[11 * 3 + 2]]; // 12th vertex
		for (let i = 1; i <= 5; i++) {
			// 4 vertices in the 2nd row
			v1 = [tempVertices[i * 3], tempVertices[i * 3 + 1], tempVertices[i * 3 + 2]];
			if (i < 5) {
				v2 = [tempVertices[(i + 1) * 3], tempVertices[(i + 1) * 3 + 1], tempVertices[(i + 1) * 3 + 2]];
			} else {
				v2 = [tempVertices[3], tempVertices[4], tempVertices[5]];
			}

			v3 = [tempVertices[(i + 5) * 3], tempVertices[(i + 5) * 3 + 1], tempVertices[(i + 5) * 3 + 2]];
			if ((i + 5) < 10){
				v4 = [tempVertices[(i + 6) * 3], tempVertices[(i + 6) * 3 + 1], tempVertices[(i + 6) * 3 + 2]];
			} else {
				v4 = [tempVertices[6 * 3], tempVertices[6 * 3 + 1], tempVertices[6 * 3 + 2]];
			}

			let normal = primitivesUtil.computeFaceNormal(v0, v1, v2);
			vertices.pushTriangle(v0, v1, v2);
			normals.pushTriangle(normal, normal, normal);

			normal = primitivesUtil.computeFaceNormal(v1, v3, v2);
			vertices.pushTriangle(v1, v3, v2);
			normals.pushTriangle(normal, normal, normal);

			normal = primitivesUtil.computeFaceNormal(v2, v3, v4);
			vertices.pushTriangle(v2, v3, v4);
			normals.pushTriangle(normal, normal, normal);

			normal = primitivesUtil.computeFaceNormal(v3, v5, v4);
			vertices.pushTriangle(v3, v5, v4);
			normals.pushTriangle(normal, normal, normal);

			for (let k = 0; k < 12; k++) {
				indices.push(index + k);
			}

			index += 12;
		}

		let subdivided = primitivesUtil.subdivide(vertices, indices, normals, 1, subdivisions);

		this.vertices = subdivided.vertices;
		this.normals = subdivided.normals;
		this.indices = subdivided.indices;
		this.textureCoord = [];
		for (var i = 0; i < this.indices.length; i++) {
			this.textureCoord.push(0);
			this.textureCoord.push(0);
		}
		this.colours = [];
		for (let i = 0; i < this.vertices.length / 3; i++) {
			this.colours.push(1.0);
			this.colours.push(1.0);
			this.colours.push(1.0);
		}
	}
}