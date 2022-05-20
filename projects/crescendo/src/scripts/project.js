/* a json safe format for storing crescendo projects */
class Project {
	constructor(name, source = `let unnamed_scene = new Scene("unnamed scene");
let unnamed_scene_main_camera = new Camera("main camera");
unnamed_scene_main_camera.addComponent(new Components.Transform(0, 0, 0, 50, 50));
unnamed_scene.cameraManager.addCamera(unnamed_scene_main_camera);
this.sceneManager.addScene(unnamed_scene);
unnamed_scene.cameraManager.switchToCamera("main camera");	
this.sceneManager.switchToScene("unnamed scene");`, settings = new DefaultOptions()) {
		this.version = 1;

		this.name = name;
		this.settings = settings;
		this.sourceCode = source; 
		/* Custom virtual file system */
		this.files = new VirtualFileSystem();
		this.files.setRootPath("data");
		FileManager.useVirtualFileSystem(this.files);

		/* base 64 png string previewing what the project looks like in png format */
		this.previewData = "";
	}
	addFile(file) {
		this.files[file.name] = file;
	}
	removeFile() {
		delete this.files[fileName];
	}
	renameFile(newName, oldName) {
		this.files[newName] = this.fileName[oldName];
		delete this.files[oldName];
	}
	/* takes a JSON parsed objecct */
	populateWithJSON(json) {
		for (let key in this) {
			if (this.hasOwnProperty(key) && json.hasOwnProperty(key)) {
				this[key] = json[key];
			}
		}
		this.files = VirtualFileSystem.hydrate(this.files);
		this.files.setRootPath("data");
		FileManager.useVirtualFileSystem(this.files);
	}
}