#version 300 es
precision highp float;

uniform sampler2D u_heightmap_watermap_solutesmap;
out vec3 height_water_solutes_unused;

void main() {
	float textureIndex = gl_FragCoord;

	float evaporation_constant = 0.01;
	float erosion_strength = 0.1;

	float starting_water_level = texture(u_heightmap_watermap_solutesmap, textureIndex).r;
	water_level = starting_water_level * (1.0 - evaporation_constant);

	float starting_solutes_level = texture(u_heightmap_watermap_solutesmap, textureIndex).g;
	float unused_solvant = max(water_level - starting_solutes_level, 0);
	solutes_level = min(water_level, starting_solutes_level + unused_solvant * erosion_strength);

	float starting_height = texture(u_heightmap_watermap_solutesmap, textureIndex).b;
	float height_change = starting_solutes_level - solutes_level;
	float height = starting_height + height_change;

	height_water_solutes_unused = vec3(height, water_level, solutes_level);
}
