import {BufferData} from "./BufferData.js";
import {updateTexture} from "./loadTextures.js"

function setupRender(gl, programInfo, buffers, cameraPosition, transforms, texture, instancesUseVec3) {
	const fieldOfView = cameraPosition.fov * Math.PI / 180;
	const aspectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;
	const clipNear = 0.1;
	const clipFar = Infinity;
	const projectionMatrix = glMatrix.mat4.create();

	// glMatrix.mat4.ortho(projectionMatrix, -10, 10, 10, -10, 0, 1000);
	glMatrix.mat4.perspective(projectionMatrix, fieldOfView, aspectRatio, clipNear, clipFar);

	/* start of actual drawing */
	const modelViewMatrix = glMatrix.mat4.create();
	glMatrix.mat4.translate(modelViewMatrix, modelViewMatrix, [cameraPosition.x, cameraPosition.y, cameraPosition.z]);
	glMatrix.mat4.lookAt(modelViewMatrix, [cameraPosition.x, cameraPosition.y, cameraPosition.z], [cameraPosition.x + Math.cos(cameraPosition.yaw) * Math.cos(cameraPosition.pitch), cameraPosition.y + Math.sin(cameraPosition.pitch), cameraPosition.z + Math.sin(cameraPosition.yaw) * Math.cos(cameraPosition.pitch)], [0, 1, 0]);
	/* assign relative program */
	gl.useProgram(programInfo.program);

	/* mvp matrices */
	gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
	gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);

	/* setup attributes if they exist */
	if (programInfo.attributeLocations.vertexPosition !== -1) {
		let positionBuffer = new BufferData(3, gl.FLOAT, false, 0, 0, buffers.vertices.buffer, programInfo.attributeLocations.vertexPosition);
		positionBuffer.enable(gl);
	}
	if (programInfo.attributeLocations.textureCoord !== -1) {
		let textureCoordBuffer = new BufferData(2, gl.FLOAT, false, 0, 0, buffers.textureCoord.buffer, programInfo.attributeLocations.textureCoord);
		textureCoordBuffer.enable(gl);
	}
	if (programInfo.attributeLocations.vertexColour !== -1) {
		let colourBuffer = new BufferData(3, gl.FLOAT, false, 0, 0, buffers.colours.buffer, programInfo.attributeLocations.vertexColour);
		colourBuffer.enable(gl);
	}
	if (programInfo.attributeLocations.vertexNormal !== -1) {
		let normalBuffer = new BufferData(3, gl.FLOAT, false, 0, 0, buffers.normals.buffer, programInfo.attributeLocations.vertexNormal);
		normalBuffer.enable(gl, 1);
	}
	/* apply transform matrices for instanced objects if applicable*/
	if (programInfo.attributeLocations.instanceTransforms !== -1) {
		if (instancesUseVec3) {
			let instanceBuffer = new BufferData(3, gl.FLOAT, false, 3 * 4, 0, transforms, programInfo.attributeLocations.instanceTransforms);
			instanceBuffer.divisor(gl, 1);
			instanceBuffer.enable(gl);
		} else {
			for (let i = 0; i < 4; i++) {
				let instanceBuffer = new BufferData(4, gl.FLOAT, false, 64, i * 16, transforms, programInfo.attributeLocations.instanceTransforms + i);
				instanceBuffer.divisor(gl, 1);
				instanceBuffer.enable(gl);
			}
		}
	}

	if (texture) {
	/* webgl setup, bining and sampler telling for textures */
		if (texture.isVideo) {
			updateTexture(gl, texture)
		}
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
	}
}

let triCount = 0;

export function resetTriCount() {
	triCount = 0;
}

export function getTriCount() {
	return triCount;
}


export function renderObjectInstanced(gl, programInfo, buffers, transforms, numberOfObjects, cameraPosition, texture, useIndexBuffer, instancesUseVec3) {
	setupRender(gl, programInfo, buffers, cameraPosition, transforms, texture, instancesUseVec3);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices.buffer);
	{
		const offset = 0;
		const vertexCount = buffers.indices.data.length;
		const type = gl.UNSIGNED_SHORT;
		gl.drawElementsInstanced(gl.TRIANGLES, vertexCount, type, offset, numberOfObjects);
	}
	triCount += buffers.indices.data.length / 3 / 3 * numberOfObjects;
}

export function renderObject(gl, programInfo, buffers, transformMatrix, cameraPosition, texture, useIndexBuffer) {
	setupRender(gl, programInfo, buffers, cameraPosition, transformMatrix, texture);
	gl.uniformMatrix4fv(programInfo.uniformLocations.transformMatrix, false, transformMatrix);

	if (useIndexBuffer) {
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices.buffer);
		{
			const offset = 0;
			const vertexCount = buffers.indices.data.length;
			const type = gl.UNSIGNED_SHORT;
			gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
		}
	} else {
		{
			const offset = 0;
			const vertexCount = buffers.indices.data.length;
			gl.drawArrays(gl.TRIANGLES, offset, vertexCount);
		}
	}
	triCount += buffers.vertices.data.length / 3 / 3;
}
