/* a class containing all crescendo defined components */
const Components = (function() {
	"use strict";
	let currentZIndex = 0;
	/* the base parent class for components */
	class Component {
		constructor(name) {
			this.name = name;
			this.parent = null;
		}
	}
	/* base class for renderer type components */
	class BaseRenderer extends Component {
		/* default fill and stroke colours */
		constructor(id, fillColour = "#cfe2f3", strokeColour = "#171717") {
			super(id);
			this.fillColour = fillColour;
			this.strokeColour = strokeColour;
			/* value between [0, 1] */
			this.opacity = 1;
			/*	zIndex tells the rendering engine what order the elements are to be rendered in 
			 *	it uses a variable automatically give each meshRenderer a unique value
			 */
			this.zIndex = currentZIndex;
			currentZIndex++;
		}
		/* set fill to fully transparent */
		noFill() {
			this.fillColour = "#0000";
		}
		/* set fill to fully transparent */
		noStroke() {
			this.strokeColour = "#0000";
		}
		/* parameters are to be given within the range [0, 255] */
		setFillRGBA(red, green, blue, alpha) {
			/* alpha is an optional parameter, it defaults to 255 */
			if (alpha === undefined) {
				alpha = 255;
			}
			/* then convert to hexadecimal */
			let redHex = red.toString(16);
			let greenHex = green.toString(16);
			let blueHex = blue.toString(16);
			let alphaHex = alpha.toString(16);
			this.fillColour = `#${redHex}${greenHex}${blueHex}${alphaHex})`;
		}
		setFillHex(hex) {
			this.fillColour = hex;
		}
		/* parameters are to be given within the range [0, 255] */
		setStrokeRGBA(red, green, blue, alpha) {
			/* alpha is an optional parameter, it defaults to 255 */
			if (alpha === undefined) {
				alpha = 255;
			}
			/* then convert to hexadecimal */
			let redHex = red.toString(16);
			let greenHex = green.toString(16);
			let blueHex = blue.toString(16);
			let alphaHex = alpha.toString(16);
			this.strokeColour = `#${redHex}${greenHex}${blueHex}${alphaHex})`;
		}
		setStrokeHex(hex) {
			this.strokeColour = hex;
		}
		getFillRGBAValues() {
			let colour = this.fillColour;
			/* extract each value from the rgb and convert to decimal */
			let red = parseInt(colour.substring(1, 3), 16);
			let green = parseInt(colour.substring(3, 5), 16);
			let blue = parseInt(colour.substring(5, 7), 16);
			let alpha = null;
			/* hex code without alpha, defaults to 255 */
			if (colour.length === 7) {
				alpha = 255;
			} else if (colour.length === 9) {
				alpha = parseInt(colour.substring(7, 9), 16);
			} else {
				/* throw an warning if an unsupported hex is used */
				console.warn(`Malformed hexadecimal colour: ${colour}`);
			}
			/* return a colour object that contains the values for the red, green, blue and alpha channels */
			return new Utils(red, green, blue, alpha);
		}
		getStrokeRGBAValues() {
			let colour = this.strokeColour;
			/* extract each value from the rgb and convert to decimal */
			let red = parseInt(colour.substring(1, 3), 16);
			let green = parseInt(colour.substring(3, 5), 16);
			let blue = parseInt(colour.substring(5, 7), 16);
			let alpha = null;
			/* hex code without alpha, defaults to 255 */
			if (colour.length === 7) {
				alpha = 255;
			} else if (colour.length === 9) {
				alpha = parseInt(colour.substring(7, 9), 16);
			} else {
				/* throw an warning if an unsupported hex is used */
				console.warn(`Malformed hexadecimal colour: ${colour}`);
			}
			/* return a colour object that contains the values for the red, green, blue and alpha channels */
			return new Utils(red, green, blue, alpha);
		}
		setOpacity(a) {
			this.opacity = a;
		}
	}
	/*	
	 *	an extension of the component class, transform defines:
	 *	where the object is rendered (x, y) in pixels
	 *	the rotation of the object (in radians, clockwise and 0 is facing up)
	 *	the scales of the object (x, y) in pixels
	 */
	class Transform extends Component {
		/* default values if not defined */
		constructor(x = 0, y = 0, rotation = 0, scaleX = 50, scaleY = 50) {
			super("transform");
			/* position of objects, from the center of the object */
			this.x = x;
			this.y = y;
			/* useful for elements that want to be always kept on screen such as UI */
			this.fixedOnScreen = false;
			/* rotation, positive is clockwise, in radians, 0 is facing up */
			this.rotation = rotation;
			/* scale of objects, used for rendering, typical objects are rendered at -0.5 to 0.5 pixels, making them 1 pixel wide */
			this.scaleX = scaleX;
			this.scaleY = scaleY;
		}
		/* position fixing means the element is independant of the camera transform and will appears relative to the center of the canvas*/
		fixPosition() {
			this.fixedOnScreen = true;
		}
		unfixPosition() {
			this.fixedOnScreen = false;
		}
		/* moves forwards a number of units depending on the direction of the transform*/
		forward(units) {
			this.x += Math.cos(this.rotation) * units;
			this.y += Math.sin(this.rotation) * units;
		}
		backward(units) {
			this.x -= Math.cos(this.rotation) * units;
			this.y -= Math.sin(this.rotation) * units;
		}
		up(units) {
			this.y -= units;
		}
		down(units) {
			this.y += units;
		}
		left(units) {
			this.x -= units;
		}
		right(units) {
			this.x += units;
		}
		setPosition(x, y) {
			this.x = x;
			this.y = y;
		}
		setScale(x, y) {
			this.scaleX = x;
			this.scaleY = y;
		}
		setRotation(radians) {
			this.rotation = radians;
		}
		/* for users who do not know radians, a method is provided in order convert the degrees given to radians and vice versa */
		setRotationDegrees(degrees) {
			this.rotation = degrees * (180 / Math.PI);
		}
		getRotationDegrees() {
			return this.rotation * (Math.PI / 180);
		}
		/* points towards a position */
		pointTowards(x, y) {
			this.rotation = Utils.direction(this.x, this.y, x, y);
		}
	}
	/* the mesh renderer defines how the object is rendered */
	class MeshRenderer extends BaseRenderer {
		/* default values if not defined */
		constructor(shape = "circle", fillColour, strokeColour) {
			super("renderer", fillColour, strokeColour);
			this.type = "mesh";
			/* default mesh renderer is a circle, it can be either circle or rectangle */
			this.shape = shape;
			this.texture = null;
			this.texturePath = null;
			/* customisable data values used to stretch or shrink overfitting or underfitting textures */
			this.textureScaleX = 1;
			this.textureScaleY = 1;
			/* width of the object stroke in pixels */
			this.strokeWidth = 1;
		}
		setTextureScale(x, y) {
			this.textureScaleX = x;
			this.textureScaleY = y;
		}
		setTexture(imagePath) {
			this.texturePath = imagePath;
			this.texture = FileManager.getImage(imagePath);
		}
	}
	/* the text renderer defines how the text is rendered */
	class TextRenderer extends BaseRenderer {
		constructor(text = "Sample Text", fillColour, strokeColour) {
			super("renderer", fillColour, strokeColour);
			this.type = "text";
			/* default text, serves as a reminder to the user to change it */
			this.text = text;
			/* normal or italic */
			this.style = "normal";
			/* either normal or small-caps */
			this.variant = "normal";
			/* can take on values
			 *	between 100 and 900 in steps of 100
			 *
			 *	or words such as
			 *
			 *	lighter
			 *	normal
			 *	bold
			 *	bolder
			 *
			 * words are only avaliable in the gui
			 */
			this.weight = "normal";
			/* default font, is also web-safe */
			/* 
			 *	list of websafe fonts
			 *	Arial (sans-serif)
			 *	Verdana (sans-serif)
			 *	Helvetica (sans-serif)
			 *	Tahoma (sans-serif)
			 *	Trebuchet MS (sans-serif)
			 *	Times New Roman (serif)
			 *	Georgia (serif)
			 *	Garamond (serif)
			 *	Courier New (monospace)
			 *	Brush Script MT (cursive)
			 */
			/* 
			 *	list of accessible fonts via the GUI
			 *	Arial (sans-serif)
			 *	Verdana (sans-serif)
			 *	Helvetica (sans-serif)
			 *	Times New Roman (serif)
			 *	Courier New (monospace)
			 */
			this.font = "Arial";
			/* height of the font in units (usually pixels as the base unit is 1 unit = 1 pixel) */
			this.size = 16;
			/*	alignment can take on the values
			 *	left
			 *	center
			 *	right
			 */
			this.alignment = "left";
			/* overwrite default fill colour */
			this.fillColour = "#171717";
		}
		setProperties(style, variant, weight, size, font, alignment) {
			this.style = style;
			this.variant = variant;
			this.weight = weight;
			this.size = size;
			this.font = font;
			this.alignment = alignment;
		}
		setText(text) {
			this.text = text;
		}
	}
	class LineRenderer extends BaseRenderer {
		constructor(fillColour, strokeColour) {
			super("renderer", fillColour, strokeColour);
			this.type = "line";
			this.strokeWidth = 1;
			/* 
			 *	default butt, but choice between
			 *	"butt": ends of lines are squared off
			 *	"square": like butt, but added half the stroke widthes length
			 *	"round": ends of lines are rounded
			 */
			this.lineCap = "butt";
			/*
			 *	default miter but choice between
			 *	"miter": sharp corners
			 *	"round": rounded corners
			 *	"bevel": square corners
			 */
			this.lineJoin = "miter";
			this.fill = false;
		}
		setProperties(strokeWidth, lineCap, lineJoin, fill) {
			this.strokeWidth = strokeWidth;
			this.lineCap = lineCap;
			this.lineJoin = lineJoin;
			this.fill = fill;
		}
	}
	/* background renderers are only used by scenes */
	class BackgroundRenderer extends Component {
		constructor() {
			super("renderer");
			this.type = "background";
			/* default background colour, matches the theme colour background-variant-3 */
			this.colour = "#656565";
			this.texture = null;
			this.textureScaleX = 1;
			this.textureScaleY = 1;
			this.offsetX = 0;
			this.offsetY = 0;
			this.tile = false;
		}
		setTextureScale(x, y) {
			this.textureScaleX = x;
			this.textureScaleY = y;
		}
		setTexture(image) {
			this.texture = image;
		}
	}
	/* 
	 *	rigidbodies are used by the physics engine, compatible with the physics engine 
	 *	they are coupled to transforms (rigidbodies affect transforms and transforms affect rigidbodies)
	 */
	class BaseRigidbody extends Component {
		constructor(velX = 0, velY = 0, accX = 0, accY = 0, density = 1, restitution = 0.7, isColliding = true, isStatic = false) {
			super("rigidbody");
			this.velocityX = velX;
			this.velocityY = velY;
			this.accelerationX = accX;
			this.accelerationY = accY;
			/* used instead of mass */
			this.density = density;
			/*	value in the range [0, 1] where
			 *	0 is no bounciness (all energy is lost)
			 *	and 1 is no energy loss (ball usually bounces forever)
			 */
			this.restitution = restitution;
			this.isColliding = isColliding;
			this.isStatic = isStatic;
		}
	}
	class CircleRigidbody extends BaseRigidbody {
		constructor(velX, velY, accX, accY, density, restitution, isColliding, isStatic) {
			super(velX, velY, accX, accY, density, restitution, isColliding, isStatic);
			this.type = "circle";
		}
	}
	class RectangleRigidbody extends BaseRigidbody {
		constructor(velX, velY, accX, accY, density, restitution, isColliding, isStatic) {
			super(velX, velY, accX, accY, density, restitution, isColliding, isStatic);
			this.type = "rectangle";
			this.surfaceFriction = 0.99;
		}
	}
	class LineRigidbody extends Component {
		constructor() {
			super("rigidbody");
			this.type = "line";
			this.surfaceFriction = 0.99;
		}
	}
	class BehaviourString extends Component {
		constructor(string = Templates.behaviourDefault) {
			super("behaviour-script");
			/* one can give it a function, however it will stringify it */
			if (typeof(string) === "function") {
				string = string.toString();
			}
			this.script = string;
		}
		parse(parentObject) {
			/* eval-like which could be unsafe, but is ok since it is just a client side program */
			let l = new Function("return " + this.script);
			/* calls a function that returns a class and then instantiates said class and returns it */
			return new (l())(parentObject);
		}
	}
	/* like DOM event listeners, behaviours can have multiple functions for the same event */
	class Behaviour extends Component {
		constructor(gameObject) {
			super("behaviour");
			this.listeners = {};
			this.parent = gameObject;
		}
		addEvent(eventName, callback) {
			/* if the event does not exist yet, then initialise with an empty array */
			if (this.listeners.hasOwnProperty(eventName) === false) {
				this.listeners[eventName] = [];
			}
			this.listeners[eventName].push(callback);
		}
		getEvents(eventName) {
			if (this.listeners.hasOwnProperty(eventName)) {
				return this.listeners[eventName];
			}
			/* if it doesnt exist, it means the event listener does not exist yet*/
			return [];
		}
		deleteListeners(eventName) {
			this.listeners[eventName] = [];
		}
		runEvent(eventName) {
			/* first check if the event listener group exists */
			if (this.listeners.hasOwnProperty(eventName)) {
				/* loop over all relevant event listeners and run the event */
				for (let i = 0; i < this.listeners[eventName].length; i++) {
					/* use call instead of typical function calls to set this value */
					this.listeners[eventName][i].call(this);
				}
			}
		}
	}
	class Line extends Component {
		constructor(points = [new Vector(-50, 0), new Vector(50, 0)], connectEnds = false) {
			super("line");
			/* array of Vectors, take note the points are positioned relative to the attached transform*/
			this.points = points;
			/* if true, will consider the line between the beginning and end points for renderering and physics */
			this.connectEnds = connectEnds;
		}
		/* return the euclidean distance between the beginning and end points of the line */
		totalLength() {
			let total = 0;
			for (let i = 0; i < this.points.length - 1; i++) {
				total += Utils.dist(this.points[i].x, this.points[i].y, this.points[i + 1].x, this.points[i + 1].y);
			}
			/* if the line is expected to connect ends, then consider it */
			if (this.connectEnds) {
				total += Utils.dist(this.points[0].x, this.points[0].y, this.points[this.points.length - 1].x, this.points[this.points.length - 1].y);
			}
			return total;
		}
		getLastPoint() {
			return this.getPoint(this.points.length - 1);
		}
		getPoint(index) {
			return this.points[index];
		}
		addPoint(point) {
			if (point instanceof Vector) {
				this.points.push(point);
			} else {
				throw new Error(`UserError: provided point must be of class vector, instead saw ${typeof point}`);
			}
		}
		addPointAtIndex(point, index) {
			this.points.splice(index, 0, point);
		}
		removePoint(index) {
			/* should error if index is greater than the length of points or negative, that is intentional behaviour */
			this.points.splice(index, 1);
		}
	}
	/* if enough time add audio*/
	// class AudioListener extends Component {
	// 	constructor() {
	// 		super("audio-source");
	// 		/* range between 0 and 1 */
	// 		this.masterVolume = 1;
	// 	}
	// }
	// class AudioSource extends Component {
	// 	constructor(id) {
	// 		super("audio-source");
	// 		this.source = null;
	// 		this.sourcePath = null;
	// 		this.id = id;
	// 		this.volume = 1;
	// 		this.loop = false;
	// 		/* defines if the sound should be quieter depending on how close it is */
	// 		this.doProximityAudio = false;
	// 		/* min distance before sound fading occurs */
	// 		this.proximityMin = 0;
	// 		/* max distance before no sound is heard */
	// 		this.proximityMax = 0;
	// 	}
	// 	setSource(audioPath) {
	// 		this.sourcePath = path;
	// 		this.source = FileManager.getaAudio(audioPath);
	// 	}
	// 	play() {
	// 		if (this.source) {
	// 			this.source.play();
	// 		} else {
	// 			console.warn("No source for audio-source component");
	// 		}
	// 	}
	// 	setProximity(min, max) {
	// 		this.proximityMin = min;
	// 		this.proximityMax = max;
	// 	}
	// 	volumeAtDistance(distance) {
	// 		if (this.doProximityAudio) {
	// 			/* rolloff is linear, which is not realistic compare to 1/r but thts ok */
	// 			return this.volume * Utils.map(Utils.clampRange(distance, this.proximityMin, this.proximityMax), this.proximityMin, this.proximityMax, 1, 0);
	// 		}
	// 		return this.volume;
	// 	}
	// }
	return {
		Component,
		BaseRenderer,
		Transform,
		MeshRenderer,
		BackgroundRenderer,
		TextRenderer,
		LineRenderer,
		BaseRigidbody,
		CircleRigidbody,
		RectangleRigidbody,
		LineRigidbody,
		BehaviourString,
		Behaviour,
		Line,
		// AudioListener,
		// AudioSource,
	};
})();