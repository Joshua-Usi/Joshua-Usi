export const fragment = `#version 300 es
	in highp vec4 vColour;

    out highp vec4 colour;
	void main() {
		colour = vColour;
	}
`;