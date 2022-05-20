/* the render class handles the rendering of gameobjects */
class Application {
	constructor(canvasId, options = new DefaultOptions()) {
		this.renderer = new Renderer(canvasId);
		this.renderer.pixelsPerUnit = options.pixelsPerUnit;
		/* create managers */
		this.sceneManager = new SceneManager();
		/* create inputs */
		this.inputs = new Inputs(canvasId, "body");
		/* create physics */
		this.physics = new PotatoPhysicsEngine(options.physicsEngineWidth, options.physicsEngineHeight, options.physicsIterations);
		/* set physics to the base size */
		this.physics.gridSize(options.physicsGridSize);
		this.physics.errorCorrectionCoefficient = options.physicsErrorCorrection;
		this.physics.globalGravity.y = options.globalGravity;

		this.isRunning = false;
		this.options = options;

		/* empty default function */
		this.initFunction = function() {};

		/* debugging stuff */
		this.showCPUTimeBreakdown = false;
		this.sceneTime = 0;
		this.physicsTime = 0;
		this.renderTime = 0;
	}
	applyOptions(options) {
		this.renderer.pixelsPerUnit = options.pixelsPerUnit;
		this.physics.resizeBounds(options.physicsEngineWidth, options.physicsEngineHeight);
		this.physics.iterations = options.physicsIterations;
		this.physics.gridSize(options.physicsGridSize);
		this.physics.errorCorrectionCoefficient = options.physicsErrorCorrection;
		this.physics.globalGravity.y = options.globalGravity;
	}
	onInit(func) {
		this.initFunction = func;
	}
	update() {
		/* update the scene run through all gameobject behaviours */
		if (this.sceneManager.activeScene) {
			let activeScene = this.sceneManager.getActiveScene();
			let now = window.performance.now();
			activeScene.update();
			this.sceneTime = window.performance.now() - now;
			/* step physics */
			now = window.performance.now()
			this.physics.step(activeScene.objects);
			this.physicsTime = window.performance.now() - now;
			/* run late updates which are after physics*/
			activeScene.lateUpdate();
		}
	}
	renderCPUTimeBreakdown() {
		this.renderer.ctx.fillText(`updating scene: ${Math.round((this.sceneTime) * 100) / 100}ms`, 10, 30);
		this.renderer.ctx.fillText(`physics engine: ${Math.round((this.renderTime) * 100) / 100}ms`, 10, 50);
		this.renderer.ctx.fillText(`rendering scene: ${Math.round((this.renderTime) * 100) / 100}ms`, 10, 70);
		this.renderer.ctx.fillText(`total time: ${Math.round((this.sceneTime + this.physicsTime + this.renderTime) * 100) / 100}ms`, 10, 90);
	}
	init() {
		/* empty managers */
		this.sceneManager = new SceneManager();
		/* destroy previous event listeners */
		this.inputs.destroy();
		/* initialise the inputs module */
		this.inputs.init();
		/* initialise application */
		this.initFunction();
		/* finally initialise the current scene */
		if (this.sceneManager.activeScene) {
			this.sceneManager.initialiseActiveScene();
		}
	}
	destroy() {
		/* stop the application */
		this.stop();
		/* destroy previous event listeners */
		this.inputs.destroy();
	}
	render(cameraOverride) {
		let now = window.performance.now();
		if (this.sceneManager.activeScene) {
			if (cameraOverride) {
				this.renderer.render(this.sceneManager.getActiveScene(), cameraOverride);
			} else if (this.sceneManager.getActiveScene().cameraManager.activeCamera) {
				this.renderer.render(this.sceneManager.getActiveScene(), this.sceneManager.getActiveScene().cameraManager.getActiveCamera());
			}
		}
		this.renderTime = window.performance.now() - now;
	}
	mainLoop() {
		if (this.isRunning) {
			this.update();
			this.render();
			if (this.showCPUTimeBreakdown) {
				this.renderCPUTimeBreakdown();
			}
			requestAnimationFrame(this.mainLoop.bind(this));
		}
	}
	start() {
		this.isRunning = true;
		this.mainLoop();
	}
	stop() {
		this.isRunning = false;
	}
		
}