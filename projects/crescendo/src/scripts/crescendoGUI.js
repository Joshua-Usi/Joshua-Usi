class CrescendoGUI {
	constructor(application) {
		this.attachedApplication = application;
		/* create the colour picker handler */
		this.colourPicker = new ColourPicker("colour-picker", "colour-picker-selected-colour", "colour-picker-selected-colour-preview");
		/* create the line editor handler */
		this.lineEditor = new LineEditor("line-editor-canvas", this);
		/* create UI controllers */
		this.hierarchy = new HierarchyUI("editor-hierarchy-pane");
		this.componentEditor = new ComponentEditorUI();
		this.files = new FileUI("asset-overview", "file-view");
		/* reference to a the selected gameobject*/
		this.selectedGameObject = null;
		/* used to bring selected windows to the front */
		this.windowZIndex = 1000;
		this.isRunning = false;
		this.editorCamera = new Camera("editor-camera", 0, 0, 0);
		this.editorCamera.addComponent(new Components.Transform());
		this.accumulator = 0;
		this.previous = Date.now();
		/* a string of code that represents the code that will be used when compiling */
		this.project = new Project("Unnamed Crescendo project");
		this.previousValidSourceCode = "";
		this.hasUnsavedChanges = false;
		this.projectChangedSinceLastCompile = false;
	}
	init() {
		/* outer referencing */
		let that = this;
		/* show error window when errors occur */
		window.addEventListener("error", function(event) {
			console.error(event.message);
			showWindow("error-window");
		});
		/* prevents the accidental (or intentional) reloading of the page when there are unsaved changes */
		window.addEventListener("beforeunload", function(event) {
			/* check for changes before showing confirmation window */
			if (that.hasUnsavedChanges === false) {
				return null;
			}
			/* for chrome */
			if (event) {
				event.returnValue = "Sure?";
			}
			/* for other browsers */
			return "Sure?";
		});
		/* set the name of the project */
		document.getElementById("project-name").innerText = this.project.name;
		/* detect for changes to the project name and update accordingly */
		document.getElementById("project-name").addEventListener("keydown", function(event) {
			/* only allow maximum 50 characters */
			if (event.which != 8 && this.innerText.length >= 50) {
				event.preventDefault();
			}
			/* prevent new lines */
			if (event.which === 13) {
				event.preventDefault();
			}
		});
		document.getElementById("project-name").addEventListener("keyup", function() {
			that.project.name = this.innerText;
			that.hasUnsavedChanges = true;
		})
		/* initialise application */
		this.initialiseApplication();
		/* find all draggable elements */
		let draggableElements = document.getElementsByClassName("draggable-element");
		for (let i = 0; i < draggableElements.length; i++) {
			/* allows "draggability" on all applicable elements */
			this.allowElementToDrag(draggableElements[i]);
		}
		this.attachedApplication.renderer.canvas.addEventListener("wheel", function(event) {
			/* to give a more realistic zoom in out effect, the zoom should be based on the pixel unit */
			/* also flip the direction as it it more intuitive for scrolling up to zoom in*/
			that.attachedApplication.renderer.pixelsPerUnit -= event.deltaY / 1000 * that.attachedApplication.renderer.pixelsPerUnit;
			/* ensure ppu is between [0.01, 500] */
			if (that.attachedApplication.renderer.pixelsPerUnit < 0.01) {
				that.attachedApplication.renderer.pixelsPerUnit = 0.01;
			}
			if (that.attachedApplication.renderer.pixelsPerUnit > 500) {
				that.attachedApplication.renderer.pixelsPerUnit = 500;
			}
			/* re render the application */
			that.renderApplication(that.editorCamera);
		}, {
			passive: true
		});
		/* set event listeners */
		document.getElementById("pause-editor").addEventListener("click", function() {
			/* toggle between pause and play images */
			if (this.src.includes("pause")) {
				this.src = "./src/images/play.png";
				that.attachedApplication.stop();
				that.attachedApplication.renderer.canvas.style.outline = "";
			} else {
				this.src = "./src/images/pause.png";
				that.updateApplicationCode();
				that.initialiseApplication();
				that.attachedApplication.start();
				that.attachedApplication.renderer.pixelsPerUnit = that.project.settings.pixelsPerUnit;
				/* darken everything but the canvas as user feedback to if the game is running */
				that.attachedApplication.renderer.canvas.style.outline = "100vmax solid rgba(0, 0, 0, .5)";
			}
		});
		/* toggle between full screen */
		document.getElementById("fullscreen-toggle").addEventListener("click", function() {
			/* cache for performance */
			let element = document.getElementById("editor-canvas");
			let canvas = that.attachedApplication.renderer.canvas;
			/* toggle between exit and enter images */
			if (this.src.includes("enter")) {
				this.src = "./src/images/exit-fullscreen.png";
				element.style.position = "absolute";
				canvas.style.width = "100vw";
				canvas.style.height = "95vh";
			} else {
				this.src = "./src/images/enter-fullscreen.png";
				element.style.position = "static";
				canvas.style.width = "100%";
				canvas.style.height = "100%";
			}
			that.resizeCanvas();
		});
		/* reset the application to the beginning */
		document.getElementById("initialise-application").addEventListener("click", function() {
			that.updateApplicationCode();
			that.initialiseApplication();
		});
		/* useful for detecting frame by frame errors */
		document.getElementById("advance-one-frame").addEventListener("click", function() {
			that.attachedApplication.update();
			that.renderApplication(that.editorCamera);
		});
		/* show the new object window when clicked */
		document.getElementById("create-new-gameobject").addEventListener("click", function() {
			showWindow("new-object-window");
		});
		/* show the file viewer window when clicked */
		document.getElementById("open-file-viewer").addEventListener("click", function() {
			showWindow("file-viewer-window");
			that.files.generateFileHtml(that.project.files, true);
		});
		/* detect when a file has been uploaded and add it to the project */
		document.getElementById("upload-file").addEventListener("change", function() {
			/* multifile support*/
			for (let i = 0; i < this.files.length; i++) {
				showLoadingScreen("Your file is being uploaded, give it a sec!");
				let fileReader = new FileReader();
				/* outer reference */
				let ref = this;
				let myIndex = i;
				fileReader.addEventListener("load", function(event) {
					/* add file to project */
					let fileData = event.target.result.split(",");
					/* remove identifier components, they aren't needed */
					fileData[0] = fileData[0].replace("data:", "");
					fileData[0] = fileData[0].replace(";base64", "");
					that.project.files.addFile(new VirtualFile(ref.files[i].name, fileData[1], fileData[0]));
					that.files.generateFileHtml(that.project.files);
					if (myIndex === ref.files.length - 1) {
						hideLoadingScreen();
					}
					console.success(`File "${ref.files[i].name}" was successfully added`);
				});
				fileReader.addEventListener("error", function(event) {
					console.error(`File "${ref.files[i].name}" failed to load: ${event.message}`);
				})
				/* read the file/s */
				fileReader.readAsDataURL(this.files[i]);
			}
		});
		/* detect when a file has been uploaded and add it to the project */
		document.getElementById("upload-project-file").addEventListener("change", function() {
			showLoadingScreen("Your project is being loaded, sit tight!");
			/* only ever load 1 file */
			let fileReader = new FileReader();
			fileReader.addEventListener("load", function(event) {
				that.project.populateWithJSON(JSON.parse(event.target.result));
				that.initialiseApplication();
				that.files.generateFileHtml(that.project.files);
				hideLoadingScreen();
			});
			/* read the file/s */
			fileReader.readAsText(this.files[0]);
		});
		document.getElementById("load-project").addEventListener("click", function() {
			showWindow("projects-window");
			/* open the current version of the database */
			let database = indexedDB.open("crescendo-projects-database");
			database.addEventListener("success", function(event) {
				let db = event.target.result;
				let objectStore = getObjectStore(db, "projects", "readwrite");
				/* write / overwrite the project into the database */
				let request = objectStore.getAll();
				request.addEventListener("error", function(event) {
					throw new Error(`Attempt to insert into object store ${"projects"} failed: ${event.target.error}`);
				});
				/* show user the project was successfully saved and allow reload or closing of window without confirmation dialogue */
				request.addEventListener("success", function(event) {
					let ui = document.getElementById("projects");
					ui.innerHTML = "";
					for (var i = 0; i < event.target.result.length; i++) {
						event.target.result[i]
						ui.innerHTML += `<div class="new-component-button">
						<img style="width: 100%;" src="${event.target.result[i].previewData || "./src/images/crescendo-logo.png"}">
							<div style="text-align: center;">${event.target.result[i].name}</div>
						</div>`;
					}
				});
				request.addEventListener("error", function(event) {
					console.error(`${event.target.result[i].name} failed to load: ${event.message}`);
				})
			});
		});
		document.getElementById("projects").addEventListener("click", function(event) {
			showLoadingScreen("Your project is being loaded, sit tight!");
			let projectName = event.target.parentNode.querySelector("div").innerText;
			/* open the current version of the database */
			let database = indexedDB.open("crescendo-projects-database");
			database.addEventListener("success", function(event) {
				let db = event.target.result;
				let objectStore = getObjectStore(db, "projects", "readwrite");
				/* write / overwrite the project into the database */
				let request = objectStore.get(projectName);
				request.addEventListener("error", function(event) {
					throw new Error(`Attempt to get ${projectName} object store ${"projects"} failed: ${event.target.error}`);
				});
				/* load the selected application data */
				request.addEventListener("success", function(event) {
					that.project.populateWithJSON(event.target.result);
					document.getElementById("project-name").innerText = event.target.result.name;
					that.initialiseApplication();
					that.files.generateFileHtml(that.project.files);
					hideLoadingScreen();
					console.success(`"${event.target.result.name}" was successfully loaded`);
				});
			});
		});
		document.getElementById("download-project").addEventListener("click", function() {
			const blob = new Blob([JSON.stringify(that.project)], {
				type: "text/json"
			});
			Downloader.downloadBlob(`${that.project.name}.crescendo`, blob);
		});
		document.getElementById("new-project").addEventListener("click", function() {
			that.project = new Project();
			that.initialiseApplication();
		});
		/* save the project and write it to the database */
		document.getElementById("save-project").addEventListener("click", function() {
			showLoadingScreen("Your project is being saved, lets go!");
			/* open the current version of the database */
			let database = indexedDB.open("crescendo-projects-database");
			/* generate the preview image for the project */
			let resizedCanvas = document.createElement("canvas");
			let resizedContext = resizedCanvas.getContext("2d");
			resizedCanvas.height = 128;
			resizedCanvas.width = 128;
			let canvas = that.attachedApplication.renderer.canvas;
			let mappedWidth = canvas.width / canvas.width * resizedCanvas.width;
			let mappedHeight = canvas.height / canvas.width * resizedCanvas.height;
			resizedContext.drawImage(canvas, -mappedWidth / 2, 0, mappedWidth * 2, mappedHeight * 2);
			that.project.previewData = resizedCanvas.toDataURL();
			database.addEventListener("success", function(event) {
				let db = event.target.result;
				/* open the projects data store */
				let objectStore = getObjectStore(db, "projects", "readwrite");
				/* write / overwrite the project into the database */
				let request = objectStore.put(that.project);
				request.addEventListener("error", function(event) {
					throw new Error(`Attempt to insert into object store ${"projects"} failed: ${event.target.error}`);
				});
				/* show user the project was successfully saved and allow reload or closing of window without confirmation dialogue */
				request.addEventListener("success", function(event) {
					hideLoadingScreen();
					console.success(`"${that.project.name}" was successfully saved`);
					that.hasUnsavedChanges = false;
				});
			});
			database.addEventListener("error", function(event) {
				throw new Error(`Attempt to open database failed due to ${event.target.error}`);
			});
		});
		/* event delegation */
		document.getElementById("new-object-window").addEventListener("click", function(event) {
			let elementClicked = event.target;
			/* if the element clicked was to close the window, then return, because theres a listener for it already*/
			if (elementClicked.classList.contains("close-window")) {
				return;
			}
			/* bubble up elements until it find the element parent button */
			while (elementClicked.classList && elementClicked.classList.contains("new-object-button") === false) {
				elementClicked = elementClicked.parentNode;
			}
			/* ensure element is not a root element */
			if (elementClicked.classList && elementClicked.classList.contains("new-object-button")) {
				/* if the element to be added is a scene then add it */
				if (elementClicked.getAttribute("id") === "new-scene") {
					/* generate a unique clone id*/
					let cloneId = "";
					let i = 0;
					/* loop through scenes with the same id until an unused scene id is found */
					while (that.attachedApplication.sceneManager.getScene(`unnamed scene${cloneId}`) !== null) {
						i++;
						cloneId = ` (${i})`;
					}
					/* generate and add scene */
					let scene = new Scene(`unnamed scene${cloneId}`);
					that.attachedApplication.sceneManager.addScene(scene);
					that.attachedApplication.sceneManager.switchToScene(scene.id);
					/* instancing scenes automatically gives them a camera */
					let camera = new Camera("main camera");
					camera.addComponent(new Components.Transform());
					scene.cameraManager.addCamera(camera);
					scene.cameraManager.switchToCamera("main camera");
					/* otherwise ensure that a scene is active before adding others objects */
				} else if (that.attachedApplication.sceneManager.activeScene) {
					switch (elementClicked.getAttribute("id")) {
						case "new-camera": {
							let cloneId = "";
							let i = 0;
							/* generate a unique clone id */
							while (that.attachedApplication.sceneManager.getActiveScene().cameraManager.getCameraById(`unnamed camera${cloneId}`) !== null) {
								i++;
								cloneId = ` (${i})`;
							}
							let camera = new Camera(`unnamed camera${cloneId}`);
							/* cameras are automatically given transforms */
							camera.addComponent(new Components.Transform());
							let activeScene = that.attachedApplication.sceneManager.getActiveScene();
							activeScene.cameraManager.addCamera(camera);
							activeScene.cameraManager.switchToCamera(camera.id);
							break;
						}
						case "new-rectangle": {
							let cloneId = "";
							let i = 0;
							/* generate a unique clone id */
							while (that.attachedApplication.sceneManager.getActiveScene().getGameObjectById(`unnamed rectangle${cloneId}`) !== null) {
								i++;
								cloneId = ` (${i})`;
							}
							let object = new GameObject(`unnamed rectangle${cloneId}`);
							/* give relevant components */
							object.addComponent(new Components.Transform());
							object.addComponent(new Components.MeshRenderer("rectangle"));
							object.addComponent(new Components.RectangleRigidbody());
							that.attachedApplication.sceneManager.getActiveScene().addGameObject(object);
							break;
						}
						case "new-ellipse": {
							let cloneId = "";
							let i = 0;
							/* generate a unique clone id */
							while (that.attachedApplication.sceneManager.getActiveScene().getGameObjectById(`unnamed ellipse${cloneId}`) !== null) {
								i++;
								cloneId = ` (${i})`;
							}
							let object = new GameObject(`unnamed ellipse${cloneId}`);
							/* give relevant components */
							object.addComponent(new Components.Transform());
							object.addComponent(new Components.MeshRenderer("circle"));
							object.addComponent(new Components.CircleRigidbody());
							that.attachedApplication.sceneManager.getActiveScene().addGameObject(object);
							break;
						}
						case "new-line": {
							let cloneId = "";
							let i = 0;
							/* generate a unique clone id */
							while (that.attachedApplication.sceneManager.getActiveScene().getGameObjectById(`unnamed line${cloneId}`) !== null) {
								i++;
								cloneId = ` (${i})`;
							}
							let object = new GameObject(`unnamed line${cloneId}`);
							/* give relevant components */
							object.addComponent(new Components.Transform());
							object.addComponent(new Components.LineRenderer());
							object.addComponent(new Components.Line());
							object.addComponent(new Components.LineRigidbody());
							that.attachedApplication.sceneManager.getActiveScene().addGameObject(object);
							break;
						}
						case "new-text": {
							let cloneId = "";
							let i = 0;
							/* generate a unique clone id */
							while (that.attachedApplication.sceneManager.getActiveScene().getGameObjectById(`unnamed text${cloneId}`) !== null) {
								i++;
								cloneId = ` (${i})`;
							}
							let object = new GameObject(`unnamed text${cloneId}`);
							/* give relevant components */
							object.addComponent(new Components.Transform(0, 0, 0, 200, 50));
							object.addComponent(new Components.TextRenderer());
							that.attachedApplication.sceneManager.getActiveScene().addGameObject(object);
							break;
						}
						/* otherwise the element clicked does not have a defined primitive */
						default: {
							if (elementClicked.getAttribute("id") !== undefined) {
								console.warn(`Unknown primitive: ${elementClicked.getAttribute("id")}`);
							}
						}
					}
					/* if no scene is active, give user a warning */
				} else if (that.attachedApplication.sceneManager.activeScene === null) {
					console.warn(`Cannot add ${elementClicked.getAttribute("id")} since no scene exists / no scene is active`);
					return;
				}
				/* update application stuff */
				that.projectChangedSinceLastCompile = true;
				that.renderApplication(that.editorCamera);
				that.updateHierarchy();
			}
		});
		/* manual refreshing of hierarchy */
		document.getElementById("refresh-hierarchy").addEventListener("click", function() {
			that.updateHierarchy();
		});
		/* Look for any elements with the class "select-box": */
		let selectBoxes = document.getElementsByClassName("select-box");
		for (let i = 0; i < selectBoxes.length; i++) {
			/* The select element is the first element */
			let selectElement = selectBoxes[i].getElementsByTagName("select")[0];
			/* For each element, create a new div that will act as the selected item: */
			let currentlySelectedItem = document.createElement("div");
			currentlySelectedItem.setAttribute("class", "select-selected");
			currentlySelectedItem.innerHTML = selectElement.options[selectElement.selectedIndex].innerHTML;
			selectBoxes[i].appendChild(currentlySelectedItem);
			/* For each element, create a new div that will contain the option list: */
			let optionsList = document.createElement("div");
			optionsList.setAttribute("class", "select-items select-hide");
			for (let j = 1; j < selectElement.length; j++) {
				/* For each option in the original select element,
				create a new div that will act as an option item: */
				let options = document.createElement("div");
				options.innerHTML = selectElement.options[j].innerHTML;
				options.addEventListener("click", function(e) {
					/* When an item is clicked, update the original select box,
					and the selected item: */
					let selectElement2 = this.parentNode.parentNode.getElementsByTagName("select")[0];
					let selectedOption = this.parentNode.previousSibling;
					for (let k = 0; k < selectElement2.length; k++) {
						if (selectElement2.options[k].innerHTML == this.innerHTML) {
							selectElement2.selectedIndex = k;
							selectedOption.innerHTML = this.innerHTML;
							/* run custom events */
							let event = new CustomEvent("input", {
								bubbles: true,
								shape: selectedOption.textContent,
							});
							/* dispatch custom event */
							selectBoxes[i].dispatchEvent(event);
							let sameAsSelected = this.parentNode.getElementsByClassName("same-as-selected");
							for (let l = 0; l < sameAsSelected.length; l++) {
								sameAsSelected[l].removeAttribute("class");
							}
							this.setAttribute("class", "same-as-selected");
							break;
						}
					}
					selectedOption.click();
				});
				optionsList.appendChild(options);
			}
			selectBoxes[i].appendChild(optionsList);
			currentlySelectedItem.addEventListener("click", function(event) {
				/* When the select box is clicked, close any other select boxes,
				and open/close the current select box: */
				event.stopPropagation();
				that.closeAllSelect(this);
				this.nextSibling.classList.toggle("select-hide");
				this.classList.toggle("select-arrow-active");
			});
		}
		/*
		 *	if the user clicks anywhere outside the select box,
		 *	then close all select boxes
		 */
		document.addEventListener("click", this.closeAllSelect);
		/* find all windows and hide them */
		let windows = document.getElementsByClassName("window");
		for (let i = 0; i < windows.length; i++) {
			windows[i].style.display = "none";
		}
		/* find all component editors and hide them */
		this.componentEditor.hideWindows();
		document.getElementById("page-state-windows").addEventListener("click", function() {
			let elementClicked = event.target;
			/* bubble up elements until it finds the window to close */
			while (elementClicked.classList && elementClicked.classList.contains("window") === false) {
				elementClicked = elementClicked.parentNode;
			}
			if (elementClicked.classList) {
				/* bring focused window to front */
				that.windowZIndex++;
				elementClicked.style.zIndex = that.windowZIndex;
			}
		});
		/* event delegation - massively decreases event listeners */
		document.addEventListener("click", function(event) {
			let elementClicked = event.target;
			/* opens the colour picker windows if a dropper is clicked */
			if (elementClicked.classList.contains("dropper")) {
				showWindow("colour-picker-window");
				/* this time instead of using event listeners, assign the event directly via onevent attributes, this is because the normal method would leak event listeners or require globals */
				document.getElementById("colour-picker-select-colour").onclick = function() {
					let colourElement = document.getElementById(elementClicked.getAttribute("id").replace("-dropper", ""));
					colourElement.style.background = that.colourPicker.currentHex();
					let event = new CustomEvent("input", {
						bubbles: true,
					});
					colourElement.dispatchEvent(event);
					/* close the window */
					hideWindow("colour-picker-window");
				};
			}
			/* show text editor*/
			if (elementClicked.classList.contains("open-text-editor") && that.selectedGameObject) {
				let textEditor = document.getElementById("text-editor");
				textEditor.setAttribute("data-edit", elementClicked.getAttribute("id"));
				showWindow("text-editor-window");
				if (elementClicked.getAttribute("id") === "behaviour_script-text") {
					/* turn text into valid html text */
					textEditor.value = that.selectedGameObject.getComponent("behaviour-script").script.replaceAll("\t", "    ");
				} else if (elementClicked.getAttribute("id") === "renderer_text-text") {
					/* turn text into valid html text */
					textEditor.value = that.selectedGameObject.getComponent("renderer").text.replaceAll("\t", "    ");
				}
			}
			if (elementClicked.classList.contains("open-file-viewer") && that.selectedGameObject) {
				showWindow("file-viewer-window");
				that.files.generateFileHtml(that.project.files, true);
				document.getElementById("file-view").onclick = function(event) {
					let elementClicked = event.target;
					while (elementClicked.classList && elementClicked.classList.contains("file-icon") === false) {
						elementClicked = elementClicked.parentNode;
					}
					if (elementClicked.classList) {
						let image = elementClicked.querySelector("div");
						that.selectedGameObject.getComponent("renderer").setTexture(`${image.innerText}`);
						that.projectChangedSinceLastCompile = true;
						that.renderApplication(that.editorCamera);
					}
					hideWindow("file-viewer-window");
				};
			}
			if (elementClicked.classList.contains("open-line-editor") && that.selectedGameObject) {
				showWindow("line-editor-window");
			}
			/* windows closing X's */
			if (elementClicked.classList.contains("close-window")) {
				/* bubble up elements until it finds the window to close */
				while (elementClicked.classList && elementClicked.classList.contains("window") === false && elementClicked.classList.contains("window-no-style") === false) {
					elementClicked = elementClicked.parentNode;
				}
				/* ensure the element is not one of the root elements */
				if (elementClicked.classList) {
					hideWindow(elementClicked.id);
				}
			}
		});
		let previousElement = null;
		let previousScene = null;
		/* event delegation - massively decreases event listeners */
		document.getElementById("editor-hierarchy").addEventListener("input", function(event) {
			if (that.selectedGameObject) {
				if (that.selectedGameObject.constructor.name === "Camera") {
					that.attachedApplication.sceneManager.getActiveScene().cameraManager.renameCamera(that.selectedGameObject.id, event.target.innerText);
				} else {
					that.selectedGameObject.id = event.target.innerText;
				}
				that.projectChangedSinceLastCompile = true;
			}
		});
		document.getElementById("editor-hierarchy").addEventListener("click", function(event) {
			let elementClicked = event.target;
			/* bubble up elements until it finds the window to close */
			while (elementClicked.classList && (elementClicked.classList.contains("editor-hierarchy-clickable") === false && elementClicked.classList.contains("editor-hierarchy-gameobject") === false && elementClicked.classList.contains("editor-hierarchy-scene") === false)) {
				elementClicked = elementClicked.parentNode;
			}
			/* ensure the element is not one of the root elements */
			if (elementClicked.classList) {
				if (elementClicked.classList.contains("editor-hierarchy-clickable")) {
					elementClicked.style.background = "#656565";
					/* revert the color of the previous element */
					if (previousScene && previousScene !== elementClicked) {
						previousScene.style.background = "#0000";
					}
					previousScene = elementClicked;
					/* cache */
					let children = elementClicked.parentNode.getElementsByClassName("editor-hierarchy-children")[0];
					let arrow = elementClicked.getElementsByClassName("editor-hierarchy-arrow")[0];
					let element = elementClicked.getElementsByClassName("editor-hierarchy-scene-id")[0];
					let sceneId = element.innerText;
					/* show and denote the arrow pointing open */
					if (arrow) {
						if (children.style.display === "none") {
							children.style.display = "block";
							arrow.style.transform = "rotate(90deg)";
						} else {
							children.style.display = "none";
							arrow.style.transform = "rotate(0deg)";
						}
					}
					/* switch to the active scene */
					that.attachedApplication.sceneManager.switchToScene(sceneId);
					that.projectChangedSinceLastCompile = true;
					that.componentEditor.hideWindows();
					that.renderApplication(that.editorCamera);
				} else if (elementClicked.classList.contains("editor-hierarchy-gameobject")) {
					elementClicked.style.background = "#656565";
					/* reset the background of the previously clicked element*/
					if (previousElement && previousElement !== elementClicked) {
						previousElement.style.background = "#0000";
					}
					/* update the previously clicked element to be the currently clicked element*/
					previousElement = elementClicked;
					/* find all editor component windows and hide them */
					that.componentEditor.hideWindows();
					let element = elementClicked.getElementsByClassName("editor-hierarchy-gameobject-id")[0];
					let objectId = element.innerText;
					let activeScene = that.attachedApplication.sceneManager.getActiveScene();
					/* get a reference to the game object given the id */
					/* differentiate between object and camera*/
					if (element.getAttribute("data-type") === "gameobject") {
						that.selectedGameObject = activeScene.getGameObjectById(objectId);
					} else {
						that.selectedGameObject = activeScene.cameraManager.getCameraById(objectId);
						activeScene.cameraManager.switchToCamera(objectId);
						that.renderApplication();
					}
					if (that.selectedGameObject.hasComponent("line")) {
						that.lineEditor.render(that.selectedGameObject.getComponent("line"));
					}
					/* if the gameobject exists, then show components*/
					if (that.selectedGameObject) {
						let index = that.attachedApplication.sceneManager.getActiveScene().getGameObjectIndex(that.selectedGameObject.id);
						/* show a bounding box around the gameObject */
						that.attachedApplication.renderer.boundingBoxAroundIndex = index;
						that.renderApplication(that.editorCamera);
						/* show relevant windows */
						that.componentEditor.showComponentWindows(that.selectedGameObject);
						that.updateComponentEditor();
					}
				}
			} else {
				/* otherwise, then nullify parameters */
				that.selectedGameObject = null;
				that.attachedApplication.renderer.boundingBoxAroundIndex = null;
				if (previousElement) {
					previousElement.style.background = "#0000";
				}
				/* hide application windows */
				that.componentEditor.hideWindows();
				that.renderApplication(that.editorCamera);
			}
		});
		document.getElementById("editor-component-editor").addEventListener("click", function(event) {
			/* component deletion */
			if (event.target.classList.contains("delete-component") && that.selectedGameObject) {
				that.selectedGameObject.removeComponent(event.target.id.replace("-delete", ""));
				that.projectChangedSinceLastCompile = true;
			}
		});
		document.getElementById("editor-component-editor").addEventListener("input", function(event) {
			if (that.selectedGameObject === null) {
				return;
			}
			let elementClicked = event.target;
			/*
			 *	input text-area
			 *	input checkbox
			 *	class select-box
			 *	class component-texture-display
			 *	class component-colour-display
			 */
			let split = elementClicked.getAttribute("id").split(/_(.+)/);
			let component = that.selectedGameObject.getComponent(split[0]);
			/* determine the valyes requires for different boxes */
			if (elementClicked.tagName.toLowerCase() === "input" && elementClicked.type === "text") {
				component[Utils.dashToCamelCase(split[1])] = elementClicked.value || 0;
			} else if (elementClicked.tagName.toLowerCase() === "input" && elementClicked.type === "number") {
				component[Utils.dashToCamelCase(split[1])] = parseFloat(elementClicked.value || 0);
			} else if (elementClicked.tagName.toLowerCase() === "input" && elementClicked.type === "checkbox") {
				component[Utils.dashToCamelCase(split[1])] = elementClicked.checked;
			} else if (elementClicked.classList.contains("select-box")) {
				component[Utils.dashToCamelCase(split[1])] = elementClicked.getElementsByClassName("select-selected")[0].textContent;
			} else if (elementClicked.classList.contains("component-texture-display")) {
				/* NONE */
			} else if (elementClicked.classList.contains("component-colour-display")) {
				component[Utils.dashToCamelCase(split[1])] = that.RGBToHEX(elementClicked.style.background);
				component.texture = null;
				component.texturePath = null;
			}
			that.projectChangedSinceLastCompile = true;
			that.renderApplication(that.editorCamera);
		});
		/* resizes canvas width and height properties so they look correct */
		window.addEventListener("resize", function() {
			that.resizeCanvas();
		});
		/* debugging and developer commands */
		document.getElementById("debug-window").addEventListener("input", function(event) {
			let elementClicked = event.target;
			switch (elementClicked.getAttribute("id")) {
				case "show-bounding-boxes": {
					that.attachedApplication.renderer.drawBoundingBoxes = elementClicked.checked;
					break;
				}
				case "show-render-grid": {
					that.attachedApplication.renderer.drawGrid = elementClicked.checked;
					break;
				}
				case "show-cpu-time-breakdown": {
					that.attachedApplication.showCPUTimeBreakdown = elementClicked.checked;
					break;
				}
				that.renderApplication(that.editorCamera);
			}
		});
		this.attachedApplication.renderer.drawGrid = true;
		document.getElementById("text-editor").addEventListener("input", function(event) {
			if (that.selectedGameObject) {
				if (this.getAttribute("data-edit") === "behaviour_script-text") {
					that.selectedGameObject.getComponent("behaviour-script").script = this.value;
				} else if (this.getAttribute("data-edit") === "renderer_text-text") {
					that.selectedGameObject.getComponent("renderer").text = this.value;
				}
			}
			that.projectChangedSinceLastCompile = true;
			that.renderApplication(that.editorCamera);
		});
		document.getElementById("text-editor").addEventListener("keydown", function(event) {
			if (event.key == "Tab") {
				event.preventDefault();
				let beforeTab = this.value.slice(0, this.selectionStart);
				let afterTab = this.value.slice(this.selectionEnd, this.value.length);
				let cursorPos = this.selectionEnd + 4;
				/* add 4 spaces, default for tabs */
				this.value = beforeTab + "    " + afterTab;
				/* reposition cursor */
				this.selectionStart = cursorPos;
				this.selectionEnd = cursorPos;
			}
			document.getElementById("text-editor").dispatchEvent(new Event("input"));
		});
		document.getElementById("text-editor-done").addEventListener("click", function() {
			hideWindow("text-editor-window");
		});
		document.getElementById("project-settings").addEventListener("click", function() {
			showWindow("project-settings-window");
		});
		document.getElementById("project-compile").addEventListener("click", function() {
			showWindow("compile-project-window");
		});
		document.getElementById("compile-project").addEventListener("click", function() {
			showLoadingScreen("Your project is being compiled, just wait a bit!");
			Downloader.getScripts().then(function(scriptData) {
				let zip = Downloader.generateApplicationZip(that.attachedApplication, that.project.files, scriptData, that.project);
				zip.generateAsync({
					type: "blob"
				}).then(function(blob) {
					Downloader.downloadBlob(`${that.project.name}.zip`, blob);
					hideLoadingScreen();
					console.success(`Successfully compiled "${that.project.name}"`);
				});
			});
		});
		document.getElementById("add-component").addEventListener("click", function() {
			if (that.selectedGameObject) {
				showWindow("add-component-window");
			} else {
				this.textContent = "Select an object first";
				let self = this;
				this.style.animation = "shake 0.1s alternate 2";
				setTimeout(function() {
					self.textContent = "Add component";
					self.style.animation = "";
				}, 1000);
			}
		});
		document.getElementById("add-component-window").addEventListener("click", function(event) {
			let elementClicked = event.target;
			/* bubble up elements until it finds the window to close */
			while (elementClicked.classList && elementClicked.classList.contains("new-component-button") === false) {
				elementClicked = elementClicked.parentNode;
			}
			if (that.selectedGameObject && elementClicked.classList) {
				let componentId = elementClicked.getAttribute("id").replace("new-", "");
				let componentType = Utils.capitaliseFirstLetter(Utils.dashToCamelCase(componentId));
				if (that.selectedGameObject.hasComponent(componentId) === false) {
					let component = new Components[componentType]();
					that.selectedGameObject.addComponent(component);
					that.projectChangedSinceLastCompile = true;
					that.renderApplication(that.editorCamera);
					/* show relevant windows */
					that.componentEditor.showComponentWindows(that.selectedGameObject);
				} else {
					console.warn("already has component " + componentId);
				}
			}
		});
		/* update project settings */
		document.getElementById("project-settings-window").addEventListener("input", function(event) {
			let elementClicked = event.target;
			switch (elementClicked.getAttribute("id")) {
				case "physics-grid-size": {
					let value = parseInt(elementClicked.value);
					that.attachedApplication.physics.gridSize(value);
					that.project.settings.physicsGridSize = value;
					break;
				}
				case "physics-width": {
					let value = parseInt(elementClicked.value);
					that.attachedApplication.physics.width = value;
					that.attachedApplication.physics.xOffset = value / 2;
					that.project.settings.physicsEngineWidth = value;
					that.attachedApplication.physics.gridSize(parseFloat(document.getElementById("physics-grid-size").value));
					break;
				}
				case "physics-height": {
					let value = parseInt(elementClicked.value);
					that.attachedApplication.physics.height = value;
					that.attachedApplication.physics.yOffset = value / 2;
					that.project.settings.physicsEngineHeight = value;
					that.attachedApplication.physics.gridSize(parseFloat(document.getElementById("physics-grid-size").value));
					break;
				}
				case "physics-gravity": {
					let value = parseFloat(elementClicked.value);
					that.attachedApplication.physics.globalGravity.y = value;
					that.project.settings.globalGravity = value;
					break;
				}
				case "physics-iterations": {
					let value = parseInt(elementClicked.value);
					that.attachedApplication.physics.iterations = value;
					that.project.settings.physicsIterations = value;
					break;
				}
				case "physics-error-correction-coefficient": {
					let value = parseFloat(elementClicked.value);
					that.attachedApplication.physics.errorCorrectionCoefficient = value;
					that.project.settings.physicsErrorCorrection = value;
					break;
				}
				case "renderer-pixels-per-unit": {
					let value = parseFloat(elementClicked.value);
					that.attachedApplication.renderer.pixelsPerUnit = value;
					that.project.settings.pixelsPerUnit = value;
					break;
				}
			}
			that.renderApplication(that.editorCamera);
			that.projectChangedSinceLastCompile = true;
			that.hasUnsavedChanges = true;
		});
		// let currentElementHover = null;
		document.addEventListener("mousemove", function(event) {
			// currentElementHover = event.target;
			let toolTip = document.getElementById("tooltip-text");
			if (event.target.getAttribute("data-tooltip")) {
				toolTip.innerText = event.target.getAttribute("data-tooltip");
				toolTip.style.opacity = 1;
				toolTip.style.transitionDelay = "1s";
			} else {
				toolTip.style.opacity = 0;
				toolTip.style.transitionDelay = "0.2s";
			}
			/* position tooltip to be visible on screen in most cases */
			let computedStyle = window.getComputedStyle(toolTip);
			if (event.x < window.innerWidth / 2) {
				toolTip.style.left = event.x + "px";
			} else {
				toolTip.style.left = (event.x - parseInt(computedStyle.width)) + "px";
			}
			if (event.y > window.innerHeight / 2) {
				toolTip.style.bottom = (window.innerHeight - event.y) + "px";
			} else {
				toolTip.style.bottom = (window.innerHeight - event.y - parseInt(computedStyle.height) - parseInt(computedStyle.paddingTop) * 2 - parseInt(computedStyle.borderTop) * 2) + "px";
			}
		});
		document.addEventListener("contextmenu", function(event) {
			if (event.target.classList.contains("editor-hierarchy-element") || event.target.parentNode.classList.contains("editor-hierarchy-element") || event.target.parentNode.parentNode.classList.contains("editor-hierarchy-element")) {
				let contextMenu = document.getElementById("context-menu");
				contextMenu.style.display = "block";
				contextMenu.style.left = event.x + "px";
				contextMenu.style.top = event.y + "px";
			}
			event.preventDefault();
		}, false);
		document.getElementById("context-menu").addEventListener("click", function(event) {
			if (event.target.innerText === "Delete") {
				if (that.selectedGameObject) {
					if (that.selectedGameObject.constructor.name === "GameObject") {
						that.attachedApplication.sceneManager.getActiveScene().removeGameObject(that.selectedGameObject);
					} else if (that.selectedGameObject.constructor.name === "Camera") {
						that.attachedApplication.sceneManager.getActiveScene().cameraManager.removeCamera(that.selectedGameObject.id);
					} else if (that.selectedGameObject.constructor.name === "Scene") {
						that.attachedApplication.activeScene
					}
				}
			} else if (event.target.innerText === "Clone") {
				if (that.selectedGameObject) {
					that.attachedApplication.sceneManager.getActiveScene().addGameObject(that.selectedGameObject.clone());
				}
			}
			that.selectedGameObject = null;
					that.projectChangedSinceLastCompile = true;
					that.updateHierarchy();
					that.renderApplication();
					that.updateComponentEditor();
					document.getElementById("context-menu").style.display = "none";
		});
		document.addEventListener("click", function(event) {
			let contextMenu = document.getElementById("context-menu");
			if (event.target !== contextMenu && event.target.parentNode !== contextMenu) {
				contextMenu.style.display = "none";
			}
		});
		this.start();
	}
	afterPageLoad() {
		this.colourPicker.init();
		this.lineEditor.init();
		this.hierarchy.generateApplicationHTML(this.attachedApplication);
	}
	updateHierarchy() {
		this.hierarchy.generateApplicationHTML(this.attachedApplication);
	}
	updateComponentEditor() {
		if (this.selectedGameObject) {
			this.componentEditor.update(this.selectedGameObject);
		} else {
			this.componentEditor.hideWindows();
		}
	}
	updateApplicationCode() {
		if (this.attachedApplication.isRunning === false && this.projectChangedSinceLastCompile) {
			this.projectChangedSinceLastCompile = false;
			this.hasUnsavedChanges = true;
			this.previousValidSourceCode = this.project.sourceCode;
			this.project.sourceCode = Compiler.applicationOnInitCode(this.attachedApplication);
		}
	}
	initialiseApplication() {
		this.selectedGameObject = null;
		document.getElementById("editor-console-cursor").innerHTML = "";
		this.attachedApplication.applyOptions(this.project.settings);
		this.attachedApplication.onInit(new Function(this.project.sourceCode));
		let isSuccessFul = false;
		try {
			this.attachedApplication.init();
			isSuccessFul = true;
		} catch (error) {
			this.attachedApplication.onInit(new Function(this.previousValidSourceCode));
			this.attachedApplication.init();
			console.error(error);
		}
		if (isSuccessFul) {
			this.renderApplication();
		}
		this.updateHierarchy();
		this.updateComponentEditor();
	}
	renderApplication(override) {
		if ((this.attachedApplication.isRunning || !override) && this.attachedApplication.sceneManager.getActiveScene().cameraManager.getActiveCamera()) {
			this.editorCamera.getComponent("transform").x = this.attachedApplication.sceneManager.getActiveScene().cameraManager.getActiveCamera().getComponent("transform").x;
			this.editorCamera.getComponent("transform").y = this.attachedApplication.sceneManager.getActiveScene().cameraManager.getActiveCamera().getComponent("transform").y;
			this.attachedApplication.render();
		} else {
			this.attachedApplication.render(override);
		}
	}
	resizeCanvas() {
		/*
		 *	since canvas has 2 width and height properties, in order to look correct
		 *	they both need to be set correctly, however the direct width height uses pixels, not css units
		 *	therefore we must compute the required width and height
		 */
		let canvas = this.attachedApplication.renderer.canvas;
		let computedStyle = window.getComputedStyle(canvas);
		let width = parseInt(computedStyle.getPropertyValue("width"));
		let height = parseInt(computedStyle.getPropertyValue("height"));
		canvas.width = width;
		canvas.height = height;
		this.renderApplication(this.editorCamera);
	}
	/* A function that will close all select boxes in the document, except the current select box */
	closeAllSelect(element) {
		let notSelected = [];
		let selectBoxes = document.getElementsByClassName("select-items");
		let currentlySelectedBox = document.getElementsByClassName("select-selected");
		for (let i = 0; i < currentlySelectedBox.length; i++) {
			if (element === currentlySelectedBox[i]) {
				notSelected.push(i);
			} else {
				currentlySelectedBox[i].classList.remove("select-arrow-active");
			}
		}
		for (let i = 0; i < selectBoxes.length; i++) {
			if (notSelected.indexOf(i)) {
				selectBoxes[i].classList.add("select-hide");
			}
		}
	}
	allowElementToDrag(element) {
		let that = this;
		let dragPosition = new Vector();
		element.getElementsByClassName("draggable-element-header")[0].addEventListener("mousedown", dragMouseDown);

		function dragMouseDown(event) {
			/* get the initial mouse position when the mouse is held down */
			dragPosition = new Vector(event.clientX, event.clientY);
			document.addEventListener("mouseup", closeDragElement);
			document.addEventListener("mousemove", elementDrag);
			/* bring focused window to front */
			that.windowZIndex++;
			element.style.zIndex = that.windowZIndex;
		}

		function elementDrag(event) {
			/* calculate the new cursor position */
			let newPosition = dragPosition.clone();
			newPosition.subtract(event.clientX, event.clientY);
			dragPosition = new Vector(event.clientX, event.clientY);
			let computedStyle = window.getComputedStyle(element);
			/* set the element's new position */
			/* ensure the user does not drag windows out of the screen*/
			element.style.top = Utils.clampRange((element.offsetTop - newPosition.y), 0, window.innerHeight - parseInt(computedStyle.getPropertyValue("height"))) + "px";
			element.style.left = Utils.clampRange((element.offsetLeft - newPosition.x), 0, window.innerWidth - parseInt(computedStyle.getPropertyValue("width"))) + "px";
		}

		function closeDragElement() {
			/* stop dragging when mouse button is released */
			document.removeEventListener("mouseup", closeDragElement);
			document.removeEventListener("mousemove", elementDrag);
		}
	}
	RGBToHEX(rgb) {
		return `#${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1).map(n => parseInt(n, 10).toString(16).padStart(2, "0")).join("")}`;
	}
	mainLoop() {
		if (this.isRunning) {
			/* prevent the moving of the camera if a text object is focused */
			if (this.attachedApplication.isRunning === false && document.activeElement.id === "body") {
				let keyHappened = false;
				let units = 5 / this.attachedApplication.renderer.pixelsPerUnit;
				if (this.attachedApplication.inputs.keys.getKeyDown("arrowUp")) {
					this.editorCamera.getComponent("transform").up(units);
					keyHappened = true;
				}
				if (this.attachedApplication.inputs.keys.getKeyDown("arrowDown")) {
					this.editorCamera.getComponent("transform").down(units);
					keyHappened = true;
				}
				if (this.attachedApplication.inputs.keys.getKeyDown("arrowLeft")) {
					this.editorCamera.getComponent("transform").left(units);
					keyHappened = true;
				}
				if (this.attachedApplication.inputs.keys.getKeyDown("arrowRight")) {
					this.editorCamera.getComponent("transform").right(units);
					keyHappened = true;
				}
				if (keyHappened) {
					this.renderApplication(this.editorCamera);
				}
			}
			/* UI updates once every 200ms for performance */
			if (this.accumulator > 200) {
				this.updateComponentEditor();
				this.accumulator = 0;
			}
			let now = Date.now();
			this.accumulator += now - this.previous;
			this.previous = now;
			requestAnimationFrame(this.mainLoop.bind(this));
		}
	}
	start() {
		this.isRunning = true;
		this.renderApplication();
		this.mainLoop();
	}
	stop() {
		this.isRunning = false;
	}
}