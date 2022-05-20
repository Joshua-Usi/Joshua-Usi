export default class AttributeManager {
	constructor(gl, shaderProgram) {
		this.gl = gl;
		this.shaderProgram = shaderProgram;
		this.attributeLocations = new Map();
	}
	get(name) {
		return this.attributeLocations.get(name);
	}
	add(name, shaderName) {
		this.attributeLocations.set(name, this.gl.getAttribLocation(this.shaderProgram, shaderName));
	}
}