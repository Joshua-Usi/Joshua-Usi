const Downloader = (function() {
	"use strict";
	/*
	 *	Hi sir, if you are seeing this, then you may wonder? Why am I referencing an online file. Well this is because
	 *	of a very limiting API called CORS (Cross Origin Resource Policy). CORS is extremely annoying to developers
	 *	As such I am referencing an online file to circumvent this, however I find this rather hacky. This may cause errors
	 *	when you have no internet, so I prefer that you turn on your internet
	 */
	let fetchScripts = ["behaviourManager.js", "cameraManager.js", "components.js", "defaultOptions.js", "engine.js", "gameObject.js", "inputs.js", "keyInputs.js", "mouseInputs.js", "potatoPhysicsEngine.js", "renderer.js", "scene.js", "sceneManager.js", "utils.js", "vector.js", "fileManager.js"];
	return {
		scriptNames: function() {
			return fetchScripts;
		},
		/* takes a zip and a virtual file system and add's the data to the file */
		generateFiles: function(zip, virtualFileSystem) {
			let data = zip.folder("data");
			for (let i = 0; i < virtualFileSystem.files.length; i++) {
				data.file(virtualFileSystem.files[i].name, virtualFileSystem.files[i].data, {base64: true});
			}
		},
		generateApplicationZip: function(application, files, scriptData, project) {
			let zip = this.generateBaseZip();
			this.populateZip(zip, application, project);
			this.populateScripts(zip, this.scriptNames(), scriptData);
			this.generateFiles(zip, files);
			return zip;
		},
		/* generates the base zip used by */
		generateBaseZip: function() {
			let zip = new JSZip();
			let src = zip.folder("src");
			src.folder("images");
			src.folder("audio");
			src.folder("scripts");
			zip.file("index.html", Templates.html("Empty Project", this.scriptNames()));
			zip.file("style.css");
			zip.file("main.js");
			return zip;
		},
		getScripts: async function() {
			if (window.location.protocol === "file:") {
				return CompileData;
			} else {
				let scriptData = [];
				for (let i = 0; i < fetchScripts.length; i++) {
					scriptData.push(await fetch(`./src/scripts/${fetchScripts[i]}`).then(response => response.text()).then(data => data));
				}
				return scriptData;
			}
		},
		generateCORSSafeFiles: async function() {
			let data = await Downloader.getScripts();
			let output = "";
			for (let i = 0; i < data.length; i++) {
				output += data[i];
			}
			return output;
		},
		populateScripts: function(zip, scriptNames, scriptData) {
			let scripts = zip.folder("src").folder("scripts");
			for (let i = 0; i < scriptNames.length; i++) {
				scripts.file(scriptNames[i], scriptData[i]);
			}
		},
		populateZip: function(zip, application, project) {
			let code = Compiler.applicationToCode(application, project);
			zip.file("main.js", code);
		},
		downloadBlob: function(filename, blob) {
			let element = document.createElement("a");
			element.href = URL.createObjectURL(blob);
			element.setAttribute("download", filename);
			element.click();
		},
	};
})();