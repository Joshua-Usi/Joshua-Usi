#version 300 es
in highp vec4 vVertexColour;
// in highp vec2 vTextureCoord;
in highp vec3 vVertexPosition;
in highp vec3 vVertexNormal;

// uniform sampler2D uSampler;
uniform highp vec3 uLightPos;
uniform highp vec3 uLightColour;

out highp vec4 colour;
void main() {
	highp vec4 texelColour = vVertexColour;

	// ambient
	highp float ambientStrength = 0.7;
	highp vec3 ambient = ambientStrength * uLightColour;

	// diffuse 
	highp float diffuseStrength = 1.0;
	highp vec3 norm = vVertexNormal;
	highp vec3 lightDir = normalize(uLightPos - vVertexPosition);
	highp float diff = max(dot(norm, lightDir), 0.0);
	highp vec3 diffuse = diff * diffuseStrength * uLightColour;

	// specular
	highp float specularStrength = 1.0;
	highp vec3 viewDir = normalize(uLightPos - vVertexPosition);
	highp vec3 reflectDir = reflect(-lightDir, -norm);
	highp float spec = pow(max(dot(viewDir, reflectDir), 0.0), 4.0);
	highp vec3 specular = specularStrength * spec * uLightColour;

	highp vec3 result = (ambient + diffuse) * vec3(texelColour);

	colour = vec4(result, texelColour.w);
}