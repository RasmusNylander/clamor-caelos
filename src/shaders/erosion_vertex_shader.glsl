#version 300 es
precision mediump float;

in vec3 a_normal;
uniform sampler2D u_heightmap;

out vec4 v_normal;

void main() {
	vec4 v_normal = vec4(texture2D(u_heightmap, gl_PointCoord).rgb, 0.0);
	gl_Position = v_normal;
}
