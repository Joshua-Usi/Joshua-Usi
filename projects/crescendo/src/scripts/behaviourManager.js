class BehaviourManager {
	constructor() {
		/* list of behaviours */
		this.behaviours = [];
	}
	addBehaviour(behaviour) {
		this.behaviours.push(behaviour);
	}
	/* removes behaviour by a given object */
	removeBehaviour(gameObject) {
		for (let i = 0; i < this.behaviours.length; i++) {
			if (this.behaviours[i].parent === gameObject) {
				this.behaviours.splice(i, 1);
				break;
			}
		}
	}
	/* broadcasts an event to all behaviours within the class */
	broadcastEvent(eventName) {
		/* loop over all behaviours */
		for (let i = 0; i < this.behaviours.length; i++) {
			this.behaviours[i].runEvent(eventName);
		}
	}
}