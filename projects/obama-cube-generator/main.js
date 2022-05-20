import * as glMatrix from "./src/gl-lib/index.js";

import {initialiseShaders} from "./src/scripts/render/initShaders.js";
import {GLProgramInfo, ShaderProgram} from "./src/scripts/render/GLProgramInfo.js";
import {BufferInfo} from "./src/scripts/render/BufferInfo.js";
import * as utils from "./src/scripts/util/utils.js";
import KeyInputs from "./src/scripts/inputs/keys.js";
import Mouse from "./src/scripts/inputs/mouse.js";
import * as Primitives from "./src/scripts/engine/primitives.js";
import {generateFragmentShader, generateVertexShader, createBufferDetails} from "./src/scripts/render/generateShader.js";
import {renderObjectInstanced, renderObject} from "./src/scripts/render/render.js";
import {loadTexture, initTexture, updateTexture, setupVideo, loadVideoTexture} from "./src/scripts/render/loadTextures.js";
import {loadShaders} from "./src/scripts/render/loadShaders.js";

import {ParticleSystem} from "./src/scripts/engine/particleSystem.js";

import {Timer} from "./src/scripts/util/timer.js";

import {EnemyDetails, Bullet} from "./src/scripts/play.js";

let instanced = loadShaders("./src/shaders/instancedVertexShader.vert", "./src/shaders/instancedFragmentShader.frag");
let singular = loadShaders("./src/shaders/singularVertexShader.vert", "./src/shaders/singularFragmentShader.frag");
let billboard = loadShaders("./src/shaders/billboardVertexShader.vert", "./src/shaders/billboardFragmentShader.frag");
let billboard_instanced = loadShaders("./src/shaders/billboardInstancedVertexShader.vert", "./src/shaders/billboardInstancedFragmentShader.frag");

const canvas = document.getElementById("canvas");
canvas.width = 512;
canvas.height = 512;
const recorder = new CanvasRecorder(canvas);

const gl = canvas.getContext("webgl2", {
	alpha: true,
});
utils.printWebGLSystemLimits(gl);
if (gl === null) {
	throw new Error("Unable to initialise webGL");
}

function generateBuffers(gl, primitive, args) {
	let temp = new primitive(...args);
	let x =  {
		vertices: new BufferInfo(gl, "vertex", 3, temp.vertices, Float32Array, gl.ARRAY_BUFFER),
		colours: new BufferInfo(gl, "colours", 3, temp.colours, Float32Array, gl.ARRAY_BUFFER),
		indices: new BufferInfo(gl, "indices", 1, temp.indices, Uint16Array, gl.ELEMENT_ARRAY_BUFFER),
		normals: new BufferInfo(gl, "normals", 3, temp.normals, Float32Array, gl.ARRAY_BUFFER),
		textureCoord: new BufferInfo(gl, "textureCoord", 2, temp.textureCoord, Float32Array, gl.ARRAY_BUFFER)
	};
	for (let key in x) {
		if (x.hasOwnProperty(key) && x[key].data === undefined) {
			delete x[key];
		}
	}
	return x;
}

/* initialise some states */
// gl.enable(gl.CULL_FACE);
// gl.cullFace(gl.BACK);
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
gl.enable(gl.DEPTH_TEST);

let shaders = [];

let buffers = [
	generateBuffers(gl, Primitives.Skybox, []),
];

let textures = [
	loadTexture(gl, "./src/imgs/dirt.png"),
];

let keys = new KeyInputs("body");
let mouse = new Mouse("body");
let firstClick = true;
keys.init();
mouse.init();
// document.addEventListener("click", function(event) {
	// mouse.lockPointer();
// });

document.addEventListener("wheel", function(event) {
	position.speed += -Math.sign(event.deltaY) / 10;
	position.speed = Math.max(Math.min(position.speed, 100), 0.1);
});


let p = 0;
let q = 0
let r = 0;
let finishedLoading = false;
let pendingLoads = 0;
let splashScreenOpacity = 1;
let enemies = [];
let bullets = [];
let particles = [];

let position = {
	speed: 1,
	x: -1,
	y: 1,
	z: 0,
	velocity: {
		x: 0,
		y: 0,
	},
	previous: {
		x: 0,
		y: 0,
	},
	pitch: -Math.PI / 4,
	yaw: 0,
	roll: 0,
	fov: 90,
};


function init() {
	/* render Objects */
	skybox = new RenderObject(shaders[1], buffers[0], textures[0]);
}

class RenderObject {
	constructor(program, buffers, texture) {
		this.program = program;
		this.buffers = buffers;
		this.texture = texture;
		this.position = [0, 0, 0];
		this.scale = [1, 1, 1];
		this.rotation = [0, 0, 0];

		this.options = {
			depthTest: false,
			depthMask: true,
		};

		this.cache = {
			modelMatrix: glMatrix.mat4.create(),
		};
	}
	setPosition(position) {
		this.position = position;
	}
	setScale(scale) {
		this.scale = scale;
	}
	setRotation(rotation) {
		this.rotation = rotation;
	}
	setTexture(texture) {
		this.texture = texture;
	}
	generateModelMatrix() {
		this.cache.modelMatrix = utils.generateModelMatrix(this.position, this.scale, this.rotation);
	}
	render(cameraPosition) {
		renderObject(gl, this.program, this.buffers, this.cache.modelMatrix, cameraPosition, this.texture, false);
	}
}

/* render Objects */
let skybox;

let isRecording = false;

function render(dt) {
	p += 1 / 180 * Math.PI * parseFloat(document.getElementById("rotation-speed-x").value);
	q += 1 / 180 * Math.PI * parseFloat(document.getElementById("rotation-speed-y").value);
	r += 1 / 180 * Math.PI * parseFloat(document.getElementById("rotation-speed-z").value);
	gl.clearColor(1, 1, 1, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.clear(gl.DEPTH_BUFFER_BIT);
	/* Skybox */
	skybox.setRotation([q, p, r]);
	skybox.generateModelMatrix();
	skybox.render(position);

	if (p >= Math.PI * 2 && isRecording) {
		recorder.stop();
		// Save with given file name
		recorder.save('cube.mp4');
		isRecording = false;
		document.getElementById("start-recording").innerText = "Record";
	}

}
let vSync = true;

function load() {
	if (finishedLoading === false) {
		pendingLoads = 0;
		for (let i = 0; i < textures.length; i++) {
			if (textures[i].complete) {
				pendingLoads++;
			}
		}
		pendingLoads += instanced.loadedCount;
		pendingLoads += singular.loadedCount;
		pendingLoads += billboard.loadedCount;
		pendingLoads += billboard_instanced.loadedCount;
		if (pendingLoads === textures.length + 8) {
			finishedLoading = true;
			shaders.push(new GLProgramInfo(gl, initialiseShaders(gl, instanced.getVertex(), instanced.getFragment())));
			shaders.push(new GLProgramInfo(gl, initialiseShaders(gl, singular.getVertex(), singular.getFragment())));
			shaders.push(new GLProgramInfo(gl, initialiseShaders(gl, billboard.getVertex(), billboard.getFragment())));
			shaders.push(new GLProgramInfo(gl, initialiseShaders(gl, billboard_instanced.getVertex(), billboard_instanced.getFragment())));
			init();
			console.log("loaded");
		}
	}
}

function animate() {
	let dt = 1 / 60;

	load();

	if (finishedLoading) {

		render(dt);
	}

	if (keys.getKeyPressed("g")) {
		vSync = !vSync;
	}

	if (vSync) {
		requestAnimationFrame(animate);
	} else {
		gl.flush();
		setTimeout(animate, 0);
	}
}
animate();

document.getElementById("upload-image").addEventListener("change", function(event) {
	for (let i = 0; i < this.files.length; i++) {
		let fileReader = new FileReader();
		let fileName = this.files[i].name;
		fileReader.addEventListener("load", function(event) {
			let res = btoa(event.target.result);

			let extension = fileName.split('.').pop();

			let charMap = {
				"jpg": "image/jpg",
				"png": "image/png",
				"gif": "image/gif",
				"webp": "image/webp",
				"mp4": "video/mp4"
			};
			if (charMap[extension] === "mp4") {
				textures[0] = loadVideoTexture(gl, `data:${charMap[extension]};base64,${res}`);
			} else {
				textures[0] = loadTexture(gl, `data:${charMap[extension]};base64,${res}`);
			}
			skybox = new RenderObject(shaders[1], buffers[0], textures[0]);
		});
		fileReader.readAsBinaryString(this.files[i]);
	}
});

document.getElementById("start-recording").addEventListener("click", function(event) {
	p = 0;
	q = 0;
	r = 0;
	isRecording = true;
	recorder.start();
	document.getElementById("start-recording").innerText = "Recording";
});
