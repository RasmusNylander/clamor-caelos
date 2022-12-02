#version 300 es
precision highp float;

uniform sampler2D u_heightmap_watermap_solutesmap;
out vec3 height_water_solutes;


#define FLOW_TOPLEFT 0
#define FLOW_TOP 1
#define FLOW_TOPRIGHT 2
#define FLOW_LEFT 3
#define NO_FLOW 4
#define FLOW_RIGHT 5
#define FLOW_BOTTOMLEFT 6
#define FLOW_BOTTOM 7
#define FLOW_BOTTOMRIGHT 8

#define TOPLEFT_OFFSET 		vec2(-1.0, 1.0)
#define TOP_OFFSET 			vec2(0.0, 1.0)
#define TOPRIGHT_OFFSET 	vec2(1.0, 1.0)
#define LEFT_OFFSET			vec2(-1.0, 0.0)
#define RIGHT_OFFSET		vec2(1.0, 0.0)
#define BOTTOMLEFT_OFFSET	vec2(-1.0, -1.0)
#define BOTTOM_OFFSET		vec2(0.0, -1.0)
#define BOTTOMRIGHT_OFFSET	vec2(1.0, -1.0)

float sample_water(in vec2 point) {
	return texture(u_heightmap_watermap_solutesmap, point).r;
}
float sample_height(in vec2 point) {
	return texture(u_heightmap_watermap_solutesmap, point).g;
}
float sample_solutes(in vec2 point) {
	return texture(u_heightmap_watermap_solutesmap, point).b;
}

int calculate_flowdirection(in vec2 point) {
	int flow_direction = NO_FLOW;
	float min_height = sample_height(point);

	float height_topleft = sample_height(point + TOPLEFT_OFFSET);
	if (height_topleft < min_height) {
		min_height = height_topleft;
		flow_direction = FLOW_TOPLEFT;
	}

	float height_top = sample_height(point + TOP_OFFSET);
	if (height_top < min_height) {
		min_height = height_top;
		flow_direction = FLOW_TOP;
	}

	float height_topright = sample_height(point + TOPRIGHT_OFFSET);
	if (height_topright < min_height) {
		min_height = height_topright;
		flow_direction = FLOW_TOPRIGHT;
	}

	float height_left = sample_height(point + LEFT_OFFSET);
	if (height_left < min_height) {
		min_height = height_left;
		flow_direction = FLOW_RIGHT;
	}

	float height_right = sample_height(point + RIGHT_OFFSET);
	if (height_right < min_height) {
		min_height = height_right;
		flow_direction = FLOW_RIGHT;
	}

	float height_bottomleft = sample_height(point + BOTTOMLEFT_OFFSET);
	if (height_bottomleft < min_height) {
		min_height = height_bottomleft;
		flow_direction = FLOW_BOTTOMLEFT;
	}

	float height_bottom = sample_height(point + BOTTOM_OFFSET);
	if (height_bottom < min_height) {
		min_height = height_bottom;
		flow_direction = FLOW_BOTTOM;
	}

	float height_bottomright = sample_height(point + BOTTOMRIGHT_OFFSET);
	if (height_bottomright < min_height) {
		min_height = height_bottomright;
		flow_direction = FLOW_BOTTOMRIGHT;
	}

	return flow_direction;
}

float arriving_water(in vec2 point) {
	return
		(calculate_flowdirection(point + TOPLEFT_OFFSET) == FLOW_BOTTOMRIGHT ? sample_water(point + TOPLEFT_OFFSET) : 0.0) +
		(calculate_flowdirection(point + TOP_OFFSET) == FLOW_BOTTOM ? sample_water(point + TOP_OFFSET) : 0.0)  +
		(calculate_flowdirection(point + TOPRIGHT_OFFSET) == FLOW_BOTTOMLEFT ? sample_water(point + TOPRIGHT_OFFSET) : 0.0) +
		(calculate_flowdirection(point + LEFT_OFFSET) == FLOW_RIGHT ? sample_water(point + LEFT_OFFSET) : 0.0) +
		(calculate_flowdirection(point + RIGHT_OFFSET) == FLOW_LEFT ? sample_water(point + RIGHT_OFFSET) : 0.0) +
		(calculate_flowdirection(point + BOTTOMLEFT_OFFSET) == FLOW_TOPRIGHT ? sample_water(point + BOTTOMLEFT_OFFSET) : 0.0) +
		(calculate_flowdirection(point + BOTTOM_OFFSET) == FLOW_TOP ? sample_water(point + BOTTOM_OFFSET) : 0.0) +
		(calculate_flowdirection(point + BOTTOMRIGHT_OFFSET) == FLOW_TOPLEFT ? sample_water(point + BOTTOMRIGHT_OFFSET) : 0.0);
}

float leaving_water(in vec2 point) {
	return calculate_flowdirection(point) != NO_FLOW ? sample_water(point) : 0.0;
}

float arriving_solutes(in vec2 point) {
	return
		(calculate_flowdirection(point + TOPLEFT_OFFSET) == FLOW_BOTTOMRIGHT ? sample_solutes(point + TOPLEFT_OFFSET) : 0.0) +
		(calculate_flowdirection(point + TOP_OFFSET) == FLOW_BOTTOM ? sample_solutes(point + TOP_OFFSET) : 0.0) +
		(calculate_flowdirection(point + TOPRIGHT_OFFSET) == FLOW_BOTTOMLEFT ? sample_solutes(point + TOPRIGHT_OFFSET) : 0.0) +
		(calculate_flowdirection(point + LEFT_OFFSET) == FLOW_RIGHT ? sample_solutes(point + LEFT_OFFSET) : 0.0) +
		(calculate_flowdirection(point + RIGHT_OFFSET) == FLOW_LEFT ? sample_solutes(point + RIGHT_OFFSET) : 0.0) +
		(calculate_flowdirection(point + BOTTOMLEFT_OFFSET) == FLOW_TOPRIGHT ? sample_solutes(point + BOTTOMLEFT_OFFSET) : 0.0) +
		(calculate_flowdirection(point + BOTTOM_OFFSET) == FLOW_TOP ? sample_solutes(point + BOTTOM_OFFSET) : 0.0) +
		(calculate_flowdirection(point + BOTTOMRIGHT_OFFSET) == FLOW_TOPLEFT ? sample_solutes(point + BOTTOMRIGHT_OFFSET) : 0.0);
}

float leaving_solutes(in vec2 point) {
	return calculate_flowdirection(point) != NO_FLOW ? sample_solutes(point) : 0.0;
}

void main() {
	vec2 textureIndex = gl_FragCoord.xy / vec2(textureSize(u_heightmap_watermap_solutesmap, 0).xy);

	float evaporation_constant = 0.01;
	float erosion_strength = 0.1;

	// Flow
	float starting_water_level = sample_water(textureIndex);
	float water_level = (starting_water_level - leaving_water(textureIndex) + arriving_water(textureIndex)) * (1.0 - evaporation_constant);

	float starting_solutes_level = sample_solutes(textureIndex);
	float post_flow_solutes_level = (starting_solutes_level - leaving_solutes(textureIndex) + arriving_solutes(textureIndex));

	// Erosion & deposition
	float unused_solvant = max(water_level - post_flow_solutes_level, 0.0);
	float solutes_level = min(water_level, post_flow_solutes_level + unused_solvant * erosion_strength);

	float starting_height = sample_height(textureIndex);
	float height_change = post_flow_solutes_level - solutes_level;
	float height = starting_height + height_change;

	height_water_solutes = vec3(height, water_level, solutes_level);

	height_water_solutes = vec3(starting_water_level, 0.0, 0.0);
}
