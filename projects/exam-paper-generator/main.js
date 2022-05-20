import {data} from "./dataset.js"

String.prototype.toTitleCase = function() {
  return this.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

let uniques = {
	subjects: {},
	papers: {},
	styles: {"HSC": 1, "Prelim": 1},
	topics: {},
}
for (let i = 0; i < data.subjects.length; i++) {
	for (let j = 0; j < data.subjects[i].papers.length; j++) {
		for (let k = 0; k < data.subjects[i].papers[j].questions.length; k++) {
			data.subjects[i].papers[j].questions[k].origin = data.subjects[i].papers[j].origin;
		}
	}
}

/* determine how many topics there are */
let allQuestions = [];
let uniqueQuestions = {};
let uniquePapers = {};
for (let i = 0; i < data.subjects[0].papers.length; i++) {
	uniquePapers[data.subjects[0].papers[i].origin] = 1;
	for (let j = 0; j < data.subjects[0].papers[i].questions.length; j++) {
		uniqueQuestions[data.subjects[0].papers[i].questions[j].topic] = 1;
		allQuestions.push(data.subjects[0].papers[i].questions[j]);
	}
}
for (let key in uniqueQuestions) {
	document.getElementById("topics-container").innerHTML += generateCheckboxHTML(key.toTitleCase(), "question-types");
}
for (let key in uniquePapers) {
	document.getElementById("papers-container").innerHTML += generateCheckboxHTML(key, "paper-names");
}

function generateQuestionHTML(number, question, isSubQuestion = false) {
	let subQuestionHTML = "";
	if (question.subquestions) {
		for (let i = 0; i < question.subquestions.length; i++) {
			subQuestionHTML += generateQuestionHTML(i, question.subquestions[i], true);
		}
	}
	let multipleChoiceAnswers = "";
	if (question.type === "multiplechoice") {
		for (let i = 0; i < question.multipleChoices.length; i++) {
			multipleChoiceAnswers += `<li>${question.multipleChoices[i]}</li>`
		}
	}
	return `<li>
					<p>${question.data}</p>
					${(isSubQuestion === false) ? `<b>From: ${question.origin}</b>` : ""}
					${(isSubQuestion === false) ? `<b>Topic: ${question.topic.toTitleCase()}</b>` : ""}
					${(subQuestionHTML.length > 0) ? `<ol type="a">${subQuestionHTML}<ol>` : ""}
					${(question.type === "multiplechoice") ? `<ol type="A">${multipleChoiceAnswers}<ol>` : ""}
				</li>
	`;
	// ${(question.type === "graph") ? `<div style="display:flex;justify-content:center;"><img src="./graph-template.png" style="width: 50vw; height: 50vw;"></div>` : ""}
	return ;
}

function generateQuestionAnswerHtml() {

}


function generateCheckboxHTML(name, className) {
	return `<div>
				<input name="${name}" checked type="checkbox" class="${className}">
				<label >${name}</label>
			</div>`;
}

document.getElementById("all-questions-count").textContent = `All (${allQuestions.length} questions)`

document.getElementById("close-btn").addEventListener("click", function(event) {
	document.getElementById("open-settings").style.display = "block";
	document.getElementById("paper-settings").style.display = "none";
});

document.getElementById("open-settings").addEventListener("click", function(event) {
	document.getElementById("open-settings").style.display = "none";
	document.getElementById("paper-settings").style.display = "block";
});

document.getElementById("generate-paper").addEventListener("click", function(event) {
	let types = document.getElementsByClassName("question-types");
	let papers = document.getElementsByClassName("paper-names");
	let selectedTopics = [];
	for (let i = 0; i < types.length; i++) {
		if (types[i].checked) {
			selectedTopics.push(types[i].name.toLowerCase());
		}
	}
	let selectedPapers = [];
	for (let i = 0; i < papers.length; i++) {
		if (papers[i].checked) {
			selectedPapers.push(papers[i].name);
		}
	}
	console.log(selectedTopics);
	console.log(selectedPapers);


	document.getElementById("questions-container").innerHTML = "";
	let pool = allQuestions.slice();
	let questionCount = document.querySelector("input[name=paper-length]:checked").value;
	if (questionCount === "all") {
		questionCount = pool.length;
	} else {
		questionCount = parseInt(questionCount);
	}
	if (questionCount > pool.length) {
		console.warn("Not enough questions to fulfill requested amount");
		questionCount = pool.length;
	}
	for (let i = 0; i < questionCount; i++) {
		// let randomInt = Math.floor(Math.random() * pool.length);
		let randomInt = 0;
		let question = pool[randomInt];
		if (selectedTopics.includes(question.topic) && selectedPapers.includes(question.origin)) {
			let html = generateQuestionHTML(i, question);
			pool.splice(randomInt, 1);
			let element = document.getElementById("questions-container");
			element.innerHTML += html;
		}
	}
	document.getElementById("exam-paper").style.display = "block";
	MathJax.typeset();
});