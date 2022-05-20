class MouseInputs {
	constructor(id) {
		/* the element the mouse is attached to */
		this.element = document.getElementById(id);
		this.position = new Vector(0, 0);
		this.isLeftButtonDown = false;
		this.allowRightClick = true;

		/* outer referencing */
		let that = this;
		this.mousemove = function(event) {
			/* center the mouse position relative to center of screen */
			let computedStyle = window.getComputedStyle(that.element);
			that.position = new Vector(event.offsetX - Math.round(parseInt(computedStyle.getPropertyValue("width")) / 2), event.offsetY - Math.round(parseInt(computedStyle.getPropertyValue("height")) / 2));
		};
		this.mousedown = function(event) {
			that.isLeftButtonDown = true;
		};
		this.mouseup = function(event) {
			that.isLeftButtonDown = false;
		};
		this.contextmenu = function(event) {
			if (that.allowRightClick === false) {
				event.preventDefault();
				return false;
			}
		};
	}
	emulateClick() {
		this.isLeftButtonDown = true;
	}
	emulateUnClick() {
		this.isLeftButtonDown = false;
	}
	init() {
		this.element.addEventListener("mousemove", this.mousemove);
		this.element.addEventListener("mousedown", this.mousedown);
		this.element.addEventListener("mouseup", this.mouseup);
		this.element.addEventListener("contextmenu", this.contextmenu);
	}
	/* 
	 *	although not used much as the application will most likely instantiate only 1 input class
	 *	it is useful incase as it will destroy past event listeners preventing leaks
	 */
	destroy() {
		this.element.removeEventListener("mousemove", this.mousemove);
		this.element.removeEventListener("mousedown", this.mousedown);
		this.element.removeEventListener("mouseup", this.mouseup);
		this.element.removeEventListener("contextmenu", this.contextmenu);	
	}
}