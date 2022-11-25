precision mediump float;

attribute vec3 aVertex;
attribute vec3 aNormal; 
attribute vec2 aTexCoords;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uNormalMatrix;
uniform float uTiling;


uniform sampler2D uHeightMap;
 
varying vec4 v_Color;


void main() {

    float depth = 8.0;

    vec4 height = texture2D(uHeightMap, aTexCoords);
    vec3 pos = aVertex + aNormal * height.r * depth;
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(pos, 1.0);
    v_Color = vec4(height.r, height.r, height.r, 1.0);
}
