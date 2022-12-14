#version 300 es
precision highp float;

in vec3 aPosition;
in vec3 aNormal;
in vec2 aTexCoords;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

//uniform mat4 uNormalMatrix;
//uniform float uTiling;


uniform sampler2D uHeightMap;
 
out vec4 v_Color;

float height_as_float(vec3 height) {
    return (height.r + height.g + height.b) / 3.0;
}

void main() {
    float depth = 8.0;

    vec4 heightComponents = texture(uHeightMap, aTexCoords);
    float height = height_as_float(heightComponents.rgb);
    vec3 pos = aPosition + aNormal * height * depth;
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
    v_Color = vec4(height, height, height, 1.0);
}
