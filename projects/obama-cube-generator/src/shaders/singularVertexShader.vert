#version 300 es
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec4 aVertexColour;
in vec3 aVertexNormal;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uTransformMatrix;

out highp vec3 vVertexPosition;
out highp vec2 vTextureCoord;
// out highp vec4 vVertexColour;
// out highp vec3 vVertexNormal;

void main() {
	gl_Position = uProjectionMatrix * uModelViewMatrix * uTransformMatrix * vec4(aVertexPosition, 1);
	vTextureCoord = aTextureCoord;
	// vVertexColour = aVertexColour;
	// vVertexNormal = mat3(transpose(inverse(uTransformMatrix))) * aVertexNormal;
	vVertexPosition = vec3(vec4(aVertexPosition, 1) * uTransformMatrix);
}	