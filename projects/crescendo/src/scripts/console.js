(function() {
	"use strict";
	/* replace the console functions so that they also write to the application */
	console.trueLog = console.log;
	console.trueWarn = console.warn;
	console.trueError = console.error;

	function generateMessage(type, message) {
		let element = document.getElementById("editor-console-cursor");
		/* append the message to the gui console */
		element.innerHTML = `<div class="console-message theme-${type}"><img class="console-image" src="./src/images/${type}.png">${message}</div>${element.innerHTML}`;
	}
	/* replacement functions */
	console.log = function(message) {
		generateMessage("info", message);
		console.trueLog(message);
	};
	console.warn = function(message) {
		generateMessage("warning", message);
		console.trueWarn(message);
	};
	console.error = function(message) {
		generateMessage("error", message);
		console.trueError(message);
	};
	console.success = function(message) {
		generateMessage("success", message);
		console.trueLog(message);
	};
})();