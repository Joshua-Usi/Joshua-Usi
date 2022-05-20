/* file manager used to interface between the users files and the program, is also usable with a virtual file system */
const FileManager = (function() {
	/* internal, private variables specifying if the manager should read from a virtual file system */
	let useVirtualFileSystem = false;
	let virtualFileSystem = null;
	return {
		/* set's the manager into a state where it should read from the virtual file system */
		useVirtualFileSystem: function(vfs) {
			virtualFileSystem = vfs;
			useVirtualFileSystem = true;
		},
		getType: function(type, path) {
			let node = new type();
			/* if using a virtual file system, then get the files from the system */
			if (useVirtualFileSystem) {
				let fileData = virtualFileSystem.get(path);
				/* check if the file exists */
				if (fileData) {
					/* use data uri*/
					node.src = `data:${fileData.type};base64,${fileData.data}`;
				} else {
					throw new Error(`GET ${path} 404 (Not Found)`);
				}
			} else {
				node.src = path;
			}
			return node;
		},
		getImage: function(path) {
			return this.getType(Image, path);
		},
		getAudio: function(path) {
			return this.getType(Audio, path);
		},
	};
})();