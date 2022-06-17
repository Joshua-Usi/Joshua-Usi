import {ComplexNumber} from "./src/complexNumber.js";
import {KeyInputs} from "./src/keyInputs.js";

let keys = new KeyInputs("body");
keys.init();

let canvas = document.getElementById("cpu-canvas");
canvas.style.width = "512px";
canvas.style.height = "512px";
canvas.width = 512;
canvas.height = 512;
let ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

function setScale(scale) {
	REAL_BOUND[0] = CENTER[0] - 0.5 * scale;
	REAL_BOUND[1] = CENTER[0] + 0.5 * scale;

	IMAGINARY_BOUND[0] = CENTER[1] - 0.5 * scale;
	IMAGINARY_BOUND[1] = CENTER[1] + 0.5 * scale;
}

let MAX_ITERATIONS = 1;
let CENTER = [0.36024044343761435, -0.6413130610648031]
let REAL_BOUND = [0, 0];
let IMAGINARY_BOUND = [0, 0];
let MIN_SCALE = 1 / 4;
let DOUBLE_SCALE_THRESHOLD = 1 * 10 ** 14;
let FLOAT_SCALE_THRESHOLD = 1.0 * 10 ** 4;
let scale = 4;
setScale(scale);

let colourMap = [
	66, 30, 15,
	25, 7, 26,
	9, 1, 47,
	4, 4, 73,
	0, 7, 100,
	12, 44, 138,
	24, 82, 177,
	57, 125, 209,
	134, 181, 229,
	211, 236, 248,
	241, 233, 191,
	248, 201, 95,
	255, 170, 0,
	204, 128, 0,
	153, 87, 0,
	106, 52, 3
];

function mandelbrotIterate(z0a, z0b, maxIterations) {
	let a = z0a;
	let b = z0b;
	let n = 0;
	while (a ** 2 + b ** 2 < 2 ** 2 && n < maxIterations) {
		/* z^2 + c */
		let aa = (a + b) * (a - b);
		let bb = 2 * a * b;
		a = aa + z0a;
		b = bb + z0b;
		n++;
	}
	return n;
}

const gpu = new GPU();
gpu.addFunction(mandelbrotIterate);

const calculateMandelbrotSet = gpu.createKernel(function(REAL_MIN, REAL_MAX, IMAGINARY_MIN, IMAGINARY_MAX, MAX_ITERATIONS, colourMap) {
	let a = REAL_MIN + (this.thread.x / this.output.x) * (REAL_MAX - REAL_MIN);
	let b = IMAGINARY_MIN + (1 - this.thread.y / this.output.y) * (IMAGINARY_MAX - IMAGINARY_MIN);

	let iterationsToEscape = mandelbrotIterate(a, b, MAX_ITERATIONS);

	if (iterationsToEscape !== MAX_ITERATIONS) {
		this.color(colourMap[(iterationsToEscape % 16) * 3] / 255, colourMap[(iterationsToEscape % 16) * 3 + 1] / 255, colourMap[(iterationsToEscape % 16) * 3 + 2] / 255, 1);
	} else {
		this.color(0, 0, 0, 1);
	}
}).setGraphical(true).setOutput([canvas.width, canvas.height]).setTactic("precision").setLoopMaxIterations(100000);
let c1 = calculateMandelbrotSet.canvas;
c1.id = "gpu-canvas";
document.getElementById("canvas-container").insertBefore(c1, canvas);
console.log(c1);

let times = [];

function interpolateColourMap(colourMap) {
	let newColourMap = [];

	for (var i = 0; i < colourMap.length - 1; i++) {
		let newColour = [
		(colourMap[i][0] + colourMap[i + 1][0]) / 2,
		(colourMap[i][1] + colourMap[i + 1][1]) / 2,
		(colourMap[i][2] + colourMap[i + 1][2]) / 2,
		]
		newColourMap.push(colourMap[i]);
		newColourMap.push(newColour);
		newColourMap.push(colourMap[i + 1]);
	}

	return newColourMap;
}

let image = ctx.createImageData(canvas.width, canvas.height);


let recording = true;
function profile() {
	times.push(window.performance.now());
	while (times[0] <= window.performance.now() - 16.6 * 60) {
		times.shift();
	}

	document.getElementById("frame-rate").textContent = `${times.length} fps`;
	let scale2 = (1 / scale).toExponential(2).split("e");
	scale2[1] = scale2[1].replace("+", "");

	document.getElementById("zoom-scale").innerHTML = `scale: ${scale2[0]} ⋅ 10<sup>${scale2[1]}</sup>x`;
	document.getElementById("iteration-count").textContent = `iterations: ${MAX_ITERATIONS}`;
	document.getElementById("coordinates").textContent = `coords: ${CENTER[0]}r, ${CENTER[1]}i`;

	if (1 / scale < FLOAT_SCALE_THRESHOLD) {
		document.getElementById("using").textContent = `using gpu-brot`;
	} else if (1 / scale <= DOUBLE_SCALE_THRESHOLD) {
		document.getElementById("using").textContent = `using cpu-brot`;
	} else {
		document.getElementById("using").textContent = `using arbitrary-brot`;
	}
}

document.addEventListener("wheel", function(event) {
	let sign = Math.sign(event.deltaY);
	if (sign > 0) {
		scale *= 1.1;
	} else {
		scale /= 1.1;
	}
	scale = Math.max(Math.min(scale, 1 / MIN_SCALE), 1 / (DOUBLE_SCALE_THRESHOLD));
});


function animate() {

	scale = Math.max(Math.min(scale, 1 / MIN_SCALE), 1 / (DOUBLE_SCALE_THRESHOLD));

	if (keys.getKeyDown("w")) {
		CENTER[1] -= 0.01 * scale;
	}
	if (keys.getKeyDown("s")) {
		CENTER[1] += 0.01 * scale;
	}
	if (keys.getKeyDown("d")) {
		CENTER[0] += 0.01 * scale;
	}
	if (keys.getKeyDown("a")) {
		CENTER[0] -= 0.01 * scale;
	}

	MAX_ITERATIONS = Math.min(Number.MAX_SAFE_INTEGER, Math.max(5, Math.floor(Math.pow((1 / scale) * 2 ** 15, 1 / 7) * Math.log10((1 / scale)  * 2 ** 15))));
	setScale(scale);

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	if (1 / scale < FLOAT_SCALE_THRESHOLD) {
		/* use gpu renderer when within the float scale threshold*/
		calculateMandelbrotSet(REAL_BOUND[0], REAL_BOUND[1], IMAGINARY_BOUND[0], IMAGINARY_BOUND[1], MAX_ITERATIONS, colourMap);
		document.getElementById("background").src = c1.toDataURL("image.png");
	} else if (1 / scale <= DOUBLE_SCALE_THRESHOLD) {
		let index = 0;
		/* caching */
		let width = canvas.width;
		let height = canvas.height;
		let REAL_RANGE = REAL_BOUND[1] - REAL_BOUND[0];
		let IMAGINARY_RANGE = IMAGINARY_BOUND[1] - IMAGINARY_BOUND[0];
		let colourMapLength = colourMap.length;
		for (let i = 0; i < height; i++) {
			for (let j = 0; j < width; j++) {
				let iterationsToEscape = mandelbrotIterate(REAL_BOUND[0] + (j / width) * REAL_RANGE, IMAGINARY_BOUND[0] + (i / height) * IMAGINARY_RANGE, MAX_ITERATIONS);
				if (iterationsToEscape !== MAX_ITERATIONS) {
					let colourIndex = (iterationsToEscape % (colourMapLength / 3)) * 3;
					image.data[index + 0] = colourMap[colourIndex + 0];
					image.data[index + 1] = colourMap[colourIndex + 1];
					image.data[index + 2] = colourMap[colourIndex + 2];
				} else {
					image.data[index + 0] = 0;
					image.data[index + 1] = 0;
					image.data[index + 2] = 0;
				}
				image.data[index + 3] = 255;
				index += 4;
			}
		}
		ctx.putImageData(image, 0, 0);
		document.getElementById("background").src = canvas.toDataURL("image.png");
	} else {
		/* arbitrary precision here*/
	}

	profile();

	if (MAX_ITERATIONS <= MAX_ITERATIONS) {
		requestAnimationFrame(animate);
	}
}
animate();