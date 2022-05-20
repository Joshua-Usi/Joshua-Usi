/*
 *	gl: the webgl context
 *	type: the shader type, fragment or vertex
 *	source: the source of the shader
 */
function loadShader(gl, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) === false) {
		console.log(source);
		throw new Error(`Shader compile error: ${gl.getShaderInfoLog(shader)}`);
		gl.deleteShader();
		return null;
	}
	return shader;
}

export function initialiseShaders(gl, vsSource, fsSource) {
	const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
	const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (gl.getProgramParameter(shaderProgram, gl.LINK_STATUS) === false) {
		throw new Error(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
	}

	return shaderProgram;
}