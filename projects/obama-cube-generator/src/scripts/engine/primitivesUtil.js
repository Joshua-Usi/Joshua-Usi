export function icosphere(radius) {
	const H_ANGLE = Math.PI / 180 * 72;
	const V_ANGLE = Math.atan(0.5);

	let vertices = [];
	let hAngle1 = -Math.PI / 2 - H_ANGLE / 2;
	let hAngle2 = -Math.PI / 2;

	
	vertices[0] = 0;
	vertices[1] = 0;
	vertices[2] = radius;

	for (let i = 1; i <= 5; i++) {
		let i1 = i * 3;
		let i2 = (i + 5) * 3;

		let z  = radius * Math.sin(V_ANGLE);
		let xy = radius * Math.cos(V_ANGLE);

		vertices[i1] = xy * Math.cos(hAngle1);
		vertices[i2] = xy * Math.cos(hAngle2);
		vertices[i1 + 1] = xy * Math.sin(hAngle1);
		vertices[i2 + 1] = xy * Math.sin(hAngle2);
		vertices[i1 + 2] = z;
		vertices[i2 + 2] = -z;

		hAngle1 += H_ANGLE;
		hAngle2 += H_ANGLE;
	}
	
	let i1 = 11 * 3;
	vertices[i1] = 0;
	vertices[i1 + 1] = 0;
	vertices[i1 + 2] = -radius;

	return vertices;
}

export function subdivide(verticesIn, indicesIn, normalsIn, radius, subdivisions) {
	let tempVertices = [];
	let tempIndices = [];
	let vertices = verticesIn;
	let normals = normalsIn;
	let indices = indicesIn;

	/* iteration */
	for (let i = 1; i <= subdivisions; i++) {
		/* copy prev arrays */
		tempVertices = vertices;
		tempIndices = indices;

		/* clear prev arrays */
		vertices = [];
		normals = [];
		indices = [];

		let index = 0;
		let indexCount = tempIndices.length;
		for (let j = 0; j < indexCount; j += 3) {
			/* get 3 vertices of a triangle */
			let v1 = tempVertices.getVertex(tempIndices[j + 0] * 3);
			let v2 = tempVertices.getVertex(tempIndices[j + 1] * 3);
			let v3 = tempVertices.getVertex(tempIndices[j + 2] * 3);

			/* get 3 new vertices by spliting half on each edge */
			let newV1 = computeHalfVertex(v1, v2, radius);
			let newV2 = computeHalfVertex(v2, v3, radius);
			let newV3 = computeHalfVertex(v1, v3, radius);

			/* add 4 new triangles */
			vertices.pushTriangle(v1, newV1, newV3);
			let normal = computeFaceNormal(v1, newV1, newV3);
			normals.pushTriangle(normal, normal, normal);

			vertices.pushTriangle(newV1, v2, newV2);
			normal = computeFaceNormal(newV1, v2, newV2);
			normals.pushTriangle(normal, normal, normal);

			vertices.pushTriangle(newV1, newV2, newV3);
			normal = computeFaceNormal(newV1, newV2, newV3);
			normals.pushTriangle(normal, normal, normal);

			vertices.pushTriangle(newV3, newV2, v3);
			normal = computeFaceNormal(newV3, newV2, v3);
			normals.pushTriangle(normal, normal, normal);

			for (let k = 0; k < 12; k++) {
				indices.push(index + k);
			}

			index += 12;
		}
	}
	return {
		vertices: vertices,
		normals: normals,
		indices: indices
	};
}

/* Method that splits 2 vertices at the middle and extends the new vertice to fit the shape of a circle */
function computeHalfVertex(v1, v2, radius) {
	let vx = v1[0] + v2[0];
	let vy = v1[1] + v2[1];
	let vz = v1[2] + v2[2];
	let scale = radius / Math.sqrt(vx ** 2 + vy ** 2 + vz ** 2);
	vx *= scale;
	vy *= scale;
	vz *= scale;
	return [vx, vy, vz];
}

export function computeFaceNormal(v1, v2, v3) {
	/* find 2 edge vectors: v1-v2, v1-v3 */
	let ex1 = v2[0] - v1[0];
	let ey1 = v2[1] - v1[1];
	let ez1 = v2[2] - v1[2];
	let ex2 = v3[0] - v1[0];
	let ey2 = v3[1] - v1[1];
	let ez2 = v3[2] - v1[2];

	/* cross product: e1 x e2 */
	let nx, ny, nz;
	nx = ey1 * ez2 - ez1 * ey2;
	ny = ez1 * ex2 - ex1 * ez2;
	nz = ex1 * ey2 - ey1 * ex2;

	/* normalize only if the length is > 0 */
	let length = Math.sqrt(nx ** 2 + ny ** 2 + nz ** 2);
	if (length > 0.0001) {
		/* normalize */
		let lengthInv = 1 / length;
		return [nx * lengthInv, nz * lengthInv, ny * lengthInv];
	}
	return [0, 0, 0];
}