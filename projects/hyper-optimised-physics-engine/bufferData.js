export default class BufferData {
	constructor(num, type, normalise, stride, offset, bufferData, vertexAttributeLocation, divisor) {
		this.numComponents = num;
		this.type = type;
		this.normalise = normalise;
		this.stride = stride;
		this.offset = offset;
		this.bufferData = bufferData;
		this.vertexAttributeLocation = vertexAttributeLocation;
		this.divisor = divisor;
	}
	enable(gl) {	
		gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferData);
		gl.vertexAttribPointer(this.vertexAttributeLocation, this.numComponents, this.type, this.normalise, this.stride, this.offset);
		if (this.divisor) {
			gl.vertexAttribDivisor(this.vertexAttributeLocation, this.divisor);
		}
		gl.enableVertexAttribArray(this.vertexAttributeLocation);
	}
}