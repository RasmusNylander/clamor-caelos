import Mesh from "./Mesh.type";
import {vec2, Vec2, vec3, Vec3} from "../utils/MVU";
import {SubdivisionNumber} from "./SubdivisionNumber";

type Face = [number, number, number];
export class Plane {
	static generateMesh(numSubdivisions: SubdivisionNumber): Mesh {
		function pushIndices(row: number, col: number) {
			if (row >= numSubdivisions || col >= numSubdivisions) return;
			const a = col + (row * (subdivisions + 1));
			const b = col + ((row + 1) * (subdivisions + 1));
			const c = col + 1 + ((row + 1) * (subdivisions + 1));
			const d = col + 1 + (row * (subdivisions + 1));

			indices.push([a, b, d]);
			indices.push([b, c, d]);
		}

		const subdivisions = numSubdivisions.valueOf();

		const vertices: Vec3[] = [];
		const normals: Vec3[] = [];
		const uvs: Vec2[] = [];
		const indices: Face[] = [];

		for (let row = 0; row <= subdivisions; row++) {
			for (let col = 0; col <= subdivisions; col++) {
				const x = col / subdivisions;
				const y = row / subdivisions;
				const z = 0;
				vertices.push(vec3(x, y, z));
				normals.push(vec3(0, 0, 1));
				uvs.push(vec2(x, y));
				pushIndices(row, col);
			}
		}

		return {
			vertices: new Float32Array(new Float32Array(vertices.flat(1))),
			normals: new Float32Array(new Float32Array(normals.flat(1))),
			uvs: new Float32Array(new Float32Array(uvs.flat(1))),
			indices: new Uint16Array(new Uint16Array(indices.flat(1))),
		}
	}

}