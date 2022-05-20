class AudioManager {
	constructor() {
		this.audioSources = [];
	}
	getAudioIndex(id) {
		let i = 0;
		/* linear search through all the game objects */
		while (i < this.audioSources.length) {
			if (this.audioSources[i].id === id) {
				return i;
			}
			i++;
		}
		/* no element was found, return null */
		return null;	
	}
	addAudio(audio) {
		this.audioSources.push(audio);
	}
	removeAudio(id) {

	}

	playAudio(id) {
		let index = this.getAudioIndex(name);
		if (index !== null) {
			this.audioPlay.play();
		} else {
			console.warn(`Could not play audio: Audio with id "${id}" is not defined`);
		}
	}
	pauseAudio(id) {
		let index = this.getAudioIndex(name);
		if (index !== null) {
			this.audioPlay.play();
		} else {
			console.warn(`Could not pause audio: Audio with id "${id}" is not defined`);
		}
	}
	pauseAllAudio() {
		for (var i = 0; i < this.audioSources.length; i++) {
			this.audioSources[i].pause();
		}
	}
}