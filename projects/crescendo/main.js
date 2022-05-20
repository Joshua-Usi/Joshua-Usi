/* major versions, incremented when API has breaking changes, also incremented on project release */
const MAJOR_VERSION = 0;
/* minor versions, usually incremented whenever a medium feature is added */
const MINOR_VERSION = 1;
/* patch versions such as bug fixes or minor additions */
const PATCH_VERSION = 0;
/* build metadata */
const BUILD_METADATA = "a";
const version = `Crescendo v${MAJOR_VERSION}.${MINOR_VERSION}.${PATCH_VERSION}${BUILD_METADATA}`;
/* set all elements with this class to have the version text */
let versionElements = document.getElementsByClassName("version-number");
for (let i = 0; i < versionElements.length; i++) {
	versionElements[i].textContent = version;
}

function showWindow(id) {
	document.getElementById(id).style.display = "block";
}
function hideWindow(id) {
	document.getElementById(id).style.display = "none";	
}
function showLoadingScreen(text) {
	if (text) {
		document.getElementById("loading-screen-text").innerText = text;	
	}
	document.getElementById("page-state-loading-screen").style.opacity = 1;
	document.getElementById("page-state-loading-screen").style.pointerEvents = "auto";
}

function hideLoadingScreen() {
	document.getElementById("page-state-loading-screen").style.opacity = 0;
	document.getElementById("page-state-loading-screen").style.pointerEvents = "none";
}
/*
 *	hide the loading screen after page has loaded 
 *	loading screen is used to prevent elements looking out of place
 */
window.addEventListener("load", function() {
	hideLoadingScreen();
	gui.afterPageLoad();
})

let Program = new Application("editor-canvas-element");
/* create and initialise the gui */
let gui = new CrescendoGUI(Program);
gui.init();