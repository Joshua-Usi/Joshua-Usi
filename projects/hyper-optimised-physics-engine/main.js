/* shaders */
import {vertex} from "./vertexShader.js";
import {fragment} from "./fragmentShader.js";
/* managers */
import GLManager from "./glManager.js";

import * as Utils from "./utils.js"

import {UnnamedPhysicsEngine, RigidBody} from "./unnamedPhysicsEngine.js"
// import * as Physics from "./physics.js"

import {Vector, VectorFromAngle} from "./vector.js"

import KeyInputs from "./keys.js";
let keys = new KeyInputs("body");
keys.init();

let balls = [];

let cameraPosition = new Vector(0, 0);

let canvas = document.getElementById("text-canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let ctx = canvas.getContext("2d");
console.log(ctx);

let renderer = new GLManager("canvas", vertex, fragment, window.innerWidth, window.innerHeight);
let physics = new UnnamedPhysicsEngine(window.innerWidth * 3, window.innerHeight * 3, 4, 16 * 4, 9 * 4);

renderer.attributeManager.add("vertexPosition", "aVertexPosition");
renderer.attributeManager.add("vertexColour", "aVertexColour");
renderer.attributeManager.add("instancePosition", "aInstancePosition");
renderer.attributeManager.add("instanceScale", "aInstanceScale");
renderer.attributeManager.add("instanceColour", "aInstanceColour");

renderer.uniformManager.add("projectionMatrix", "uProjectionMatrix");
renderer.uniformManager.add("modelViewMatrix", "uModelViewMatrix");

function circleBuffer(sides) {
	let z = -window.innerHeight / 2;
	let scale = 0.99;
	const vertices = [];
	vertices.push(0);
	vertices.push(0);
	vertices.push(z);
	for (let i = 0; i <= 2 * Math.PI; i += 2 * Math.PI / sides) {
		vertices.push(Math.cos(i) * scale);
		vertices.push(Math.sin(i) * scale);
		vertices.push(z);
	}
	vertices.push(1 * scale);
	vertices.push(0);
	vertices.push(z);

	const indices = [];
	for (let i = 0; i < vertices.length / 3; i++) {
		indices.push(i);
	}

	const colours = [];
	for (let i = 0; i < vertices.length / 3; i++) {
		colours.push(1);
		colours.push(1);
		colours.push(1);
		colours.push(0.25);
	}

	return {
		vertices: renderer.generateBuffer(vertices, Float32Array, renderer.gl.STATIC_DRAW),
		indices: renderer.generateBuffer(indices, Float32Array, renderer.gl.STATIC_DRAW),
		colours: renderer.generateBuffer(colours, Float32Array, renderer.gl.STATIC_DRAW),
	}
}

let circle = circleBuffer(32);

let p = 0;
let mod = 1;

function animate() {

	if (keys.getKeyDown("space")) {
		mod = 10;
	} else {
		mod = 1;
	}

	if (true) {
		if (balls.length < 5000 && p % (mod * 5) === 0) {
			for (let i = 0; i < 200; i++) {
				let angle = Math.random() * 2 * Math.PI;
				let mod = 50;
				let dist = 40;
				let pos = new Vector((balls.length) % mod * dist - mod * dist / 2, 300);
				let ball = new RigidBody(pos, new Vector(0, 0), Utils.randomRange(10, 20), 1, 0.25, false, true, [Math.random(), Math.random(), Math.random(), 0.25]);
				balls.push(ball);
			}
		}
		if (p % mod === 0) {
			physics.step(balls);
		}
		p++;
	}

	if (keys.getKeyDown("w")) {
		cameraPosition.y += 20;
	}
	if (keys.getKeyDown("s")) {
		cameraPosition.y -= 20;
	}
	if (keys.getKeyDown("d")) {
		cameraPosition.x += 20;
	}
	if (keys.getKeyDown("a")) {
		cameraPosition.x -= 20;
	}

	let now = window.performance.now();
	renderer.clear(10 / 255, 10 / 255, 10 / 255, 1);
	renderer.renderSetup(cameraPosition);
	let instancePositions = [];
	let instanceScales = [];
	let instanceColours = [];
	for (let i = 0; i < balls.length; i++) {
		if (balls[i].position.x + balls[i].radius > cameraPosition.x * 2 - renderer.canvas.width &&
			balls[i].position.x - balls[i].radius < cameraPosition.x * 2 + renderer.canvas.width &&
			balls[i].position.y + balls[i].radius > cameraPosition.y * 2 - renderer.canvas.height &&
			balls[i].position.y - balls[i].radius < cameraPosition.y * 2 + renderer.canvas.height) {
			instancePositions.push(balls[i].position.x);
			instancePositions.push(balls[i].position.y);
			instanceScales.push(balls[i].radius);
			instanceScales.push(balls[i].radius);
			instanceColours.push(balls[i].colour[0]);
			instanceColours.push(balls[i].colour[1]);
			instanceColours.push(balls[i].colour[2]);
			instanceColours.push(balls[i].colour[3]);
		}
	}
	let instanceBuffs = {
		position: renderer.generateBuffer(instancePositions, Float32Array, renderer.gl.DYNAMIC_DRAW),
		scale: renderer.generateBuffer(instanceScales, Float32Array, renderer.gl.DYNAMIC_DRAW),
		colour: renderer.generateBuffer(instanceColours, Float32Array, renderer.gl.DYNAMIC_DRAW)
	};

	renderer.renderInstanced(circle, instanceBuffs, instancePositions.length / 2);

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.font = "16px Arial";
	ctx.fillStyle = "#fff";
	let bruteForce = balls.length * (balls.length + 1) / 2 * physics.iterations
	let texts = [
		`FPS: ${Utils.getFramerate()}`,
		`Objects: ${balls.length}`,
		`Integration Time: ${physics.statistics.integrationTime.toFixed(1)}ms`,
		`Allocation Time: ${physics.statistics.allocationTime.toFixed(1)}ms`,
		`Collision Detection Time: ${physics.statistics.collisionDetectionTime.toFixed(1)}ms`,
		`Collision Resolution Time: ${physics.statistics.collisionResolutionTime.toFixed(1)}ms`,
		`Render Time: ${(window.performance.now() - now).toFixed(1)}ms`,
		`Frustum Culling: ${instancePositions.length / 2} / ${balls.length}`,
		`Checked Collision Arrays: ${physics.statistics.checkedCollisionArrays} / ${physics.collisionGridCellsX * physics.collisionGridCellsY * physics.iterations}`,
		`Collision Checks: ${physics.statistics.collisionChecks} (brute force: ${bruteForce} (${(physics.statistics.collisionChecks / bruteForce * 100).toFixed(1)}%)`,
		`Collisions Resolved: ${physics.statistics.collisionsResolved} (${(physics.statistics.collisionsResolved / physics.statistics.collisionChecks * 100).toFixed(1)}%)`,
	];
	for (var i = 0; i < texts.length; i++) {
		ctx.fillText(texts[i], 10, 26 + i * 20);
	}

	requestAnimationFrame(animate);
}
animate();