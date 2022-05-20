function CUSTOM_CASE(startX, startY, endX, endY, width, height) {
	let positionOfTheX = point(startX, startY);
	let positionOfTheY = point(endX, endY);
	let walls = new InertiaWalls(width, height);
	return {
		startingPosition: positionOfTheX,
		endingPosition: positionOfTheY,
		wallDefinitions: walls,
	}
}
function TEST_CASE_1() {
	let positionOfTheX = point(3, 4);
	let positionOfTheY = point(4, 0);
	let walls = new InertiaWalls(5, 5);
	walls.set("x", 0, 0, true);
	walls.set("x", 4, 1, true);
	walls.set("x", 1, 2, true);
	walls.set("x", 2, 3, true);
	walls.set("x", 3, 5, true);
	walls.set("x", 0, 5, true);

	walls.set("y", 5, 0, true);
	walls.set("y", 2, 1, true);
	walls.set("y", 0, 2, true);
	walls.set("y", 0, 4, true);
	walls.set("y", 5, 4, true);
	return {
		startingPosition: positionOfTheX,
		endingPosition: positionOfTheY,
		wallDefinitions: walls,
	}
}

function TEST_CASE_2() {
	let positionOfTheX = point(4, 4);
	let positionOfTheY = point(1, 1);
	let walls = new InertiaWalls(6, 5);
	walls.set("x", 0, 0, true);
	walls.set("x", 4, 0, true);
	walls.set("x", 5, 0, true);
	walls.set("x", 1, 2, true);
	walls.set("x", 3, 2, true);
	walls.set("x", 2, 3, true);
	walls.set("x", 4, 4, true);

	walls.set("y", 2, 0, true);
	walls.set("y", 3, 0, true);
	walls.set("y", 1, 1, true);
	walls.set("y", 0, 3, true);
	walls.set("y", 5, 3, true);
	walls.set("y", 2, 4, true);
	return {
		startingPosition: positionOfTheX,
		endingPosition: positionOfTheY,
		wallDefinitions: walls,
	}
}

function TEST_CASE_3() {
	let positionOfTheX = point(1, 3);
	let positionOfTheY = point(4, 1);
	let walls = new InertiaWalls(6, 6);
	walls.set("x", 1, 0, true);
	walls.set("x", 0, 1, true);
	walls.set("x", 5, 1, true);
	walls.set("x", 1, 2, true);
	walls.set("x", 3, 2, true);
	walls.set("x", 4, 2, true);
	walls.set("x", 1, 6, true);

	walls.set("y", 5, 0, true);
	walls.set("y", 2, 1, true);
	walls.set("y", 4, 1, true);
	walls.set("y", 0, 2, true);
	walls.set("y", 3, 2, true);
	walls.set("y", 6, 2, true);
	walls.set("y", 1, 3, true);
	walls.set("y", 3, 3, true);
	walls.set("y", 5, 3, true);
	walls.set("y", 0, 4, true);
	walls.set("y", 6, 4, true);
	walls.set("y", 4, 5, true);
	return {
		startingPosition: positionOfTheX,
		endingPosition: positionOfTheY,
		wallDefinitions: walls,
	}
}