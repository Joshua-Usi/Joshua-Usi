const Compiler = (function() {
	"use strict";
	return {
		gameObjectToCode: function(scene, gameObject) {
			/* generate javascript code indentifiers */
			let newId = this.createValidJavascriptIdentifier(gameObject.id);
			let sceneId = this.createValidJavascriptIdentifier(scene.id);
			let componentString = "";
			/* loop through all components within the gameobject and generate code strings */
			for (let component in gameObject.components) {
				/* ensure the property isn't part of the prototype */
				if (gameObject.components.hasOwnProperty(component)) {
					componentString += "\t" + this.componentToCode(gameObject, gameObject.components[component], sceneId) + "\n";
				}
			}
			/* return final code string */
			return `let ${sceneId}_${newId} = new GameObject("${gameObject.id}");
		${componentString}
		${sceneId}.addGameObject(${sceneId}_${newId});
		`;
		},
		cameraToCode: function(scene, camera) {
			/* generate javascript code indentifiers */
			let newId = this.createValidJavascriptIdentifier(camera.id);
			let sceneId = this.createValidJavascriptIdentifier(scene.id);
			let componentString = "";
			/* loop through all camera components*/
			for (let component in camera.components) {
				/* ensure the property isn't part of the prototype */
				if (camera.components.hasOwnProperty(component)) {
					componentString += "\t" + this.componentToCode(camera, camera.components[component], sceneId) + "\n";
				}
			}
			return `let ${sceneId}_${newId} = new Camera("${camera.id}");
		${componentString}
		${sceneId}.cameraManager.addCamera(${sceneId}_${newId});
		`;
		},
		componentToCode: function(object, component, sceneId) {
			/* generate javascript code indentifiers */
			let objectId = sceneId + "_" + this.createValidJavascriptIdentifier(object.id);
			/* switch between specific code snippets for different components */
			switch (component.name) {
				case "transform": {
					return `${objectId}.addComponent(new Components.Transform(${component.x}, ${component.y}, ${component.rotation}, ${component.scaleX}, ${component.scaleY}));`;
				}
				case "renderer": {
					/* switch between different types of renderers */
					switch (component.type) {
						case "mesh": {
							let code = `let ${objectId}_mesh_renderer = new Components.MeshRenderer("${component.shape}", "${component.fillColour}", "${component.strokeColour}")
							${objectId}.addComponent(${objectId}_mesh_renderer);`
							if (component.texture != null && component.texture instanceof Image) {
								component.texturePath = component.texturePath.replace("data/", "");
								code += `\n${objectId}_mesh_renderer.setTexture("data/${component.texturePath}")`;
							} else if (component.texture !== null && component.texture instanceof Image === false) {
								throw new Error("Compile Error: the set texture cannot be compiled as it is not an image");
							}
							return code;
						}
						/* ideally components would be added in 1 line, however that can be a problem */
						case "text": {
							let identifier = `${objectId}_${component.name}`;
							/* in case of multiline text */
							return `let ${identifier} = new Components.TextRenderer(\`${component.text}\`, "${component.fillColour}", "${component.strokeColour}");
				${identifier}.setProperties("${component.style}", "${component.variant}", "${component.weight}", ${component.size}, "${component.font}", "${component.alignment}");
				${objectId}.addComponent(${identifier});`;
						}
						case "line": {
							let identifier = `${objectId}_${component.name}`;
							return `let ${identifier} = new Components.LineRenderer("${component.fillColour}", "${component.strokeColour}");
							${identifier}.setProperties(${component.strokeWidth}, "${component.lineCap}", "${component.lineJoin}", ${component.fill});
							${objectId}.addComponent(${identifier});`;
						}
						/* if a code generator does not exist for a particular component, then throw an error */
						default: {
							throw new Error(`Compile Error: no code generator exists for ${component.name}.${component.type}`);
						}
					}
					break;
				}
				case "rigidbody": {
					/* switch between different types of rigidbodies*/
					switch (component.type) {
						case "circle": {
							return `${objectId}.addComponent(new Components.CircleRigidbody(${component.velocityX}, ${component.velocityY}, ${component.accelerationX}, ${component.accelerationY}, ${component.density}, ${component.restitution}, ${component.isColliding}, ${component.isStatic}));`;
						}
						case "rectangle": {
							return `${objectId}.addComponent(new Components.RectangleRigidbody(${component.velocityX}, ${component.velocityY}, ${component.accelerationX}, ${component.accelerationY}, ${component.density}, ${component.restitution}, ${component.isColliding}, ${component.isStatic}));`;
						}
						case "line": {
							return `${objectId}.addComponent(new Components.LineRigidbody());`;
						}
						/* if a code generator does not exist for a particular component, then throw an error */
						default: {
							throw new Error(`Compile Error: no code generator exists for ${component.name}.${component.type}`);
						}
					}
					break;
				}
				case "behaviour-script": {
					return `${objectId}.addComponent(new Components.BehaviourString(\`${component.script}\`));`;
				}
				case "line": {
					let vectorOutput = "[";
					for (let i = 0; i < component.points.length; i++) {
						vectorOutput += `new Vector(${component.points[i].x}, ${component.points[i].y}), `;
					}
					vectorOutput += "]";
					return `${objectId}.addComponent(new Components.Line(${vectorOutput}, ${component.connectEnds}))`;
				}
				/* if a code generator does not exist for a particular component, then throw an error */
				default: {
					/* ignore behaviours, they aren't to be compiled */
					let ignore = ["behaviour", ];
					if (ignore.includes(component.name) === false) {
						throw new Error(`Compile Error: no code generator exists for ${component.name}`);
					}
				}
			}
		},
		sceneToCode: function(scene) {
			/* generate javascript code indentifiers */
			let newId = this.createValidJavascriptIdentifier(scene.id);
			let gameObjectString = "";
			/* loop through objects and generate code */
			for (let i = 0; i < scene.objects.length; i++) {
				gameObjectString += this.gameObjectToCode(scene, scene.objects[i]);
			}
			let cameraString = "";
			/* loop through cameras and generate code*/
			for (let camera in scene.cameraManager.cameras) {
				/* ensure the property isn't part of the prototype */
				if (scene.cameraManager.cameras.hasOwnProperty(camera)) {
					cameraString += this.cameraToCode(scene, scene.cameraManager.cameras[camera]);
				}
			}
			return `let ${newId} = new Scene("${scene.id}");
			
			${gameObjectString}
			
			${cameraString}

			this.sceneManager.addScene(${newId});`;
		},
		applicationOnInitCode: function(application) {
			/* loop through all scenes and generate code strings */
			let sceneString = "";
			for (let scene in application.sceneManager.scenes) {
				/* ensure the property isn't part of the prototype */
				if (application.sceneManager.scenes.hasOwnProperty(scene)) {
					sceneString += this.sceneToCode(application.sceneManager.scenes[scene]);
				}
			}
			/* ensure a scene is active first before compiling, otherwise an error will occur*/
			if (application.sceneManager.activeScene) {
				let activeSceneId = this.createValidJavascriptIdentifier(application.sceneManager.activeScene);
				return `${sceneString}
			${activeSceneId}.cameraManager.switchToCamera("${application.sceneManager.getActiveScene().cameraManager.activeCamera}");	
			this.sceneManager.switchToScene("${application.sceneManager.activeScene}");`;
			} else {
				throw new Error("Cannot Compile: no active scene");
			}
		},
		/* main 1 does all function, used in the downloader */
		applicationToCode: function(application, project) {
			return `let Program = new Application("editor-canvas-element", ${JSON.stringify(project.settings)});
		Program.onInit(${new Function(this.applicationOnInitCode(application))});
		Program.init();
		Program.start();`;
		},
		/* generates valid javascript identifiers given an object id */
		createValidJavascriptIdentifier: function(id) {
			/* replace spaces with underscores */
			id = id.replaceAll(" ", "_");
			/* replace braces such as those found in cloned objects */
			id = id.replaceAll(/[/(/)]/g, "_");
			/* check if it is a valid identifier using a regex */
			let matchedId = id.match(/[a-zA-Z_$][0-9a-zA-Z_$]*/g);
			/* 
			 *	if a valid identifier could not be created, generate a random but always valid 16 character string
			 *	should be safe as the chances of strings being the same are extremely rare
			 */
			if (matchedId === null) {
				return Utils.randomAlphaNumericString(1) + Utils.randomString(15);
			}
			return matchedId.join("");
		},
	};
})();