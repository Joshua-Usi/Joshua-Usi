class HierarchyUI {
	constructor(id) {
		this.element = document.getElementById(id);
	}
	/* generate all the html for a given application */
	generateApplicationHTML(application) {
		let html = "";
		/* loop though all scenes and generate html */
		for (let scene in application.sceneManager.scenes) {
			/* prevent lookup of prototypes */
			if (application.sceneManager.scenes.hasOwnProperty(scene)) {
				html += this.generateSceneHTML(application.sceneManager.scenes[scene], application.sceneManager.scenes[scene].id === application.sceneManager.activeScene);
			}
		}
		this.element.innerHTML = html;
	}
	/* generate html for scenes including clickable part which allows hiding */
	generateSceneHTML(scene, active) {
		let gameObjectHTML = "";
		let cameraHTML = "";
		/* loop though all cameras and generate html */
		for (let camera in scene.cameraManager.cameras) {
			/* prevent lookup of prototypes */
			if (scene.cameraManager.cameras.hasOwnProperty(camera)) {
				cameraHTML += this.generateGameObjectHTML(scene.cameraManager.cameras[camera], "camera");
			}
		}
		/* loop over all objects in the scene */
		for (let i = 0; i < scene.objects.length; i++) {
			gameObjectHTML += this.generateGameObjectHTML(scene.objects[i], "gameobject");
		}
		return `<div class="editor-hierarchy-element">
					<div class="editor-hierarchy-clickable" ${(active) ? `style="background: #656565;"` : ""}>
						${(gameObjectHTML.length + cameraHTML.length === 0) ? "" : `<img src="./src/images/hierarchy-arrow.png" class="editor-hierarchy-arrow editor-hierarchy-icon">`}
						<img src="./src/images/crescendo-logo.png" class="editor-hierarchy-icon">
						<span class="editor-hierarchy-scene-id">${scene.id}</span>
					</div>
					<div class="editor-hierarchy-children">
						${cameraHTML}${gameObjectHTML}
					</div>
				</div>`;
	}
	/* generate individual object html */
	generateGameObjectHTML(gameObject, type) {
		return `<div class="editor-hierarchy-element editor-hierarchy-gameobject">
					<img src="./src/images/${type}-icon.png" class="editor-hierarchy-icon">
					<span class="editor-hierarchy-gameobject-id" data-type=${type} contenteditable>${gameObject.id}</span>
				</div>`;
	}
}