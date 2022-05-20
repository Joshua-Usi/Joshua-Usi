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
	vec3 cameraRightWorldSpace = vec3(uModelViewMatrix[0][0], uModelViewMatrix[1][0], uModelViewMatrix[2][0]);
	vec3 cameraUpWorldSpace = vec3(uModelViewMatrix[0][1], uModelViewMatrix[1][1], uModelViewMatrix[2][1]);

	vec3 vertexPosition = cameraRightWorldSpace * aVertexPosition.z * uTransformMatrix[0][0] + cameraUpWorldSpace * aVertexPosition.y * uTransformMatrix[1][1];
	vertexPosition.x /= uTransformMatrix[0][0];
	vertexPosition.y /= uTransformMatrix[1][1];
	vertexPosition.z /= uTransformMatrix[2][2];

	gl_Position = uProjectionMatrix * uModelViewMatrix * uTransformMatrix * vec4(vertexPosition, 1);
	vTextureCoord = aTextureCoord;
	// vVertexColour = aVertexColour;
	// vVertexNormal = mat3(transpose(inverse(uTransformMatrix))) * aVertexNormal;
	vVertexPosition = vec3(vec4(aVertexPosition, 1) * uTransformMatrix);
}