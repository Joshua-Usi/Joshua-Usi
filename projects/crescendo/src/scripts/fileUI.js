class FileUI {
	constructor(id, id2) {
		this.element = document.getElementById(id);
		this.secondaryElement = document.getElementById(id2);
	}
	generateFileHtml(fileSystem, useSecondary) {
		let output = "";
		for (var i = 0; i < fileSystem.files.length; i++) {
			let imageSrc = "./src/images/default-file-icon.png";
			if (fileSystem.files[i].type.includes("image")) {
				imageSrc = `data:${fileSystem.files[i].type};base64,${fileSystem.files[i].data}`;
			} else if (fileSystem.files[i].type.includes("audio")) {
				imageSrc = "./src/images/audio-file-icon.png";
			}
			output += `<div class="file-icon" draggable="true">
				<img src="${imageSrc}">
				<div style="text-align: center;">${fileSystem.files[i].name}</div>
			</div>`;
		}
		if (useSecondary) {
			this.secondaryElement.innerHTML = output;
		} else {
			this.element.innerHTML = output;
		}
	}
}