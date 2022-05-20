import AttributeManager from "./attributeManager.js";
import UniformManager from "./uniformManager.js";
import BufferData from "./bufferData.js";

import * as glMatrix from "./glMatrixIndexes.js";

export default class GLManager {
	constructor(canvasId, vs, fs, width, height) {
		this.canvas = document.getElementById("canvas");
		this.canvas.width = width;
		this.canvas.height = height;
		/* grab webgl 2.0 */
		this.gl = this.canvas.getContext("webgl2");
		if (this.gl === null) {
			throw new Error("Unable to initialise webGL");
		}
		this.version();

		/* auto culling for performance */
		this.gl.enable(this.gl.CULL_FACE);
		this.gl.cullFace(this.gl.BACK);
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.depthFunc(this.gl.LEQUAL);
		this.gl.enable(this.gl.BLEND);
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);

		this.shaderProgram = this.initialiseShaders(vs, fs);
		this.attributeManager = new AttributeManager(this.gl, this.shaderProgram);
		this.uniformManager = new UniformManager(this.gl, this.shaderProgram);
	}
	version() {
		console.log(this.gl.getParameter(this.gl.SHADING_LANGUAGE_VERSION));
		console.log(this.gl.getParameter(this.gl.VERSION));
	}
	loadShader(type, source) {
		const shader = this.gl.createShader(type);
		this.gl.shaderSource(shader, source);
		this.gl.compileShader(shader);
		if (this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS) === false) {
			throw new Error(`Shader compile error: ${this.gl.getShaderInfoLog(shader)}`);
			this.gl.deleteShader();
			return null;
		}
		return shader;
	}
	initialiseShaders(vsSource, fsSource) {
		const vertexShader = this.loadShader(this.gl.VERTEX_SHADER, vsSource);
		const fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, fsSource);

		const shaderProgram = this.gl.createProgram();
		this.gl.attachShader(shaderProgram, vertexShader);
		this.gl.attachShader(shaderProgram, fragmentShader);
		this.gl.linkProgram(shaderProgram);

		if (this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS) === false) {
			throw new Error(`Unable to initialize the shader program: ${this.gl.getProgramInfoLog(shaderProgram)}`);
		}

		return shaderProgram;
	}
	generateBuffer(bufferData, constructor, type) {
		const buffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new constructor(bufferData), type);
		return buffer;
	}
	loadTexture(url) {
		const texture = this.gl.createTexture();
		this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

		const level = 0;
		const internalFormat = this.gl.RGBA;
		const width = 1;
		const height = 1;
		const border = 0;
		const srcFormat = this.gl.RGBA;
		const srcType = this.gl.UNSIGNED_BYTE;
		/* default white pixel if texture is not loaded */
		const pixel = new Uint8Array([255, 255, 255, 255]);
		this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);

		const image = new Image();
		let that = this;
		image.addEventListener("load", function() {
			this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
			this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);

			// WebGL1 has different requirements for power of 2 images
			// vs non power of 2 images so check if the image is a
			// power of 2 in both dimensions.
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
			if (that.isPowerOf2(image.width) && that.isPowerOf2(image.height)) {
				// Yes, it's a power of 2. Generate mips.
				this.gl.generateMipmap(this.gl.TEXTURE_2D);
			} else {
				// No, it's not a power of 2. Turn off mips and set
				// wrapping to clamp to edge
				this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
				this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
				this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
			}
		});
		image.src = url;

		return texture;
	}
	isPowerOf2(value) {
		return (value & (value - 1)) === 0;
	}
	clear(r, g, b, a) {
		this.gl.clearColor(r, g, b, a);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
	}
	renderSetup(position) {
		const fieldOfView = 90 * Math.PI / 180;
		const aspectRatio = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
		const clipNear = 0.1;
		const clipFar = Infinity;
		const projectionMatrix = glMatrix.mat4.create();
		glMatrix.mat4.perspective(projectionMatrix, fieldOfView, aspectRatio, clipNear, clipFar);

		const modelViewMatrix = glMatrix.mat4.create();
		glMatrix.mat4.translate(modelViewMatrix, modelViewMatrix, [-position.x, -position.y, 0]);

		this.gl.useProgram(this.shaderProgram);

		this.gl.uniformMatrix4fv(this.uniformManager.get("projectionMatrix"), false, projectionMatrix);
		this.gl.uniformMatrix4fv(this.uniformManager.get("modelViewMatrix"), false, modelViewMatrix);

	}
	renderInstanced(buffers, instanceBuffers, objectCount) {
		let positionBuffer = new BufferData(3, this.gl.FLOAT, false, 0, 0, buffers.vertices, this.attributeManager.get("vertexPosition"));
		positionBuffer.enable(this.gl);
		// let colourBuffer = new BufferData(4, this.gl.FLOAT, false, 0, 0, buffers.colours, this.attributeManager.get("vertexColour"));
		// colourBuffer.enable(this.gl);
		let instancePositionsBuffer = new BufferData(2, this.gl.FLOAT, false, 0, 0, instanceBuffers.position, this.attributeManager.get("instancePosition"), 1);
		instancePositionsBuffer.enable(this.gl);
		let instanceScalesBuffer = new BufferData(2, this.gl.FLOAT, false, 0, 0, instanceBuffers.scale, this.attributeManager.get("instanceScale"), 1);
		instanceScalesBuffer.enable(this.gl);
		let instanceColoursBuffer = new BufferData(4, this.gl.FLOAT, false, 0, 0, instanceBuffers.colour, this.attributeManager.get("instanceColour"), 1);
		instanceColoursBuffer.enable(this.gl);

		const offset = 0;
		const vertexCount = 32 + 2;
		const type = this.gl.UNSIGNED_SHORT;
		this.gl.drawArraysInstanced(this.gl.TRIANGLE_FAN, 0, vertexCount, objectCount);
		this.gl.drawArraysInstanced(this.gl.LINE_STRIP, 1, vertexCount - 1, objectCount);
	}
}