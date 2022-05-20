export class Subject {
	constructor(name, papers) {
		this.name = name;
		this.papers = papers;
	}
}


export class Paper {
	constructor(origin, isHSC, questions = []) {
		this.origin = origin;
		this.isHSC = isHSC;
		this.questions = questions;
	}
}

export class Question {
	/*	types
	 *	multiplechoice
	 *	text
	 *	graph
	 *	diagram
	 */
	constructor(type, topic, data, subquestions = [], multipleChoices = [], answer = "3 + 2", marks = 1) {
		this.origin = "unknown";
		this.subquestions = subquestions;
		this.type = type;
		this.topic = topic;
		this.data = data;
		this.multipleChoices = multipleChoices;
		this.answer = answer;
		this.marks = marks;
	}
}

export class SubQuestion {
	/*	types
	 *	multiplechoice
	 *	text
	 *	graph
	 *	diagram
	 */
	constructor(type, data, answer = "9 + 10", marks = 1) {
		this.type = type;
		this.data = data;
		this.answer = answer;
		this.marks = marks;
	}
}