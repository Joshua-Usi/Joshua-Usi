/* simple error checker */
window.addEventListener("error", function () {
	document.getElementById("output").textContent = "There was an error, check the console";
});

/* get canvas */
let canvas = document.getElementById("drawing-canvas");
/* get canvas context */
let ctx = canvas.getContext("2d");

/* handles mouse positions*/
let mouse = {
	x: 0,
	y: 0,
	xArr: 0,
	yArr: 0,
};

/* global array where the solution will be shown */
let solution = [];

/* shows a message that indicates to the user the processing that is happening */
function showMessage(message) {
	let messageElement = document.getElementById("message");
	messageElement.textContent = message;
	messageElement.style.transition = "opacity 0s";
	messageElement.style.opacity = 1;
	requestAnimationFrame(function() {
		messageElement.style.transition = "opacity 4s";
		messageElement.style.opacity = 0;
	});
}

function resetOutput() {
	solution = [];
	document.getElementById("solution-move-count").textContent = "Minimum move count: ";
	document.getElementById("solution-moves").textContent = "Solution moves: ";
}

function setStartPosition(data) {
	document.getElementById("start-position-x").value = data.startingPosition.x
	document.getElementById("start-position-y").value = data.startingPosition.y;
}

function setEndPosition(data) {
	document.getElementById("end-position-x").value = data.endingPosition.x
	document.getElementById("end-position-y").value = data.endingPosition.y;
}

function setMaxes(data) {
	document.getElementById("start-position-x").max = data.wallDefinitions.x - 1;
	document.getElementById("end-position-x").max = data.wallDefinitions.x - 1;

	document.getElementById("start-position-y").max = data.wallDefinitions.y - 1;
	document.getElementById("end-position-y").max = data.wallDefinitions.y - 1;
}

function moveStartPosition() {
	resetOutput();
	let x = parseInt(document.getElementById("start-position-x").value);
	let y = parseInt(document.getElementById("start-position-y").value);
	test.startingPosition.x = x;
	test.startingPosition.y = y;
}

function moveEndPosition() {
	resetOutput();
	let x = parseInt(document.getElementById("end-position-x").value);
	let y = parseInt(document.getElementById("end-position-y").value);
	test.endingPosition.x = x;
	test.endingPosition.y = y;
}

canvas.addEventListener("mousemove", function(event) {
	const rect = this.getBoundingClientRect();
	mouse.x = event.x - rect.left;
	mouse.y = event.y - rect.top;
	if (document.getElementById("x-walls").checked) {
		mouse.xArr = Math.round(map(mouse.x, 0, canvas.width, 0, test.wallDefinitions.x) - 0.5);
		mouse.yArr = Math.round(map(mouse.y, 0, canvas.height, 0, test.wallDefinitions.y));
	} else {
		mouse.xArr = Math.round(map(mouse.x, 0, canvas.width, 0, test.wallDefinitions.x));
		mouse.yArr = Math.round(map(mouse.y, 0, canvas.height, 0, test.wallDefinitions.y) - 0.5);
	}
});

canvas.addEventListener("click", function() {
	if (document.getElementById("x-walls").checked) {
		if (test.wallDefinitions.horizontalWalls[mouse.yArr][mouse.xArr]) {
			test.wallDefinitions.set("x", mouse.xArr, mouse.yArr, false);
		} else {
			test.wallDefinitions.set("x", mouse.xArr, mouse.yArr, true);
		}
	} else {
		if (test.wallDefinitions.verticalWalls[mouse.yArr][mouse.xArr]) {
			test.wallDefinitions.set("y", mouse.xArr, mouse.yArr, false);
		} else {
			test.wallDefinitions.set("y", mouse.xArr, mouse.yArr, true);
		}
	}
});

document.getElementById("solve-inertia-button").addEventListener("click", function() {
	solution = solveInertia(test.wallDefinitions, test.startingPosition, test.endingPosition);
	document.getElementById("solution-move-count").textContent = "Minimum move count: " + solution.length;
	document.getElementById("solution-moves").textContent = "Solution moves: " + solution;
});

document.getElementById("x-length").addEventListener("input", function() {
	resetOutput();
	let x = parseInt(document.getElementById("x-length").value);
	let y = parseInt(document.getElementById("y-length").value);
	test = CUSTOM_CASE(0, 0, x - 1, y - 1, x, y);
	setMaxes(test);
	setEndPosition(test);
	document.getElementById("test-case-1").checked = false;
	document.getElementById("test-case-2").checked = false;
	document.getElementById("test-case-3").checked = false;
	showMessage(`Set grid dimensions to (${x}, ${y})`);
});

document.getElementById("y-length").addEventListener("input", function() {
	resetOutput();
	let x = parseInt(document.getElementById("x-length").value);
	let y = parseInt(document.getElementById("y-length").value);
	test = CUSTOM_CASE(0, 0, x - 1, y - 1, x, y);
	setMaxes(test);
	setEndPosition(test);
	document.getElementById("test-case-1").checked = false;
	document.getElementById("test-case-2").checked = false;
	document.getElementById("test-case-3").checked = false;
	showMessage(`Set grid dimensions to (${x}, ${y})`);
});

document.getElementById("reset-grid").addEventListener("click", function() {
	resetOutput();
	let x = parseInt(document.getElementById("x-length").value);
	let y = parseInt(document.getElementById("y-length").value);
	test = CUSTOM_CASE(0, 0, x - 1, y - 1, x, y);
	document.getElementById("test-case-1").checked = false;
	document.getElementById("test-case-2").checked = false;
	document.getElementById("test-case-3").checked = false;
	showMessage("Reset the grid");
});

document.getElementById("x-walls").addEventListener("change", function() {
	showMessage("Set wall type to horizontal");
});

document.getElementById("y-walls").addEventListener("change", function() {
	showMessage("Set wall type to vertical");
});

document.getElementById("test-case-1").addEventListener("change", function() {
	resetOutput();
	test = TEST_CASE_1();
	setStartPosition(test);
	setEndPosition(test);
	setMaxes(test);
	showMessage("Using test case 1");

});

document.getElementById("test-case-2").addEventListener("change", function() {
	resetOutput();
	test = TEST_CASE_2();
	setStartPosition(test);
	setEndPosition(test);
	setMaxes(test);
	showMessage("Using test case 2");
});

document.getElementById("test-case-3").addEventListener("change", function() {
	resetOutput();
	test = TEST_CASE_3();
	setStartPosition(test);
	setEndPosition(test);
	setMaxes(test);
	showMessage("Using test case 3");
});

document.getElementById("start-position-x").addEventListener("input", moveStartPosition);
document.getElementById("start-position-y").addEventListener("input", moveStartPosition);
document.getElementById("end-position-x").addEventListener("input", moveEndPosition);
document.getElementById("end-position-y").addEventListener("input", moveEndPosition);

let offset = 0;
let astronautImage = new Image();
astronautImage.src = "./images/astronaut.png";
let flagImage = new Image();
flagImage.src = "./images/flag.png";
/* main loop*/
function animate() {
	/* moving background */
	offset -= 0.05;
	document.querySelector("body").style.backgroundPositionY = offset / 4 + "px";
	document.querySelector("body").style.backgroundPositionX = -offset + "px";
	/* set the canvas width and height */
	canvas.width = 80 * test.wallDefinitions.x;
	canvas.height = 80 * test.wallDefinitions.y;
	/* position the canvas to the middle of the screen */
	canvas.style.left = window.innerWidth / 2 - 80 * test.wallDefinitions.x / 2 + "px";
	canvas.style.top = window.innerHeight / 2 - 80 * test.wallDefinitions.y / 2 + "px";
	/* determine the usable part of the canvas */
	let useWidth = canvas.width * 0.975;
	let useHeight = canvas.height * 0.975;
	/* reset leftover transforms */
	ctx.resetTransform();
	/* translate is easier than manual offsetting */
	ctx.translate(canvas.width * 0.0125, canvas.height * 0.0125);
	/* set lines to rounded*/
	ctx.lineCap = "round";
	ctx.lineJoin = "round";
	/* clear canvas*/
	ctx.clearRect(0, 0, useWidth, useHeight);
	/* draw the grid lines*/
	ctx.beginPath();
	ctx.strokeStyle = "#666";
	ctx.lineWidth = 1;
	ctx.setLineDash([16]);
	for (let i = 0; i <= test.wallDefinitions.x; i++) {
		let x = map(i, 0, test.wallDefinitions.x, 0, useWidth);
		ctx.moveTo(x, 0);
		ctx.lineTo(x, useHeight);
	}
	for (let i = 0; i <= test.wallDefinitions.y; i++) {
		let y = map(i, 0, test.wallDefinitions.y, 0, useHeight);
		ctx.moveTo(0, y);
		ctx.lineTo(useWidth, y);
	}
	ctx.stroke();

	/* draw the walls */
	ctx.beginPath();
	ctx.strokeStyle = "#e4ecef";
	ctx.setLineDash([]);
	ctx.lineWidth = 10;
	/* draw vertical walls */
	for (let i = 0; i < test.wallDefinitions.verticalWalls.length; i++) {
		for (let j = 0; j < test.wallDefinitions.verticalWalls[i].length; j++) {
			if (test.wallDefinitions.verticalWalls[i][j]) {
				let x = map(j, 0, test.wallDefinitions.x, 0, useWidth);
				let y = map(i, 0, test.wallDefinitions.y, 0, useHeight);
				ctx.moveTo(x, y);
				ctx.lineTo(x, y + map(1, 0, test.wallDefinitions.y, 0, useHeight));
			}
		}
	}
	/* draw horizontal walls */
	for (let i = 0; i < test.wallDefinitions.horizontalWalls.length; i++) {
		for (let j = 0; j < test.wallDefinitions.horizontalWalls[i].length; j++) {
			if (test.wallDefinitions.horizontalWalls[i][j]) {
				let x = map(j, 0, test.wallDefinitions.x, 0, useWidth);
				let y = map(i, 0, test.wallDefinitions.y, 0, useHeight);
				ctx.moveTo(x, y);
				ctx.lineTo(x + map(1, 0, test.wallDefinitions.x, 0, useWidth), y);
			}
		}
	}
	ctx.stroke();

	/* draw the solution path*/
	ctx.beginPath();
	ctx.setLineDash([]);
	let position = point(test.startingPosition);
	let positionX = map(position.x + 0.5, 0, test.wallDefinitions.x, 0, useWidth);
	let positionY = map(position.y + 0.5, 0, test.wallDefinitions.y, 0, useHeight);
	let x, y;
	ctx.moveTo(positionX, positionY);
	ctx.strokeStyle = "#4cec4f";
	ctx.lineWidth = 10;
	for (let i = 0; i < solution.length; i++) {
		/* split the solution into the direction and magnitude parts */
		let parts = solution[i].split(" ");
		parts[1] = parseInt(parts[1]);
		switch (parts[0]) {
			case "left":
				x = map(position.x - parts[1] + 0.5, 0, test.wallDefinitions.x, 0, useWidth);
				y = map(position.y + 0.5, 0, test.wallDefinitions.y, 0, useHeight);
				ctx.lineTo(x, y);
				position.x -= parts[1];
				break;
			case "up":
				x = map(position.x + 0.5, 0, test.wallDefinitions.x, 0, useWidth);
				y = map(position.y - parts[1] + 0.5, 0, test.wallDefinitions.y, 0, useHeight);
				ctx.lineTo(x, y);
				position.y -= parts[1];
				break;
			case "right":
				x = map(position.x + parts[1] + 0.5, 0, test.wallDefinitions.x, 0, useWidth);
				y = map(position.y + 0.5, 0, test.wallDefinitions.y, 0, useHeight);
				ctx.lineTo(x, y);
				position.x += parts[1];
				break;
			case "down":
				x = map(position.x + 0.5, 0, test.wallDefinitions.x, 0, useWidth);
				y = map(position.y + parts[1] + 0.5, 0, test.wallDefinitions.y, 0, useHeight);
				ctx.lineTo(x, y);
				position.y += parts[1];
				break;
		}
	}
	ctx.stroke();
	ctx.globalAlpha = 1;

	/* draw astronaut and end positions */
	ctx.drawImage(astronautImage, map(test.startingPosition.x, 0, test.wallDefinitions.x, 0, useWidth) + 10, map(test.startingPosition.y, 0, test.wallDefinitions.y, 0, useHeight) + 10 + Math.sin(offset / 2) * 4, 60, 60);
	ctx.drawImage(flagImage, map(test.endingPosition.x, 0, test.wallDefinitions.x, 0, useWidth) + 10, map(test.endingPosition.y, 0, test.wallDefinitions.y, 0, useHeight) + 10 + Math.cos(offset / 2) * 4, 60, 60);
	ctx.beginPath();
	/* draw the place where the walls will be placed based on where the mouse is */
	ctx.fillStyle = "#f00";
	ctx.strokeStyle = "#f00";
	ctx.setLineDash([16]);
	/* determine if the wall is horizontal or vertical*/
	if (document.getElementById("x-walls").checked) {
		let x = map(mouse.xArr, 0, test.wallDefinitions.x, 0, useWidth);
		let y = map(mouse.yArr, 0, test.wallDefinitions.y, 0, useHeight);
		ctx.moveTo(x, y);
		ctx.lineTo(x + map(1, 0, test.wallDefinitions.x, 0, useWidth), y);
	} else {
		let x = map(mouse.xArr, 0, test.wallDefinitions.x, 0, useWidth);
		let y = map(mouse.yArr, 0, test.wallDefinitions.y, 0, useHeight);
		ctx.moveTo(x, y);
		ctx.lineTo(x, y + map(1, 0, test.wallDefinitions.y, 0, useHeight));
	}
	ctx.stroke();

	if (document.getElementById("solve-automatically").checked) {
		solution = solveInertia(test.wallDefinitions, test.startingPosition, test.endingPosition);
		document.getElementById("solution-move-count").textContent = "Minimum move count: " + solution.length;
		document.getElementById("solution-moves").textContent = "Solution moves: " + solution;
	}
	requestAnimationFrame(animate);
}
/* default starting case*/
let test = CUSTOM_CASE(0, 0, 4, 4, 5, 5);
animate();