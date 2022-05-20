export function circleBuffer(sides) {
	let z = -window.innerHeight / 2;
	const vertices = [];
	vertices.push(0);
	vertices.push(0);
	vertices.push(z);
	for (let i = 0; i <= 2 * Math.PI; i += 2 * Math.PI / sides) {
		vertices.push(Math.cos(i));
		vertices.push(Math.sin(i));
		vertices.push(z);
	}
	vertices.push(1);
	vertices.push(0);
	vertices.push(z);

	const indices = [];
	for (let i = 0; i < vertices.length / 3; i++) {
		indices.push(i);
	}

	const colours = [];
	for (let i = 0; i < vertices.length / 3; i++) {
		colours.push(0.7);
		colours.push(0.7);
		colours.push(0.7);
	}

	return {
		vertices: renderer.generateBuffer(vertices, renderer.gl.STATIC_DRAW),
		indices: renderer.generateBuffer(indices, renderer.gl.STATIC_DRAW),
		colours: renderer.generateBuffer(colours, renderer.gl.STATIC_DRAW),
	}
}