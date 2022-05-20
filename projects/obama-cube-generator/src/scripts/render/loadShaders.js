class ShaderSet {
	constructor(vertexName, fragmentName) {
		this.vertexPromise = fetch(vertexName);
		this.fragmentPromise = fetch(fragmentName);
		this.vertexData = "";
		this.fragmentData = "";
		this.loadedCount = 0;
		let that = this;
		this.vertexPromise.then(async function(data) {
			that.loadedCount++;
			that.vertexData = await data.text();
		});
		this.fragmentPromise.then(async function(data) {
			that.loadedCount++;
			that.fragmentData = await data.text();
		});
	}
	isDone() {
		if (this.loadedCount >= 2) {
			return true;
		}
		return false;
	}
	getVertex() {
		return this.vertexData;	
	}
	getFragment() {
		return this.fragmentData;
	}
}

export function loadShaders(vertexName, fragmentName) {
	return new ShaderSet(vertexName, fragmentName)
}