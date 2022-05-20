#version 300 es
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec4 aVertexColour;
in vec3 aVertexNormal;
in vec3 aInstanceTransforms;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uParticleSystemOrigin;

out highp vec3 vVertexPosition;
out highp vec2 vTextureCoord;

void main() {
	vec3 cameraRightWorldSpace = vec3(uModelViewMatrix[0][0], uModelViewMatrix[1][0], uModelViewMatrix[2][0]);
	vec3 cameraUpWorldSpace = vec3(uModelViewMatrix[0][1], uModelViewMatrix[1][1], uModelViewMatrix[2][1]);

	vec3 vertexPosition = cameraRightWorldSpace * aVertexPosition.z + cameraUpWorldSpace * aVertexPosition.y;

	gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aInstanceTransforms + uParticleSystemOrigin + vertexPosition, 1);
	vTextureCoord = aTextureCoord;
}