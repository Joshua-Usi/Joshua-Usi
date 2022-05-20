export class BufferData {
	constructor(num, type, normalise, stride, offset, bufferData, vertexAttributeLocation) {
		this.numComponents = num;
		this.type = type;
		this.normalise = normalise;
		this.stride = stride;
		this.offset = offset;
		this.bufferData = bufferData;
		this.vertexAttributeLocation = vertexAttributeLocation;
	}
	divisor(gl, n) {
		gl.vertexAttribDivisor(this.vertexAttributeLocation, n);
	}
	enable(gl) {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferData);
		gl.vertexAttribPointer(this.vertexAttributeLocation, this.numComponents, this.type, this.normalise, this.stride, this.offset);
		gl.enableVertexAttribArray(this.vertexAttributeLocation);
	}
}