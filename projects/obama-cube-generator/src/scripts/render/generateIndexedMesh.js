export function generateIndexedMesh(vertices) {
	let uniques = [];
	let indexes = [];

	for (let i = 0; i < vertices.length / 3; i += 3) {
		let found = false;
		for (let j = 0; j < uniques.length / 3; j += 3) {
			if (uniques[j + 0] === vertices[i + 0] &&
				uniques[j + 1] === vertices[i + 1] &&
				uniques[j + 2] === vertices[i + 2]) {
				found = true;
				indexes.push(j / 3);
				uniques.push(vertices[i + 0]);
				uniques.push(vertices[i + 1]);
				uniques.push(vertices[i + 2]);
				break;
			}
		}
		if (found === false) {
			indexes.push(uniques.length / 3);
			uniques.push(vertices[i + 0]);
			uniques.push(vertices[i + 1]);
			uniques.push(vertices[i + 2]);

		}
	}
	console.log(uniques);
	console.log(indexes);
	return {
		vertices: uniques,
		indexes: indexes,
	}
}