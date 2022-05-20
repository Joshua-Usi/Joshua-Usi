#version 300 es
// in highp vec4 vVertexColour;
in highp vec2 vTextureCoord;
// in highp vec3 vVertexPosition;
// in highp vec3 vVertexNormal;

uniform sampler2D uSampler;
uniform highp vec3 uLightPos;
uniform highp vec3 uLightColour;

out highp vec4 colour;
void main() {
	colour = texture(uSampler, vTextureCoord);

}