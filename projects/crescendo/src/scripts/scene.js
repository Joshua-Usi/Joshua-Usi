/* a scene can be considered as a stage */
class Scene {
	constructor(id) {
		/* unique identifier for getting and finding */
		this.id = id;
		this.objects = [];
		/* create managers */
		this.cameraManager = new CameraManager(this);
		this.behaviourManager = new BehaviourManager();
		this.background = new Components.BackgroundRenderer();

		this.initialised = false;
	}
	/* adds external components such as converting behaviour strings to behaviours */
	addExternalComponents(gameObject) {
		if (gameObject.hasComponent("behaviour-script")) {
			let behaviour = gameObject.getComponent("behaviour-script").parse(gameObject);
			gameObject.addComponent(behaviour);
			this.behaviourManager.addBehaviour(behaviour);
		}
	}
	/* removes external behaviours when they need to be destroyed */
	removeExternalComponents(gameObject) {
		if (gameObject.hasComponent("behaviour-script")) {
			this.behaviourManager.removeBehaviour(gameObject);
		}
	}
	/* adds a gameObject to the scene */
	addGameObject(gameObject) {
		gameObject.attachedScene = this;
		this.addExternalComponents(gameObject);
		this.objects.push(gameObject);
	}
	/* removes a gameObject from the scene*/
	removeGameObject(gameObject) {
		gameObject.attachedScene = null;
		/* remove attached behaviours */
		this.removeExternalComponents(gameObject);
		/* find the gameObject and splice it */
		for (let i = 0; i < this.objects.length; i++) {
			if (this.objects[i] === gameObject) {
				this.objects.splice(i, 1);
				break;
			}
		}
	}
	getGameObjectById(id) {
		let i = 0;
		/* linear search through all the game objects */
		while (i < this.objects.length) {
			if (this.objects[i].id === id) {
				return this.objects[i];
			}
			i++;
		}
		/* no element was found, return null */
		return null;
	}
	getGameObjectIndex(id) {
		let i = 0;
		/* linear search through all the game objects */
		while (i < this.objects.length) {
			if (this.objects[i].id === id) {
				return i;
			}
			i++;
		}
		/* no element was found, return null */
		return null;	
	}
	init() {
		this.initialised = true;
		/* load all behaviours */
		for (let i = 0; i < this.objects.length; i++) {
			this.addExternalComponents(this.objects[i]);
		}
		/* initialise all behaviours */
		this.behaviourManager.broadcastEvent("init");
	}
	update() {
		/* sort the objects by zIndex ascending to allow objects to be on top or below */
		this.objects.sort(function(a, b) {
			let aRenderDetails = a.getComponent("renderer");
			let bRenderDetails = b.getComponent("renderer");
			if (aRenderDetails && bRenderDetails) {
				return aRenderDetails.zIndex - bRenderDetails.zIndex;
			}
			/* objects without renderer's are last */
			return -Infinity;
		});
		/* run early update events */
		this.behaviourManager.broadcastEvent("update");
		this.cameraManager.update();
	}
	lateUpdate() {
		/* run late update events */
		this.behaviourManager.broadcastEvent("late-update");
	}
}