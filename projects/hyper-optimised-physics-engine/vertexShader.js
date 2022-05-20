export const vertex = `#version 300 es
	in vec4 aVertexPosition;
	// in vec4 aVertexColour;
	in vec2 aInstancePosition;
	in vec2 aInstanceScale;
	in vec4 aInstanceColour;

	uniform mat4 uModelViewMatrix;
	uniform mat4 uProjectionMatrix;

	out highp vec4 vColour;

	void main() {
		// vColour = aVertexColour;
		vColour = aInstanceColour;
		gl_Position = uProjectionMatrix * uModelViewMatrix * (aVertexPosition * vec4(aInstanceScale, 1.0, 1.0) + vec4(aInstancePosition, 0.0, 1.0));
	}
`;