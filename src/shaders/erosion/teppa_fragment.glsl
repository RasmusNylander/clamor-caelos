#version 300 es
precision highp float;

in float height_after_erosion;

out vec4 color;

vec3 height_as_vec3(float height) {
	float remainder = height;
	float b = remainder >= 1.0/3.0 ? 1.0 : remainder;
	remainder -= b;
	float g = remainder >= 1.0/3.0 ? 1.0 : remainder;
	remainder -= g;
	float r = remainder;
	return vec3(r, g, b);
}

void main() {
	color = vec4(height_as_vec3(height_after_erosion), 1.0);
}
