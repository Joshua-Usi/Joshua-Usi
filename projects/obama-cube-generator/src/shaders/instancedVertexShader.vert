#version 300 es
in vec3 aVertexPosition;
// in vec2 aTextureCoord;
in vec4 aVertexColour;
in vec3 aVertexNormal;
in mat4 aInstanceTransforms;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

out highp vec3 vVertexPosition;
// out highp vec2 vTextureCoord;
out highp vec4 vVertexColour;
out highp vec3 vVertexNormal;

void main() {
	gl_Position = uProjectionMatrix * uModelViewMatrix * aInstanceTransforms * vec4(aVertexPosition, 1);
	// vTextureCoord = aTextureCoord;
	vVertexColour = aVertexColour;
	vVertexNormal = mat3(transpose(inverse(aInstanceTransforms))) * aVertexNormal;
	vVertexPosition = vec3(vec4(aVertexPosition, 1) * aInstanceTransforms);
}