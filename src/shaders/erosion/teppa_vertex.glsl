#version 300 es
precision highp float;
precision highp sampler2D;


uniform sampler2D heightmap;

in vec2 current_position;
in vec2 current_velocity;
in float current_water;
in float current_sediment;

out vec2 new_position;
out vec2 new_velocity;
out float new_water;
out float new_sediment;

out float height_after_erosion;

float interia = 0.2;

float time_step = 1.0/248.0;

float deposition_speed = 3.0 * 1.0/(256.0*256.0); // [0, 1]
float erosion_speed = 3.0 * 1.0/(256.0*256.0); // [0, 1]
float min_sediment_capacity = 3.0 * 1.0/(256.0*256.0*256.0); // [0, 1]
float evaporation_speed = 0.000001; // [0, 1]
float step_size = 1.0/2056.0;

float sum(vec3 v) {
	return v.x + v.y + v.z;
}

float height_as_float(vec3 height) {
	return sum(height);
}

vec2 sample_gradient(vec2 position, sampler2D heightmap) {
	vec2 tep = (position / 2.0 + 0.5) * vec2(textureSize(heightmap, 0));

	ivec2 texel_coordinates_northwest = ivec2(tep);
	vec2 texel_offset = fract(tep);

	float height_northwest = height_as_float(texelFetch(heightmap, texel_coordinates_northwest + ivec2(0, 0), 0).rgb);
	float height_northeast = height_as_float(texelFetch(heightmap, texel_coordinates_northwest + ivec2(1, 0), 0).rgb);
	float height_southwest = height_as_float(texelFetch(heightmap, texel_coordinates_northwest + ivec2(0, 1), 0).rgb);
	float height_southeast = height_as_float(texelFetch(heightmap, texel_coordinates_northwest + ivec2(1, 1), 0).rgb);

	float texel_gradient_x_north = height_northeast - height_northwest;
	float texel_gradient_x_south = height_southeast - height_southwest;
	float texel_gradient_y_west = height_southwest - height_northwest;
	float texel_gradient_y_east = height_southeast - height_northeast;

	float gradientX = mix(texel_gradient_x_north, texel_gradient_x_south, texel_offset.y);
	float gradientY = mix(texel_gradient_y_west, texel_gradient_y_east, texel_offset.x);

	vec2 gradient = vec2(gradientX, gradientY);

	return gradient;
}

bool is_outside_map(vec2 position) {
	return position.x < -1.0 || position.x > 1.0 || position.y < -1.0 || position.y > 1.0;
}

void failure() {
	gl_Position = vec4(-2.0, -2.0, -1.0, 1.0);
	return;
}

void main() {
	gl_Position = vec4(current_position, 0.0, 1.0);
	gl_PointSize = 1.0;
	new_water = current_water * (1.0 - evaporation_speed * time_step);

	float height = height_as_float(texture(heightmap, current_position).rgb);
	height_after_erosion = height;

	if (current_water == 0.0 || is_outside_map(current_position)) {
		failure();
		return;
	}


	vec2 gradient = sample_gradient(current_position, heightmap);

	vec2 velocity_carryover = current_velocity * interia;
	vec2 new_velocity_component = (1.0 - interia) * gradient;

	new_velocity = vec2(new_velocity_component + velocity_carryover);
	if (new_velocity.x == 0.0 && new_velocity.y == 0.0) {
		failure();
		return;
	}
	float speed = length(new_velocity);
	new_velocity /= speed;

	new_position = current_position + new_velocity * step_size;


	float height_at_new_position = height_as_float(texture(heightmap, new_position).rgb);
	float height_difference = height_at_new_position - height;

	bool flowing_uphill = height_difference > 0.0;
	if (flowing_uphill) {
		float amount_to_deposit = min(current_sediment, height_difference);
		new_sediment = current_sediment - amount_to_deposit;
		height_after_erosion = height + amount_to_deposit;
		return;
	}


	float sediment_capacity = max(min_sediment_capacity, -height_difference * speed * current_water);

	if (current_sediment > sediment_capacity) {
		// If we are flowing uphill we do not want to magically create a mound behind us, so we only deposit as much as the difference in height
		float amount_to_deposit = (sediment_capacity - current_sediment) * deposition_speed * time_step;

		new_sediment = current_sediment - amount_to_deposit;
		height_after_erosion = height + amount_to_deposit;
	} else {
		float amount_to_erode = min((sediment_capacity - current_sediment) * erosion_speed, -height_difference) * time_step;

		new_sediment = current_sediment + amount_to_erode;
		height_after_erosion = height - amount_to_erode;
	}
}
