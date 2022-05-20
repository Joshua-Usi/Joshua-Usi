class GameObject {
	constructor(id) {
		this.attachedScene = null;
		/* unique identifier for getting and finding */
		this.id = id;
		/* default properties of gameobjects */
		this.components = {};
		/* used to ensure clones have individual id's */
		this.clones = 0;
	}
	removeComponent(componentName) {
		delete this.components[componentName];
	}
	addComponent(component) {
		this.components[component.name] = component;
		component.parent = this;
	}
	getComponent(name) {
		if (this.components[name]) {
			return this.components[name];
		}
		return null;
	}
	hasComponent(name) {
		return this.components.hasOwnProperty(name);
	}
	/* deep clones and creates a full, new instance of an object */
	clone() {
		this.clones++;
		/* create the clone and add the id */
		let clone = new GameObject(this.id + ` (${this.clones})`);
		/* loop through all the components and create copies */
		for (let component in this.components) {
			if (this.components.hasOwnProperty(component)) {
				let componentClass = this.components[component].constructor.name;
				let newComponent = new Components[componentClass]();
				/* loop through all the properties in each component */
				for (let property in this.components[component]) {
					if (this.components[component].hasOwnProperty(property)) {
						newComponent[property] = this.components[component][property];
					}
				}
				clone.addComponent(newComponent);
			}
		}
		return clone;
	}
}
/* a camera is technically considered a game object, however, it does not require a mesh renderer */
class Camera extends GameObject {
	/* rotation in radians, clockwise with 0 being straight upwards */
	constructor(id, x = 0, y = 0, rotation = 0) {
		super(id);
		/* the camera does not have a mesh renderer, as such it uses different components */
		this.components = {};
		this.followWithRotation = false;
		/* a reference to a gameobject instructing the camera to follow */
		this.objectoFollow = null;
		this.followOffsetX = 0;
		this.followOffsetY = 0;
	}
	/* follow objects set the center of the object to the camera position causing the camera to follow the object */
	followObject(object, offsetX, offsetY) {
		if (offsetX === undefined) {
			offsetX = 0;
		}
		if (offsetY === undefined) {
			offsetY = 0;
		}
		this.followWithRotation = false;
		this.objectoFollow = object;
		this.followOffsetX = offsetX;
		this.followOffsetY = offsetY;
	}
	/* same as followObject but matches the rotation of the object*/
	followObjectWithRotation(object, offsetX, offsetY) {
		if (offsetX === undefined) {
			offsetX = 0;
		}
		if (offsetY === undefined) {
			offsetY = 0;
		}
		this.followWithRotation = true;
		this.objectoFollow = object;
		this.followOffsetX = offsetX;
		this.followOffsetY = offsetY;
	}
	stopFollow() {
		/* reset values when stop following */
		this.objectoFollow = null;
		this.followWithRotation = false;
		this.followOffsetX = 0;
		this.followOffsetY = 0;
	}
	followPosition(x, y) {
		this.followOffsetX = x;
		this.followOffsetY = y;
	}
	update() {
		/* runs if the camera is following an object */
		if (this.objectoFollow !== null) {
			let transform = this.getComponent("transform");
			let followTransform = this.objectoFollow.getComponent("transform");
			transform.x = followTransform.x;
			transform.y = followTransform.y;
			if (this.followWithRotation) {
				transform.rotation = -followTransform.rotation;
			}
		}
	}
}