precision mediump float;

attribute vec3 aVertex;
attribute vec3 aNormal;
attribute vec3 aHeightmap;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;
//uniform mat4 uNormalMatrix;

uniform sampler2D uHeightMap;
 
mat4 hi;

void main() {
    
    
    vec4 height = texture2D(uHeightMap, aHeightmap.xy);
    vec3 pos = aVertex + aNormal * height.r * aHeightmap.z;

    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(pos, 1.0);
    

}
