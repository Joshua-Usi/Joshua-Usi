export class GLProgramInfo {
	constructor(gl, shaderProgram) {
		this.program = shaderProgram;
		this.attributeLocations = {
			vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
			vertexColour: gl.getAttribLocation(shaderProgram, "aVertexColour"),
			vertexNormal: gl.getAttribLocation(shaderProgram, "aVertexNormal"),
			textureCoord: gl.getAttribLocation(shaderProgram, "aTextureCoord"),
			instanceTransforms: gl.getAttribLocation(shaderProgram, "aInstanceTransforms"),
		};
		this.uniformLocations = {
			projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
			modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
			transformMatrix: gl.getUniformLocation(shaderProgram, "uTransformMatrix"),
			particleSystemOrigin: gl.getUniformLocation(shaderProgram, "uParticleSystemOrigin"),
			
			uSampler: gl.getUniformLocation(shaderProgram, "uSampler"),
			lightPos: gl.getUniformLocation(shaderProgram, "uLightPos"),
			lightColour: gl.getUniformLocation(shaderProgram, "uLightColour"),
		};
	}
}


class ShaderComponent {
	constructor(type, name) {
		this.type = type;
		this.name = name;
	}
}

export class ShaderProgram {
	constructor(gl, bufferDetails, options = {
		isInstanced: false,
		useVec3ForInstances: false,
		isBillboard: false,
		doAmbientLighting: true,
		doDiffuseLighting: true,
		doSpecularLighting: false,
	}) {
		this.context = gl;
		this.options = options;
		this.shaderProgram = null;
		this.attributeLocations = {};
		this.uniformLocations = {};
	}
	build() {
		
	}
	use() {

	}
}