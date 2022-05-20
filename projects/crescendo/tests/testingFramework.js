class Lotus {
	constructor (func, functionArguments = [], not = false, bindedThis) {
		this.func = func;
		this.functionArguments = functionArguments;
		this.flip = not;
		if (not === false) {
			this.not = new Lotus(func, functionArguments, true, bindedThis);
		}
		this.bindedThis = bindedThis;
	}
	getType() {
		switch (typeof(this.func)) {
			case "function": return this.func.bind(this.bindedThis)(...this.functionArguments);
			default: return this.func;
		}
	}
	assert(bool, value) {
		let useName = "Anonymous";
		if (this.func.name) {
			useName = this.func.name;
		}
		if (this.flip) {
			bool = !bool;
		}
		if (bool) {
			console.log(`%cpassed: ${useName}`, "color: #0f0");
		} else {
			console.error(`failed: ${useName}`);
		}
		let tables = document.querySelectorAll("table");
		let table = tables[tables.length - 1];
		let args = [];
		for (var i = 0; i < this.functionArguments.length; i++) {
			args.push(this.functionArguments[i]);
		}
		let output = (value === "Error") ? "Error" : this.getType();
		if (typeof(output) === "object") {
			output = JSON.stringify(output);
		}
		if (typeof(value) === "object") {
			value = JSON.stringify(value);
		}
		let tr = document.createElement("tr");
		let td = document.createElement("td");
		td.innerText = useName;
		td.style.width = "10%"
		let td2 = document.createElement("td");
		td2.innerText = args;
		let td3 = document.createElement("td");
		td3.innerText = value;
		let td4 = document.createElement("td");
		td4.innerText = output;
		td4.style.background = bool ? "#009944" : "#da0037";
		tr.appendChild(td);
		tr.appendChild(td2);
		tr.appendChild(td3);
		tr.appendChild(td4);
		table.appendChild(tr);
	}
	equals(value) {
		this.assert(this.getType() === value, value);
	}
	/* more strict equals */
	toBe(value) {
		this.assert(JSON.stringify(this.getType()) === JSON.stringify(value), value);
	}
	toBeDefined() {
		this.assert(this.getType() !== undefined, "Not undefined");
	}
	toBeFinite() {
		this.assert(isFinite(this.getType()), (this.flip) ? Infinity : "Finite");
	}
	toBeNumber() {
		this.assert(isNaN(this.getType()) === false, (this.flip) ? NaN : "Number");
	}
	toMatch(regex) {
		this.assert(this.getType().match(regex) !== null, value);	
	}
	toError() {
		try {
			this.getType();
			this.assert(false, "Non Error");
		} catch (e) {
			this.assert(true, "Error");
		}
	}
	timeTaken() {
		let now = window.performance.now();
		this.getType();
		console.log(`time taken for ${useName}: ${window.performance.now() - now}`);
	}
}


class Suite {
	constructor(description, func) {
		document.querySelector("body").innerHTML += (`<h2>${description}</h2>`);
		func();
	}
}

function expect(func, bindedThis) {
	return new Expectation(func, bindedThis);
}

class Expectation extends Lotus {
	constructor(func, bind) {
		super();
		this.bind = bind;
		this.func = func;
	}
	withArguments() {
		return new Lotus(this.func, arguments, false, this.bind);
	}
}

function it(description, func) {
	document.querySelector("body").innerHTML += (`<h3>it ${description}</h3>`);
	document.querySelector("body").innerHTML += (`<table>
		<tr>
			<th style="width: 10%;">Function Name</th>
			<th>Arguments</th>
			<th>Expected output</th>
			<th>Output</th>
		</tr>
	</table>`);
	console.log(`it ${description}`);
	func();
}