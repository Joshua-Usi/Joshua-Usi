class SceneManager {
	constructor() {
		/* a hashmap containing all scenes */
		this.scenes = {};
		/* the identifier for the active scene, not a reference to the active scene itself */
		this.activeScene = null;
	}
	switchToScene(id) {
		/* ensure the scene actually exists before switching */
		if (this.scenes[id]) {
			this.activeScene = id;
		} else {
			console.error(`scene with the ID "${id}" does not exist`);
		}
	}
	switchToSceneAndInit(id) {
		/* ensure the scene actually exists before switching */
		if (this.scenes[id]) {
			this.activeScene = id;
			this.scenes[id].init();
		} else {
			throw new Error(`UserError: scene with the ID "${id}" does not exist`);
		}
	}
	initialiseActiveScene() {
		if (this.activeScene) {
			this.scenes[this.activeScene].init();
		} else {
			console.warn("no active scene to init");
		}
	}
	addScene(scene) {
		/* warn about scene overwrites, it is not critical but it can cause unintended behaviour */
		if (this.scenes[scene.id]) {
			console.warn(`scene with the ID "${scene.id}" already exists, it will be overwritten`);
		}
		this.scenes[scene.id] = scene;
	}
	getScene(id) {
		if (this.scenes[id]) {
			return this.scenes[id];
		}
		return null;
	}
	/* returns the active scene */
	getActiveScene() {
		return this.scenes[this.activeScene];
	}
	/* renames a scene (used in the gui) */
	renameScene(currentId, newId) {
		this.scenes[currentId].id = newId;
		this.scenes[newId] = this.scenes[currentId];
		delete this.scenes[currentId];
	}
}