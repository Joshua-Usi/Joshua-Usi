export class BufferInfo {
	constructor(gl, type, width, data, dataArray, typeEnum) {
		this.type = type;
		this.width = width;
		this.data = data;
		this.buffer = gl.createBuffer();
		gl.bindBuffer(typeEnum, this.buffer);
		gl.bufferData(typeEnum, new dataArray(data), gl.STATIC_DRAW);
	}
}