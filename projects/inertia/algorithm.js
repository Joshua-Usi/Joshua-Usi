function solveInertia(wallArray, startingPosition, endingPosition) {
	let recursionData = [];
	let solutionMoves = [];
	/* this means that the starting and ending position are on each other, i.e. astronaut doesn't move */
	if (startingPosition.x === endingPosition.x && startingPosition.y === endingPosition.y) {
		return [];
	}
	/* fork recursive function that by definition returns the sortest path as the shortest path will require the least forks */
	function inertiaForking(data) {
		let moveCount = 0;
		switch (data.direction) {
			case "left":
				/* repeat moving left until astronaut hits a wall */
				while (wallArray.verticalWalls[data.currentPosition.y][data.currentPosition.x] === false) {
					data.currentPosition.x--;
					moveCount++;
				}
				break;
			case "up":
				/* repeat moving up until astronaut hits a wall */
				while (wallArray.horizontalWalls[data.currentPosition.y] && wallArray.horizontalWalls[data.currentPosition.y][data.currentPosition.x] === false) {
					data.currentPosition.y--;
					moveCount++;
				}
				break;
			case "right":
				/* repeat moving right until astronaut hits a wall */
				while (wallArray.verticalWalls[data.currentPosition.y] && wallArray.verticalWalls[data.currentPosition.y][data.currentPosition.x + 1] === false) {
					data.currentPosition.x++;
					moveCount++;
				}
				break;
			case "down":
				/* repeat moving down until astronaut hits a wall */
				while (wallArray.horizontalWalls[data.currentPosition.y + 1] && wallArray.horizontalWalls[data.currentPosition.y + 1][data.currentPosition.x] === false) {
					data.currentPosition.y++;
					moveCount++;
				}
				break;
		}
		/* illegal move, the astronaut tried to move into a wall or the astronaut did not move */
		if (data.direction !== undefined && moveCount === 0) {
			recursionData.splice(data.myIndex, 1);
			for (let j = data.myIndex; j < recursionData.length; j++) {
				recursionData[j].myIndex--;
			}
			return;
		}
		/* add the direction to accumulated moves */
		if (data.direction) {
			data.accumulatedMoves.push(data.direction + " " + moveCount);
		}
		/* solutions longer than 75 moves will not be considered */
		if (data.accumulatedMoves.length > 75) {
			recursionData.splice(data.myIndex, 1);
			for (let j = data.myIndex; j < recursionData.length; j++) {
				recursionData[j].myIndex--;
			}
			return;
		}
		/* return early if solution is longer then the current shortest */
		if (solutionMoves.length !== 0 && data.accumulatedMoves.length > solutionMoves.length) {
			recursionData.splice(data.myIndex, 1);
			for (let j = data.myIndex; j < recursionData.length; j++) {
				recursionData[j].myIndex--;
			}
			return;
		}
		/* solution found, if it is shorter, then set it to the new solution */
		if (data.currentPosition.x === endingPosition.x && data.currentPosition.y === endingPosition.y && (data.accumulatedMoves.length < solutionMoves.length || solutionMoves.length === 0)) {
			solutionMoves = data.accumulatedMoves;
			recursionData.splice(data.myIndex, 1);
			for (let j = data.myIndex; j < recursionData.length; j++) {
				recursionData[j].myIndex--;
			}
			return;
		}
		/* astronaut died, went out of bounds */
		if (data.currentPosition.x < 0 || data.currentPosition.x >= wallArray.x || data.currentPosition.y < 0 || data.currentPosition.y >= wallArray.y) {
			recursionData.splice(data.myIndex, 1);
			for (let j = data.myIndex; j < recursionData.length; j++) {
				recursionData[j].myIndex--;
			}
			return;
		}
		/* fork into 4 sub processes, shouldn't experience and call stack limits considering the javascript call stack can handle 5000 of these function calls */
		for (let i = 0; i < 4; i++) {
			switch (i) {
				case 0:
					/* ensure that the astronaut doesn't just mindlessly travel back and forth */
					if (data.direction !== "right") {
						recursionData.push({
							currentPosition: point(data.currentPosition),
							direction: "left",
							accumulatedMoves: data.accumulatedMoves.slice(0),
							myIndex: recursionData.length
						});
					}
					break;
				case 1:
					/* ensure that the astronaut doesn't just mindlessly travel back and forth */
					if (data.direction !== "down") {
						recursionData.push({
							currentPosition: point(data.currentPosition),
							direction: "up",
							accumulatedMoves: data.accumulatedMoves.slice(0),
							myIndex: recursionData.length
						});
					}
					break;
				case 2:
					/* ensure that the astronaut doesn't just mindlessly travel back and forth */
					if (data.direction !== "left") {
						recursionData.push({
							currentPosition: point(data.currentPosition),
							direction: "right",
							accumulatedMoves: data.accumulatedMoves.slice(0),
							myIndex: recursionData.length
						});
					}
					break;
				case 3:
					/* ensure that the astronaut doesn't just mindlessly travel back and forth */
					if (data.direction !== "up") {
						recursionData.push({
							currentPosition: point(data.currentPosition),
							direction: "down",
							accumulatedMoves: data.accumulatedMoves.slice(0),
							myIndex: recursionData.length
						});
					}
					break;
			}
		}
	}
	/* call the function once */
	inertiaForking({
		currentPosition: startingPosition,
		direction: undefined,
		accumulatedMoves: [],
		myIndex: 0,
	});
	/* now do recursion, except this type of recursion is call stack safe (no call stack limits) */
	while (recursionData.length > 0) {
		for (let i = 0; i < recursionData.length; i++) {
			inertiaForking(recursionData[i]);
		}
	}
	/* 
	 *	return the solution
	 *	if the array is empty, it means no solutions were found or the solution was too complex
	 */
	return solutionMoves;
}	