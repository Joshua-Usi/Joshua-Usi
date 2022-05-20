import {toTitleCase} from "../util/utils.js"

export function createBufferDetails(buffers, options) {

}

export function generateFragmentShader(buffers, isInstanced) {
	/* determine version, is going to be constant */
	let shaderVersion = "#version 300 es\n";

	/* check attributes and add them to in */
	let attributes = "";
	/* ignore certain buffers */
	let exemptBuffers = ["index"];
	for (let buffer in buffers) {
		if (buffers.hasOwnProperty(buffer) && exemptBuffers.includes(buffers[buffer].type) === false) {
			attributes += `in vec${buffers[buffer].width} vVertex${toTitleCase(buffers[buffer].type)};\n`;
		}
	}

	/* default uniforms */
	let uniforms = `uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
`;

	/* determine the varyings required and add them to out */
	let varyings = "out highp vec4 colour";

	/* build main function*/
	let main = `void main() {\n`;

	/* compile shader parts together */
	return `${shaderVersion}
${attributes}
${uniforms}
${varyings}
${main}
}`;

	shaderVersion + attributes + uniforms + varyings + main + "}";
}

export function generateVertexShader(buffers, isInstanced) {
	/* determine version, is going to be constant */
	let shaderVersion = "#version 300 es\n";

	/* check attributes and add them to in */
	let attributes = "";
	/* ignore certain buffers */
	let exemptBuffers = ["index"];
	for (let buffer in buffers) {
		if (buffers.hasOwnProperty(buffer) && exemptBuffers.includes(buffers[buffer].type) === false) {
			attributes += `in vec${buffers[buffer].width} aVertex${toTitleCase(buffers[buffer].type)};\n`;
		}
	}
	/* add a secondary attribute for instanced shaders */
	if (isInstanced) {
		attributes += `in vec3 aInstancePosition;\n`;
	}

	/* default uniforms */
	let uniforms = `uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
`;

	/* determine the varyings required and add them to out */
	let varyings = "";
	/* ignore certain buffers */
	exemptBuffers = ["index"];
	for (let buffer in buffers) {
		if (buffers.hasOwnProperty(buffer) && exemptBuffers.includes(buffers[buffer].type) === false) {
			varyings += `out highp vec${buffers[buffer].width} vVertex${toTitleCase(buffers[buffer].type)};\n`;
		}
	}

	/* build main function*/
	let main = `void main() {\n`;
	/* build position function based on isInstanced */
	main += `gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertex${toTitleCase(buffers["vertices"].type)} ${(isInstanced) ? "+ aInstancePosition" : ""}, 1);\n`;
	/* ignore certain buffers */
	exemptBuffers = ["index"];
	for (let buffer in buffers) {
		if (buffers.hasOwnProperty(buffer) && exemptBuffers.includes(buffers[buffer].type) === false) {
			let string = `vVertex${toTitleCase(buffers[buffer].type)}; = aVertex${toTitleCase(buffers[buffer].type)}`;
			/* add the instance position to out vertex position */
			if (buffers[buffer].type === "vertex" && isInstanced) {
				string += ` + aInstancePosition`
			}
			main += string + ";\n";
		}
	}

	/* compile shader parts together */
	return `${shaderVersion}
${attributes}
${uniforms}
${varyings}
${main}
}`;

	shaderVersion + attributes + uniforms + varyings + main + "}";
}