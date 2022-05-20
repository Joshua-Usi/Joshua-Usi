/* templates used throughout the engine */
const Templates = (function() {
	return {
		behaviourDefault: `class MyBehaviour extends Components.Behaviour {
	constructor(gameObject) {
		super(gameObject);
		/* useful variables */
		/* reference to the whole program */
		let Application = Program
		/* reference to the current Scene */
		let Scene = this.parent.attachedScene
		/* reference to Inputs class */
		let Inputs = Program.inputs; 
		/* reference to the current Game Object */
		let GameObject = this.parent;
		
		/* declare your variables here */

		/* called when the script is initiated */
		this.addEvent("init", function() {
			
		});

		/* called every frame */
		this.addEvent("update", function() {
			
		});
	}
}`,
		html: function(title, scriptNames) {
			if (scriptNames === undefined) {
				scriptNames = [];
			}
			let scriptTags = "";
			for (var i = 0; i < scriptNames.length; i++) {
				scriptTags += `<script src="./src/scripts/${scriptNames[i]}"></script>`;
			}
			return `<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>${title}</title>
	<style>
		body {
			margin: 0;
			overflow: hidden;
		}
		#editor-canvas-element {
			width: 100vw;
			height: 100vh;
		}
	</style>
</head>
<body id="body">
	<canvas id="editor-canvas-element"></canvas>
	${scriptTags}
	<script src="./main.js"></script>
</body>
</html>`;
		}
	};
})();