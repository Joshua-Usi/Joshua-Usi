export class ComplexNumber {
	constructor(real, imaginary) {
		this.a = real;
		this.b = imaginary;
	}
	add(complexNumber) {
		this.a += complexNumber.a;
		this.b += complexNumber.b;
	}
	multiply(complexNumber) {
		let a1 = this.a;
		let b1 = this.b
		let a2 = complexNumber.a
		let b2 = complexNumber.b;
		this.a = a1 * a2 - b2 * b1;
		this.b = a1 * b2 + b1 * a2;
	}
	square() {
		let a = this.a ** 2 - this.b ** 2;
		let b = 2 * this.a * this.b;
		this.a = a;
		this.b = b;
	}
	distance() {
		return Math.sqrt(this.a ** 2 + this.b ** 2);
	}
	distanceSquared() {
		return this.a ** 2 + this.b ** 2;
	}
	clone() {
		return new ComplexNumber(this.a, this.b);
	}
	set(a, b) {
		this.a = a;
		this.b = b;
	}
}
