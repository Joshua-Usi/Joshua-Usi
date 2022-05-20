class ComponentEditorUI {
	hideWindows() {
		/* find all editor component windows and hide them */
		let windows = document.getElementsByClassName("window-no-style");
		for (let i = 0; i < windows.length; i++) {
			windows[i].style.display = "none";
		}
	}
	showComponentWindows(gameObject) {
		for (let component in gameObject.components) {
			/* ensure it is not a prototype and the element exists */
			if (gameObject.components.hasOwnProperty(component)) {
				/* check if a GUI exists for a component */
				if (document.getElementById(component + "-editor")) {
					/* get and show the component window */
					let componentWindow = document.getElementById(component + "-editor");
					componentWindow.style.display = "block";
					/* if components have different sub-types then rename the window */
					if (gameObject.components[component].type) {
						componentWindow.getElementsByClassName("component-editor-component-name")[0].textContent = Utils.capitaliseFirstLetter(gameObject.components[component].type) + " " + component;
					}
					/* loop through all elements */
					let elements = componentWindow.getElementsByClassName("fixed-height");
					for (let i = 0; i < elements.length; i++) {
						elements[i].style.display = "none";
					}
					/* loop through all datavalues */
					for (let property in gameObject.components[component]) {
						/* ensure datavalues is not part of prototype */
						if (gameObject.components[component].hasOwnProperty(property)) {
							let element = document.getElementById(`${component}_${Utils.camelCaseToDash(property)}`);
							/* ignore values that do not have a ui element */
							if (element === null) {
								/* however name and parent do not have UI elements and will be ignored */
								if (["name", "parent", "texturePath"].includes(property) === false) {
									console.warn(`No UI element for ${component}.${property}`);
								}
								continue;
							}
							element.parentNode.parentNode.style.display = "block";
						}
					}
				} else {
					/* ignore behaviours, they aren't to be compiled */
					let ignore = [
						"behaviour",
					];
					if (ignore.includes(component) === false) {
						console.warn("No GUI for " + component);
					}
				}
			}
		}
	}
	update(gameObject) {
		for (let component in gameObject.components) {
			/* ensure it is not a prototype and the element exists */
			if (gameObject.components.hasOwnProperty(component)) {
				for (let property in gameObject.components[component]) {
					if (gameObject.components[component].hasOwnProperty(property)) {
						/* switch between different case types, since each types requires a different method to setting values */
						let element = document.getElementById(`${component}_${Utils.camelCaseToDash(property)}`);
						/* ignore values that do not have a ui element*/
						if (element === null) {
							continue;
						}
						if (document.activeElement !== element) {
							switch (typeof(gameObject.components[component][property])) {
								case "string": {
									/* strings can either be a part of select-boxes, background colours or input boxes */
									/* this part determines what version to use */
									if (element.classList.contains("select-box")) {
										element.getElementsByClassName("select-selected")[0].textContent = gameObject.components[component][property];
									} else if (gameObject.components[component][property][0] === "#" || gameObject.components[component][property] instanceof CanvasGradient) {
										element.style.background = gameObject.components[component][property];
									} else {
										element.value = gameObject.components[component][property];
									}
									break;
								}
								/* numbers use input boxes */
								case "number": {
									/* round to 4 dp */
									element.value = Utils.roundDecimals(gameObject.components[component][property], 4);
									break;
								}
								/* booleans use checkmarks */
								case "boolean": {
									element.checked = gameObject.components[component][property];
									break;
								}
							}
						}
					}
				}
			}
		}
	}
}