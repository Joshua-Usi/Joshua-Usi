self.addEventListener("message", function(event) {
	// let words = event.data.split(" ");
	// let message = `I am worker ${words[3]}`;
 	self.postMessage([
 		[0, 0, 0, 0],
 		[0, 0, 0, 0],
 		[0, 0, 0, 0],
 		[0, 0, 0, 0],
 	]);
});