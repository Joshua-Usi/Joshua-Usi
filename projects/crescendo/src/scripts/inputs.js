class Inputs {
	constructor(mouseElementId, keyboardElementId) {
		this.mouse = new MouseInputs(mouseElementId);
		this.keys = new KeyInputs(keyboardElementId);
	}
	init() {
		this.mouse.init();
		this.keys.init();
	}
	/* 
	 *	although not used much as the application will most likely instantiate only 1 input class
	 *	it is useful incase as it will destroy past event listeners preventing leaks
	 */
	destroy() {
		this.mouse.destroy();
		this.keys.destroy();
	}
}