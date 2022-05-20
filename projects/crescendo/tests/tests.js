new Suite("Utils tests", function() {
	it("maps a value from a given range into a new given range", function() {
		expect(Utils.map).withArguments(2, 0, 4, 0, 1).equals(0.5);
		expect(Utils.map).withArguments(0, 0, 4, 0, 1).equals(0);
		expect(Utils.map).withArguments(4, 0, 4, 0, 1).equals(1);
		/* extrapolation */
		expect(Utils.map).withArguments(6, 0, 3, 0, 2).equals(4);
		expect(Utils.map).withArguments(1.5, 0, 3, 0, Math.PI).equals(Math.PI / 2);
		expect(Utils.map).withArguments(Infinity, 0, 3, 0, 9).not.toBeFinite();
		expect(Utils.map).withArguments(3, 0, 3, 0, Infinity).not.toBeFinite();
	});
	it("returns the direction of a given starting and ending point in radians", function() {
		expect(Utils.direction).withArguments(0, 0, 0, 0).equals(0);
		expect(Utils.direction).withArguments(0, 0, 1, 0).equals(0);
		expect(Utils.direction).withArguments(0, 0, -1, 0).equals(Math.PI);
		expect(Utils.direction).withArguments(0, 0, 0, 1).equals(Math.PI / 2);
		expect(Utils.direction).withArguments(0, 0, 0, -1).equals(-Math.PI / 2);
		expect(Utils.direction).withArguments(0, 0, 1, 1).equals(Math.PI / 4);
		expect(Utils.direction).withArguments(10, 10, 11, 11).equals(Math.PI / 4);
		expect(Utils.direction).withArguments(0, 0, 0, Infinity).toBeFinite();
	});
	it("returns the euclidean distance between 2 points", function() {
		expect(Utils.dist).withArguments(0, 0, 0, 0).equals(0);
		/* classic 345 pythagorean triple */
		expect(Utils.dist).withArguments(0, 0, 3, 4).equals(5);
		/* another pythagorean triple */
		expect(Utils.dist).withArguments(0, 0, 7, 24).equals(25);
		/* just a line */
		expect(Utils.dist).withArguments(0, 0, 0, 9).equals(9);
		expect(Utils.dist).withArguments(2, 3, 5, 7).equals(5);
		/* missing arguments */
		expect(Utils.fastDist).withArguments(3, 5, 7).not.toBeNumber();
	});
	it("returns the euclidean distance squared between 2 points for increased performance", function() {
		/* classic 345 pythagorean triple */
		expect(Utils.fastDist).withArguments(0, 0, 3, 4).equals(25);
		expect(Utils.fastDist).withArguments(0, 0, 7, 24).equals(625);
		expect(Utils.fastDist).withArguments(2, 3, 5, 7).equals(25);
		/* missing arguments */
		expect(Utils.fastDist).withArguments(3, 5, 7).not.toBeNumber();
	});
	it("returns the euclidean distance squared between 2 points for increased performance", function() {
		/* classic 345 pythagorean triple */
		expect(Utils.fastDist).withArguments(0, 0, 3, 4).equals(25);
		expect(Utils.fastDist).withArguments(0, 0, 7, 24).equals(625);
		expect(Utils.fastDist).withArguments(2, 3, 5, 7).equals(25);
		/* missing arguments */
		expect(Utils.fastDist).withArguments(3, 5, 7).not.toBeNumber();
	});
	it("expects strings to be padded with characters", function() {
		expect(Utils.pad).withArguments("9", 4, "0").equals("9000");
		/* prepending */
		expect(Utils.pad).withArguments("9", 4, "0", true).equals("0009");
		/* padding with 1 argument number */
		expect(Utils.pad).withArguments(13, 4, "3").equals("1333");
		/* padding with 2 argument numbers */
		expect(Utils.pad).withArguments(15, 4, 4).equals("1544");
	});
	it("numbers out of range to be clamped to the min and max range", function() {
		expect(Utils.clampRange).withArguments(5, 2, 7).equals(5);
		expect(Utils.clampRange).withArguments(-3, 3, 5).equals(3);
		expect(Utils.clampRange).withArguments(12, 5, 9).equals(9);
	});
	it("converts camel case names to dash for use in the dom", function() {
		expect(Utils.camelCaseToDash).withArguments("javascript").toBe("javascript");
		expect(Utils.camelCaseToDash).withArguments("JavaScript").toBe("java-script");
		expect(Utils.camelCaseToDash).withArguments("javascriptScript").toBe("javascript-script");
		expect(Utils.camelCaseToDash).withArguments("thisIsAJavascriptScript").toBe("this-is-a-javascript-script");
		expect(Utils.camelCaseToDash).withArguments("AAAAAAAA").toBe("a-a-a-a-a-a-a-a");
		expect(Utils.camelCaseToDash).withArguments("AeAeAeAe").toBe("ae-ae-ae-ae");
	});
	it("converts dash names to camelCase for use in javascript", function() {
		expect(Utils.dashToCamelCase).withArguments("javascript").toBe("javascript");
		expect(Utils.dashToCamelCase).withArguments("java-script").toBe("javaScript");
		expect(Utils.dashToCamelCase).withArguments("this-is-a-javascript-script").toBe("thisIsAJavascriptScript");
	});
	it("always converts the first letter to a capital", function() {
		expect(Utils.capitaliseFirstLetter).withArguments("lamp").toBe("Lamp");
		expect(Utils.capitaliseFirstLetter).withArguments("this is a sentence containing lamp").toBe("This is a sentence containing lamp");
		expect(Utils.capitaliseFirstLetter).withArguments(" ").toBe(" ");
		expect(Utils.capitaliseFirstLetter).withArguments("").toError();
	});
	it("rounds a number to a given decimal places", function() {
		expect(Utils.roundDecimals).withArguments(100.343432).equals(100);
		expect(Utils.roundDecimals).withArguments(100.363432, 1).equals(100.4);
		expect(Utils.roundDecimals).withArguments(343.3930, 2).equals(343.39);
		expect(Utils.roundDecimals).withArguments(59802.2394209, 5).equals(59802.23942);
		expect(Utils.roundDecimals).withArguments(10.22, 8).equals(10.22);
		/* negative values cause place value rounding */
		expect(Utils.roundDecimals).withArguments(8208232.3, -3).equals(8208000);
		expect(Utils.roundDecimals).withArguments(8208232.3, -10).equals(0);
		/* since doubles only have 16 places of precision, anything higher should not be considered */
		expect(Utils.roundDecimals).withArguments(8208232.3, 1000).toBeNumber();
	});
});
new Suite("Vector tests", function() {
	it("creates a vector object from a given x and y", function() {
		expect(new Vector()).toBe({x: 0, y: 0});
		expect(new Vector().x).toBeDefined();
		expect(new Vector().x).toBeDefined();
		expect(new Vector(0, 10)).withArguments(0, 10).toBe({x: 0, y: 10});
		expect(new Vector(10)).withArguments(10).toBe({x: 10, y: 0});
	});
	it("creates a vector object from a given angle and magnitude", function() {
		expect(new VectorFromAngle(0, 1)).toBe({x: 1, y: 0});
		expect(new VectorFromAngle(Math.PI / 2, 1)).toBe({x: Math.cos(Math.PI / 2), y: 1});
		expect(new VectorFromAngle(Math.PI, 1)).toBe({x: -1, y: Math.sin(Math.PI)});
		expect(new VectorFromAngle(-Math.PI / 2, 1)).toBe({x: Math.cos(-Math.PI / 2), y: -1});
	});
	it("clones a vector and creates an exact copy", function() {
		expect(new Vector(3, 4).clone()).toBe({x: 3, y: 4});
		expect(new Vector(Infinity, 4).clone()).toBe({x: Infinity, y: 4});
		expect(new Vector(3, NaN).clone()).toBe({x: 3, y: NaN});
	});
	it("does addition on a vector", function() {
		let vect = new Vector(3, 4);
		vect.add(1, 2);
		expect(vect).toBe({x: 4, y: 6});
		vect = new Vector(3, 4);
		vect.add(-1, -2);
		expect(vect).toBe({x: 2, y: 2});
		vect = new Vector(3, 4);
		vect.add(0, 0);
		expect(vect).toBe({x: 3, y: 4});
	});
	it("does subtraction on a vector", function() {
		let vect = new Vector(3, 4);
		vect.subtract(1, 2);
		expect(vect).toBe({x: 2, y: 2});
		vect = new Vector(3, 4);
		vect.subtract(-1, -2);
		expect(vect).toBe({x: 4, y: 6});
		vect = new Vector(3, 4);
		vect.subtract(0, 0);
		expect(vect).toBe({x: 3, y: 4});
	});
	it("does multiplication on a vector", function() {
		let vect = new Vector(3, 4);
		vect.multiply(1, 2);
		expect(vect).toBe({x: 3, y: 8});
		vect = new Vector(3, 4);
		vect.multiply(-1, -2);
		expect(vect).toBe({x: -3, y: -8});
		vect = new Vector(3, 4);
		vect.multiply(0, 0);
		expect(vect).toBe({x: 0, y: 0});
	});
	it("does division on a vector", function() {
		let vect = new Vector(3, 4);
		vect.divide(1, 2);
		expect(vect).toBe({x: 3, y: 2});
		vect = new Vector(3, 4);
		vect.divide(-1, -2);
		expect(vect).toBe({x: -3, y: -2});
		vect = new Vector(3, 4);
		vect.divide(0, 0);
		expect(vect).toBe({x: Infinity, y: Infinity});
	});
	it("returns the angle of the vector relative to the positive-y axis", function() {
		expect((new Vector(0, 1)).angle()).equals(0);
		expect((new Vector(3, 4)).angle()).equals(0.6435011087932844);
		expect((new Vector(1, 1)).angle()).equals(Math.PI / 4);
	});
	it("returns the euclidean length of the vector", function() {
		expect((new Vector(3, 4)).len()).equals(5);
		expect((new Vector(5, 12)).len()).equals(13);
		expect((new Vector(0, 2)).len()).equals(2);
		expect((new Vector(5, 0)).len()).equals(5);
		expect((new Vector(-1, -1)).len()).equals(Math.SQRT2);
	});
});
new Suite("Compiler tests", function() {
	it("generates valid javascript identifiers from a given string", function() {
		expect(Compiler.createValidJavascriptIdentifier, Compiler).withArguments("document").toBe("document");
		expect(Compiler.createValidJavascriptIdentifier, Compiler).withArguments("a space separated string").toBe("a_space_separated_string");
		expect(Compiler.createValidJavascriptIdentifier, Compiler).withArguments("String 12 with 49 numbers").toBe("String_12_with_49_numbers");
		expect(Compiler.createValidJavascriptIdentifier, Compiler).withArguments("123").not.toBe("123");
		expect(Compiler.createValidJavascriptIdentifier, Compiler).withArguments("removes_invalid./'-characters").toBe("removes_invalid_characters");
		expect(Compiler.createValidJavascriptIdentifier, Compiler).withArguments("$jquery-example").toBe("$jqueryexample");
	})
});
new Suite("Physics tests", function() {
	let physics = new PotatoPhysicsEngine();
	it("determine what the closest edge of a rectangle given a point", function() {
		expect(physics.getClosestEdge).withArguments(100, 0, 0, 0, 50, 50).toBe("right");
		expect(physics.getClosestEdge).withArguments(-100, 0, 0, 0, 50, 50).toBe("left");
		expect(physics.getClosestEdge).withArguments(0, 100, 0, 0, 50, 50).toBe("bottom");
		expect(physics.getClosestEdge).withArguments(0, -100, 0, 0, 50, 50).toBe("top");
	});
	it("determines if a circle and rectangle is colliding", function() {
		expect(physics.isCircleRectColliding, physics).withArguments(100, 0, 30, 0, 0, 50).toBe(false);
		expect(physics.isCircleRectColliding, physics).withArguments(30, 0, 30, 0, 0, 50).toBe(true);
	});
	it("determines if a line and circle is colliding", function() {
		expect(physics.isLineCircleColliding, physics).withArguments(0, 0, 100, 0, 50, 0, 20).toBe(true);
		expect(physics.isLineCircleColliding, physics).withArguments(0, 0, 100, 0, 50, 40, 20).toBe(false);
	});
	it("determines the closest point given a line and point", function() {
		expect(physics.getClosestPoint).withArguments(0, 0, 100, 100, 50, 0).toBe({x: 25, y: 25});
	});
	it("determines if a point and circle is colliding", function() {
		expect(physics.isPointCircleColliding, physics).withArguments(50, 50, 0, 0, 100).toBe(true);
		expect(physics.isPointCircleColliding, physics).withArguments(500, 50, 0, 0, 100).toBe(false);
	});
	it("determines if a point and line is colliding", function() {
		expect(physics.isLinePointColliding).withArguments(0, 100, 0, 0, 0, 50).toBe(true);
		expect(physics.isLinePointColliding).withArguments(0, 100, 0, 0, 50, 50).toBe(false);
	});
	it("generates the edge line for a given edge and width height x y", function() {
		expect(physics.generateEdgeLine, physics).withArguments("left", 0, 0, 100, 100).toBe({x1: -50, y1: -50, x2: -50, y2: 50});
		expect(physics.generateEdgeLine, physics).withArguments("right", 0, 0, 100, 100).toBe({x1: 50, y1: -50, x2: 50, y2: 50});
		expect(physics.generateEdgeLine, physics).withArguments("top", 0, 0, 100, 100).toBe({x1: -50, y1: -50, x2: 50, y2: -50});
		expect(physics.generateEdgeLine, physics).withArguments("bottom", 0, 0, 100, 100).toBe({x1: -50, y1: 50, x2: 50, y2: 50});

		expect(physics.generateEdgeLine, physics).withArguments("left", 0, 0, 50, 100).toBe({x1: -25, y1: -50, x2: -25, y2: 50});
		expect(physics.generateEdgeLine, physics).withArguments("right", 0, 0, 50, 100).toBe({x1: 25, y1: -50, x2: 25, y2: 50});
		expect(physics.generateEdgeLine, physics).withArguments("top", 0, 0, 50, 100).toBe({x1: -25, y1: -50, x2: 25, y2: -50});
		expect(physics.generateEdgeLine, physics).withArguments("bottom", 0, 0, 50, 100).toBe({x1: -25, y1: 50, x2: 25, y2: 50});
	});
	it("from a given side generates the normal angle", function() {
		expect(physics.squareCollisionAngle).withArguments("left").equals(0);
		expect(physics.squareCollisionAngle).withArguments("right").equals(Math.PI);
		expect(physics.squareCollisionAngle).withArguments("top").equals(Math.PI / 2);
		expect(physics.squareCollisionAngle).withArguments("bottom").equals(-Math.PI / 2);
	});
});
new Suite("Templates tests", function() {
	it("generates the required html for a compiled application", function() {
		expect(Templates.html).withArguments("Example project", ["example-script.js", "library-script.js"]).toBe(`<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>Example project</title>
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
	<script src="./src/scripts/example-script.js"></script><script src="./src/scripts/library-script.js"></script>
	<script src="./main.js"></script>
</body>
</html>`);
		expect(Templates.html).withArguments("", []).toBe(`<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title></title>
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
\t
	<script src="./main.js"></script>
</body>
</html>`);
		expect(Templates.html).withArguments().toBe(`<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>undefined</title>
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
	
	<script src="./main.js"></script>
</body>
</html>`);
	});
});
new Suite("Multiline text tests", function() {
	let c = document.createElement("canvas");
	c.id = "n";
	c.style.display = "none";
	document.querySelector("body").appendChild(c);
	let renderer = new Renderer("n");
	it("splits a long sentence of text into arrays of text lines up to a given width", function() {
		expect(renderer.multilineTextSplitBySpace, renderer).withArguments("a short sentence", 200).toBe(["a short sentence"]);
		expect(renderer.multilineTextSplitBySpace, renderer).withArguments("a long sentence that is gauranteed to be in multiple lines", 200).toBe(["a long sentence that is gauranteed to be in"," multiple lines"]);
		expect(renderer.multilineTextSplitBySpace, renderer).withArguments("a long sentence that is gauranteed to be in multiple lines", 100).toBe(["a long sentence that"," is gauranteed to be in"," multiple lines"]);
		expect(renderer.multilineTextSplitBySpace, renderer).withArguments("a   sentence   with   lots    of   spaces   ", 200).toBe(["a   sentence   with   lots    of   spaces   "]);
		expect(renderer.multilineTextSplitBySpace, renderer).withArguments(`a sentence
with many
new lines

that affect the way the sentence is generated`, 200).toBe(["a sentence","with many","new lines","","that affect the way the sentence is generated"]);
		expect(renderer.multilineTextSplitBySpace, renderer).withArguments(`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque sollicitudin sagittis ligula, id facilisis orci malesuada vitae. Morbi aliquet ante fringilla, gravida dolor eget, molestie urna. Nam ultricies egestas arcu, eleifend interdum diam scelerisque ac. Quisque non ultrices ipsum. Aenean convallis id tortor ac sodales. Interdum et malesuada fames ac ante ipsum primis in faucibus. Sed condimentum varius lectus non auctor. Sed et elit ornare, maximus elit quis, condimentum nunc. Sed id urna eget justo lacinia euismod. Curabitur aliquam placerat nulla nec consectetur. Nulla ut placerat odio, id rhoncus justo. Sed sapien felis, malesuada non fringilla quis, ultricies ut nibh. Mauris a molestie tortor. In quis nunc id odio sagittis molestie. In urna purus, suscipit vitae auctor mollis, fermentum sit amet nulla. Phasellus consequat ex dolor, non convallis nibh aliquam eget. Suspendisse rutrum mauris nec varius varius. In ullamcorper odio vel eros efficitur, ac convallis neque semper. Morbi lobortis odio est, vel aliquet purus sodales sit amet. Phasellus in elit eget lacus interdum pretium. Quisque vel risus hendrerit, tincidunt felis eu, sagittis ante. Ut eleifend tristique libero vel sodales. In consequat eros eu scelerisque efficitur. Sed nec nisi felis. In rutrum mi at eleifend ultricies. Aenean convallis diam semper tempus auctor. Aliquam vulputate nec metus non tempus. Aenean tincidunt est eget mauris dapibus, nec egestas sem pharetra.`, 500).toBe(["Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque sollicitudin sagittis ligula, id facilisis orci"," malesuada vitae. Morbi aliquet ante fringilla, gravida dolor eget, molestie urna. Nam ultricies egestas arcu,"," eleifend interdum diam scelerisque ac. Quisque non ultrices ipsum. Aenean convallis id tortor ac sodales."," Interdum et malesuada fames ac ante ipsum primis in faucibus. Sed condimentum varius lectus non auctor. Sed"," et elit ornare, maximus elit quis, condimentum nunc. Sed id urna eget justo lacinia euismod. Curabitur aliquam"," placerat nulla nec consectetur. Nulla ut placerat odio, id rhoncus justo. Sed sapien felis, malesuada non fringilla"," quis, ultricies ut nibh. Mauris a molestie tortor. In quis nunc id odio sagittis molestie. In urna purus, suscipit vitae"," auctor mollis, fermentum sit amet nulla. Phasellus consequat ex dolor, non convallis nibh aliquam eget."," Suspendisse rutrum mauris nec varius varius. In ullamcorper odio vel eros efficitur, ac convallis neque semper."," Morbi lobortis odio est, vel aliquet purus sodales sit amet. Phasellus in elit eget lacus interdum pretium. Quisque"," vel risus hendrerit, tincidunt felis eu, sagittis ante. Ut eleifend tristique libero vel sodales. In consequat eros eu"," scelerisque efficitur. Sed nec nisi felis. In rutrum mi at eleifend ultricies. Aenean convallis diam semper tempus"," auctor. Aliquam vulputate nec metus non tempus. Aenean tincidunt est eget mauris dapibus, nec egestas sem"," pharetra."]);
	});
});
new Suite("VirtualFileSystem tests", function() {
	// setup vfs
	vfs = new VirtualFileSystem();
	vfs.addFile(new VirtualFile("index.js", "example data", "text/javascript"));
	vfs.addFile(new VirtualFile("index.html", "example data", "text/html"));
	vfs.addFile(new VirtualFile("index.css", "example data", "text/css"));
	let folder = new VirtualFolder("src");
	folder.addFile(new VirtualFile("audio.wav", "example data", "image/png"));
	folder.addFile(new VirtualFile("audios.aac", "example data", "image/gif"));
	folder.addFile(new VirtualFile("audio.mp3", "example data", "image/jpg"));
	let subFolder = new VirtualFolder("images");
	subFolder.addFile(new VirtualFile("image.png", "example data", "image/png"));
	subFolder.addFile(new VirtualFile("image.jpg", "example data", "image/jpg"));
	subFolder.addFile(new VirtualFile("image.gif", "example data", "image/gif"));
	folder.addFile(subFolder);
	vfs.addFile(folder);
	it("gets files given a path", function() {
		expect(vfs.get, vfs).withArguments("index.js").toBe({
			name: "index.js",
			data: "example data",
			type: "text/javascript",
		});
		expect(vfs.get, vfs).withArguments("index.html").toBe({
			name: "index.html",
			data: "example data",
			type: "text/html",
		});
		expect(vfs.get, vfs).withArguments("src/audio.wav").toBe({
			name: "audio.wav",
			data: "example data",
			type: "image/png",
		});
		expect(vfs.get, vfs).withArguments("src/images/image.gif").toBe({
			name: "image.gif",
			data: "example data",
			type: "image/gif",
		});
		expect(vfs.get, vfs).withArguments("src/images/images.gif").toBe(null);
		expect(vfs.get, vfs).withArguments("src/images/pog/images.gif").toBe(null);
	})
});
new Suite("Bounding box tests", function() {
	let c = document.createElement("canvas");
	c.id = "n2";
	c.style.display = "none";
	document.querySelector("body").appendChild(c);
	let renderer = new Renderer("n2");
	it("calculate the diameteric dimensions for the axis aligned bounding box of a rotated rectangular object", function() {
		expect(renderer.calculateRectangleAxisAlignedBoundingBox, renderer).withArguments(50, 50, 0).toBe({x: 50, y: 50});
		expect(renderer.calculateRectangleAxisAlignedBoundingBox, renderer).withArguments(50, 50, Math.PI / 2).toBe({x: 50, y: 50});
		expect(renderer.calculateRectangleAxisAlignedBoundingBox, renderer).withArguments(50, 50, Math.PI / 4).toBe({x: Math.sqrt(5000), y: Math.sqrt(5000)});
		expect(renderer.calculateRectangleAxisAlignedBoundingBox, renderer).withArguments(100, 200, Math.PI / 4).toBe({x: Math.sqrt(45000), y: Math.sqrt(45000)});
	});
	it("calculate the diameteric dimensions for the axis aligned bounding box of a rotated elliptical object", function() {
		expect(renderer.calculateOvalAxisAlignedBoundingBox, renderer).withArguments(50, 50, 0).toBe({x: 50, y: 50});
		expect(renderer.calculateOvalAxisAlignedBoundingBox, renderer).withArguments(50, 50, Math.PI / 2).toBe({x: 50, y: 50});
		expect(renderer.calculateOvalAxisAlignedBoundingBox, renderer).withArguments(50, 50, Math.PI / 4).toBe({x: 50, y: 50});
	});
});