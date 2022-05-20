import * as glMatrix from "../../gl-lib/index.js";

export function dist3d(x1, y1, z1, x2, y2, z2) {
	return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2 + (z1 - z2) ** 2);
}

export function fastDist3d(x1, y1, z1, x2, y2, z2) {
	return (x1 - x2) ** 2 + (y1 - y2) ** 2 + (z1 - z2) ** 2;
}

export function angle2d(x1, y1, x2, y2) {
	return Math.atan2(x1 - x2, y1 - y2);
}

/* https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript */
export function toTitleCase(str) {
	return str.replace(
		/\w\S*/g,
		function(txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		}
	);
}

export function randomFromRange(min, max) {
	return min + Math.random() * (max - min);
}

export function map(num, numMin, numMax, mapMin, mapMax) {
	return mapMin + ((mapMax - mapMin) / (numMax - numMin)) * (num - numMin)
}

export function average(array) {
	let sum = 0
	for (let i = 0; i < array.length; i++) {
		sum += array[i];
	}
	return sum / array.length;
}

export function onOff(bool) {
	if (bool) {
		return "on";
	}
	return "off";
}

/* webgl utils stuff */
export function generateModelMatrix(position, scale, rotation) {
	let matrix = glMatrix.mat4.create();
	glMatrix.mat4.translate(matrix, matrix, position);
	glMatrix.mat4.scale(matrix, matrix, scale);
	if (rotation) {
		if (rotation[0] !== 0) {
			glMatrix.mat4.rotateX(matrix, matrix, rotation[0]);
		}
		if (rotation[1] !== 0) {
			glMatrix.mat4.rotateY(matrix, matrix, rotation[1]);
		}
		if (rotation[2] !== 0) {
			glMatrix.mat4.rotateZ(matrix, matrix, rotation[2]);
		}
	}
	return matrix;
}

export function printWebGLSystemLimits(gl) {
	console.log({
		MAX_CUBE_MAP_TEXTURE_SIZE: gl.MAX_CUBE_MAP_TEXTURE_SIZE,
		MAX_RENDERBUFFER_SIZE: gl.MAX_RENDERBUFFER_SIZE,
		MAX_TEXTURE_SIZE: gl.MAX_TEXTURE_SIZE,
		MAX_VIEWPORT_DIMS: gl.MAX_VIEWPORT_DIMS,
		MAX_VERTEX_TEXTURE_IMAGE_UNITS: gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS,
		MAX_TEXTURE_IMAGE_UNITS: gl.MAX_TEXTURE_IMAGE_UNITS,
		MAX_COMBINED_TEXTURE_IMAGE_UNITS: gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS,
		MAX_VERTEX_ATTRIBS: gl.MAX_VERTEX_ATTRIBS,
		MAX_VARYING_VECTORS: gl.MAX_VARYING_VECTORS,
		MAX_VERTEX_UNIFORM_VECTORS: gl.MAX_VERTEX_UNIFORM_VECTORS,
		MAX_FRAGMENT_UNIFORM_VECTORS: gl.MAX_FRAGMENT_UNIFORM_VECTORS,
		ALIASED_POINT_SIZE_RANGE: gl.ALIASED_POINT_SIZE_RANGE,
		SHADING_LANGUAGE_VERSION: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
		VERSION: gl.getParameter(gl.VERSION),
	});
}