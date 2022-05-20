class CameraManager {
	constructor(sceneBackReference) {
		/* cameras are stored in hash-map based on their id's, which improves performance and in general makes searching easier */
		this.cameras = {};
		/* the identifier for the active camera, not a reference to the active camera itself */
		this.activeCamera = null;
		/* cameras can have behaviours too */
		this.behaviourManager = new BehaviourManager();
		this.sceneBackreference = sceneBackReference;
	}
	addExternalComponents(camera) {
		if (camera.hasComponent("behaviour-script")) {
			let behaviour = camera.getComponent("behaviour-script").parse(camera);
			camera.addComponent(behaviour);
			this.behaviourManager.addBehaviour(behaviour);
		}
	}
	removeExternalComponents(camera) {
		if (camera.hasComponent("behaviour-script")) {
			this.behaviourManager.removeBehaviour(camera);
		}
	}
	switchToCamera(id) {
		/* ensure the camera actually exists before switching */
		if (this.cameras[id]) {
			this.activeCamera = id;
			/* run the init phase when switched to */
			this.behaviourManager.broadcastEvent("init");
		} else {
			/* throw an error otherwise, intended behaviour */
			console.error(`camera with the ID "${id}" does not exist`);
		}
	}
	/* camera id's must be unique, otherwise they will be overwritten */
	addCamera(camera) {
		/* warn about camera overwrites, it is not critical but it can cause unintended behaviour */
		if (this.cameras[camera.id]) {
			console.warn(`camera with the ID "${camera.id}" already exists, it will be overwritten`);
		}
		camera.attachedScene = this.sceneBackreference;
		this.cameras[camera.id] = camera;
		this.addExternalComponents(camera);
	}
	removeCamera(id) {
		if (this.cameras[id]) {
			this.removeExternalComponents(this.cameras[id]);
			delete this.cameras[id];
		}
	}
	getCameraById(id) {
		if (this.cameras[id]) {
			return this.cameras[id];
		}
		return null;
	}
	getActiveCamera() {
		return this.cameras[this.activeCamera];
	}
	/* renames a camera (used in the gui) */
	renameCamera(currentId, newId) {
		this.cameras[currentId].id = newId;
		this.cameras[newId] = this.cameras[currentId];
		delete this.cameras[currentId];
	}
	update() {
		this.behaviourManager.broadcastEvent("update");
		this.getActiveCamera().update();
	}
}