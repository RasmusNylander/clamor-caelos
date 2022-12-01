#version 300 es
precision highp float;

uniform sampler2D u_heightmap_watermap_solutesmap_flowdirectionmap;
out vec4 height_water_solutes_unused;

float sampleWater(in vec2 textureIndex) {
	return texture(u_heightmap_watermap_solutesmap_flowdirectionmap, textureIndex).r;
}
float sampleHeight(in vec2 textureIndex) {
	return texture(u_heightmap_watermap_solutesmap_flowdirectionmap, textureIndex).g;
}
float sampleSolutes(in vec2 textureIndex) {
	return texture(u_heightmap_watermap_solutesmap_flowdirectionmap, textureIndex).b;
}
float sampleFlowDirection(in vec2 textureIndex) {
	return texture(u_heightmap_watermap_solutesmap_flowdirectionmap, textureIndex).a;
}

float arriving_water(in vec2 textureIndex) {
	return
		sampleFlowDirection(textureIndex + vec2(-1.0, 1.0)) == 8 ? sampleWater(textureIndex + vec2(-1.0, 1.0)) : 0.0 +
		sampleFlowDirection(textureIndex + vec2(0.0, 1.0)) == 7 ? sampleWater(textureIndex + vec2(0.0, 1.0)) : 0.0 +
		sampleFlowDirection(textureIndex + vec2(1.0, 1.0)) == 6 ? sampleWater(textureIndex + vec2(1.0, 1.0)) : 0.0 +
		sampleFlowDirection(textureIndex + vec2(-1.0, 0.0)) == 4 ? sampleWater(textureIndex + vec2(-1.0, 0.0)) : 0.0 +
		sampleFlowDirection(textureIndex + vec2(1.0, 0.0)) == 3 ? sampleWater(textureIndex + vec2(1.0, 0.0)) : 0.0 +
		sampleFlowDirection(textureIndex + vec2(-1.0, -1.0)) == 2 ? sampleWater(textureIndex + vec2(-1.0, -1.0)) : 0.0 +
		sampleFlowDirection(textureIndex + vec2(0.0, -1.0)) == 1 ? sampleWater(textureIndex + vec2(0.0, -1.0)) : 0.0 +
		sampleFlowDirection(textureIndex + vec2(1.0, -1.0)) == 0 ? sampleWater(textureIndex + vec2(1.0, -1.0)) : 0.0;
}

float leaving_water(in vec2 textureIndex) {
	return sampleFlowDirection(textureIndex) != 5 ? sampleWater(textureIndex) : 0.0;
}

void main() {
	vec2 textureIndex = gl_FragCoord.xy / textureSize(u_heightmap_watermap_solutesmap_flowdirectionmap, 0);

	float evaporation_constant = 0.01;
	float erosion_strength = 0.1;

	float starting_water_level = sampleWater(textureIndex);
	water_level = (starting_water_level + arriving_water(textureIndex) - leaving_water(textureIndex)) * (1.0 - evaporation_constant);

	float starting_solutes_level = sampleSolutes(textureIndex);
	float unused_solvant = max(water_level - starting_solutes_level, 0);
	solutes_level = min(water_level, starting_solutes_level + unused_solvant * erosion_strength);

	float starting_height = sampleHeight(textureIndex);
	float height_change = starting_solutes_level - solutes_level;
	float height = starting_height + height_change;

	height_water_solutes_unused = vec4(height, water_level, solutes_level, 0.0);
}
