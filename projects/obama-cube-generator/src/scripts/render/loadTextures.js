export function loadTexture(gl, url) {
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	const level = 0;
	const internalFormat = gl.RGBA;
	const width = 1;
	const height = 1;
	const border = 0;
	const srcFormat = gl.RGBA;
	const srcType = gl.UNSIGNED_BYTE;
	const pixels = new Uint8Array([
		255, 0, 255, 255,
	]);
	gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixels);

	const image = new Image();
	image.addEventListener("load", function() {
		texture.complete = true;
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);

		// WebGL1 has different requirements for power of 2 images
		// vs non power of 2 images so check if the image is a
		// power of 2 in both dimensions.
		if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
			// Yes, it's a power of 2. Generate mips.
			gl.generateMipmap(gl.TEXTURE_2D);
		} else {
			// No, it's not a power of 2. Turn off mips and set
			// wrapping to clamp to edge
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

		}
	});
	image.src = url;
	texture.complete = false;

	return texture;
}

export function initTexture(gl) {
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	// Because video has to be download over the internet
	// they might take a moment until it's ready so
	// put a single pixel in the texture so we can
	// use it immediately.
	const level = 0;
	const internalFormat = gl.RGBA;
	const width = 1;
	const height = 1;
	const border = 0;
	const srcFormat = gl.RGBA;
	const srcType = gl.UNSIGNED_BYTE;
	const pixel = new Uint8Array([
		255, 0, 255, 255,
	]);
	gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
				width, height, border, srcFormat, srcType,
				pixel);

	// Turn off mips and set	wrapping to clamp to edge so it
	// will work regardless of the dimensions of the video.
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

	texture.complete = true;
	console.log(texture);
	return texture;
}

export function bindVideo(texture, video) {
	texture.isVideo = true;
	texture.video = video;
} 

export function updateTexture(gl, texture) {
	const level = 0;
	const internalFormat = gl.RGBA;
	const srcFormat = gl.RGBA;
	const srcType = gl.UNSIGNED_BYTE;
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
	srcFormat, srcType, texture.video);
}

function isPowerOf2(value) {
	return (value & (value - 1)) === 0;
}

export function setupVideo(url) {
	const video = document.createElement("video");

	video.autoplay = true;
	video.muted = true;
	video.loop = true;

	video.src = url;
	video.play();
	function playAndRemove() {
		video.play();
		window.removeEventListener("click", playAndRemove);
	}
	window.addEventListener("click", playAndRemove);

	return video;
}

export function loadVideoTexture(gl, url) {
	let video = setupVideo(url);
	let texture = initTexture(gl);
	bindVideo(texture, video);
	return texture;
}