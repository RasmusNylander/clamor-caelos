precision mediump float;

attribute vec3 aVertex;
attribute vec3 aNormal;
attribute vec2 aHeightmap;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uNormalMatrix;

uniform sampler2D uHeightMap;
 
varying vec4 v_Color;



void main() {
    vec4 height = texture2D(uHeightMap, aHeightmap);
    vec3 pos = aVertex + aNormal * height.r * 25.0;
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(pos, 1.0);
    v_Color = vec4(height.r, height.r, height.r, 1.0);
    
 

}
