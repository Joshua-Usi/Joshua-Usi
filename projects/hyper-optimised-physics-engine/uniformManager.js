export default class UniformManager {
	constructor(gl, shaderProgram) {
		this.gl = gl;
		this.shaderProgram = shaderProgram;
		this.uniformLocations = new Map();
	}
	get(name) {
		return this.uniformLocations.get(name);
	}
	add(name, shaderName) {
		this.uniformLocations.set(name, this.gl.getUniformLocation(this.shaderProgram, shaderName));
	}
}