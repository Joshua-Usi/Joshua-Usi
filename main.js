function map(num, numMin, numMax, mapMin, mapMax) {
	return mapMin + ((mapMax - mapMin) / (numMax - numMin)) * (num - numMin)
}

class Project {
	constructor(name, details, imageSrc, link) {
		this.name = name;
		this.details = details;
		this.imageSrc = imageSrc;
		this.link = link;
	}
	generateProjectCard() {
		return `<div class="project-card">
				<div class="project-card-section">
					<a href="${this.link}"><img class="project-card-preview" src="${this.imageSrc}"></a>
				</div>
				<div class="project-card-section" style="padding-left: 1vw; max-width: calc(100% - 25vh - 2vw);">
					<p class="project-card-title"><b>${this.name}</b></p>
					<span class="project-card-details">${this.details}</span>
				</div>
			</div>`;
	}
}

let projects = [
	new Project("osw!", "A browser based osu! client written from the ground up", "./src/imgs/osw.png", "https://github.com/Joshua-Usi/osw"),
	new Project("Crescendo", "A 2D proof-of-concept game engine written in 8 weeks for HSC major work", "./src/imgs/crescendo-logo.png", "./projects/crescendo/index.html"),
	new Project("Kahoot speed keys", "A chrome browser extension designed for quality of life use in Kahoot.it games", "./src/imgs/kahoot-speed-keys.png", "https://github.com/Joshua-Usi/Kahoot-Speed-Keys"),
	new Project("Exam paper generator", "Generates exam papers that can be saved as PDFs from a question bank", "./src/imgs/exam-paper-generator.png", "./projects/exam-paper-generator/index.html"),
	new Project("Crescendo3D (unpublished)", "A 3D rendering framework / engine in development", "./src/imgs/crescendo-logo.png", ""),
	new Project("Physics engine V8", "#8. A basic hyper-optimised physics engine using webgl. Employs frustum culling and broadphase grid sorting to support well over 5000 objects", "./src/imgs/physics-engine.png", "./projects/hyper-optimised-physics-engine/index.html"),
	new Project("Xi Jinping (unpublished)", "A discord.py bot that manages swearing and banned words in discord servers using a credit-based system", "./src/imgs/xi-jinping.png", ""),
	new Project("Fishing bot (unpublished)", "A discord.py bot that uses modern slash commands for chill fishing with friends", "./src/imgs/fishing-bot.png", ""),
	new Project("Project Murder (unpublished)", "A python program that manages participants in a game of targets and assassinations that automatically sends emails containing their targets using smtp", "./src/imgs/crescendo-logo.png", ""),
	new Project("P6.js (unpublished)", "Inspired by P5.js, It was the first ever framework I built. Includes an extendable Plugin system", "./src/imgs/p6.png", ""),
	new Project("screensavers (unpublished)", "A set of javascript screensavers to leave your computer on", "./src/imgs/starfield.png", ""),
	new Project("Inertia GUI", "A solver for the Inertia problem that includes realtime solving and path discarding", "./src/imgs/inertia-astronaut.png", "./projects/inertia/index.html"),
	new Project("Mandelbrot Generator", "A generator for beautiful mandelbrot sets. Switches between GPU and CPU rendering if required. Highly optimised", "./src/imgs/mandelbrot.png", "./projects/mandelbrot/index.html"),
	new Project("Obama cube generator", "Base on a popular meme a long time ago. Generate rotating cubes using images or videos and allows you to save them as a video file", "./src/imgs/obama-cube.png", "./projects/obama-cube-generator/index.html"),
];

let container = document.getElementById("project-card-container");
let html = "";
for (let i = 0; i < projects.length; i++) {
	html += projects[i].generateProjectCard();
}
container.innerHTML += html;

function fillMeters() {
	let meters = document.getElementsByClassName("custom-meter");
	for (let i = 0; i < meters.length; i++) {
		let style = `width: ${map(parseInt(meters[i].getAttribute("value")), parseInt(meters[i].getAttribute("min")), parseInt(meters[i].getAttribute("max")), 0, 100)}%;`;
		if (parseInt(meters[i].getAttribute("value")) < parseInt(meters[i].getAttribute("low"))) {
			style += " background: #da0037";
		} else if (parseInt(meters[i].getAttribute("value")) > parseInt(meters[i].getAttribute("high"))) {
			style += " background: #009944";
		} else {
			style += " background: #eeaa00";
		}
		meters[i].innerHTML = `<span class="custom-meter-inner" style="${style}">${meters[i].getAttribute("value")}%<span>`;
	}
}

fillMeters();