// Generate a plane with the given width and height and subdivisions

import Mesh from "../model/Mesh.type";
import { flatten, vec2, vec3 } from "./MVU";

/*
 * Generate a plane with the given width and height and subdivisions
 * @param {number} width - The width of the plane
 * @param {number} height - The height of the plane
 * @param {number} subdivisions - The number of subdivisions of the plane
 * @returns {Plane} - The plane
 */
export function generatePlane(
  width: number,
  height: number,
  subdivisions: number
): Mesh {
  const vertices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const width_half = width / 2;
  const height_half = height / 2;

  const gridX = subdivisions;
  const gridZ = subdivisions;

  const gridX1 = gridX + 1;
  const gridZ1 = gridZ + 1;

  const segment_width = width / gridX;
  const segment_height = height / gridZ;

  let normal = vec3(0, 0, 1);
  for (let iz = 0; iz < gridZ1; iz++) {
    let z = iz * segment_height - height_half;

    for (let ix = 0; ix < gridX1; ix++) {
      let x = ix * segment_width - width_half;

      vertices.push(x, -z, 0);
      normals.push(normal[0], normal[1], normal[2]);
      uvs.push(ix / gridX);
      uvs.push(1 - iz / gridZ);
    }
  }

  for (let iz = 0; iz < gridZ; iz++) {
    for (let ix = 0; ix < gridX; ix++) {
      let a = ix + gridX1 * iz;
      let b = ix + gridX1 * (iz + 1);
      let c = ix + 1 + gridX1 * (iz + 1);
      let d = ix + 1 + gridX1 * iz;

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  return {
    vertices: new Float32Array(vertices),
    normals: new Float32Array(normals),
    uvs: new Float32Array(uvs),
    indices: new Uint16Array(indices),
  };
}

export const plane = {
  vertices: new Float32Array([
    -0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0,
  ]),
  normals: new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]),
  uvs: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
  indices: new Uint16Array([0, 1, 2, 0, 2, 3]),
};

function subdividePlane(plane: Mesh, subdivisions: number): Mesh {
  const vertices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const { vertices: v, normals: n, uvs: h, indices: i } = plane;

  for (let i = 0; i < subdivisions; i++) {
    for (let j = 0; j < subdivisions; j++) {
      const a = i * (subdivisions + 1) + j;
      const b = i * (subdivisions + 1) + j + 1;
      const c = (i + 1) * (subdivisions + 1) + j + 1;
      const d = (i + 1) * (subdivisions + 1) + j;

      vertices.push(v[a * 3], v[a * 3 + 1], v[a * 3 + 2]);
      vertices.push(v[b * 3], v[b * 3 + 1], v[b * 3 + 2]);
      vertices.push(v[c * 3], v[c * 3 + 1], v[c * 3 + 2]);
      vertices.push(v[d * 3], v[d * 3 + 1], v[d * 3 + 2]);

      normals.push(n[a * 3], n[a * 3 + 1], n[a * 3 + 2]);
      normals.push(n[b * 3], n[b * 3 + 1], n[b * 3 + 2]);
      normals.push(n[c * 3], n[c * 3 + 1], n[c * 3 + 2]);
      normals.push(n[d * 3], n[d * 3 + 1], n[d * 3 + 2]);

      uvs.push(h[a * 2], h[a * 2 + 1]);
      uvs.push(h[b * 2], h[b * 2 + 1]);
      uvs.push(h[c * 2], h[c * 2 + 1]);
      uvs.push(h[d * 2], h[d * 2 + 1]);

      indices.push(i * 4 * (subdivisions + 1) + j * 4);
      indices.push(i * 4 * (subdivisions + 1) + j * 4 + 1);
      indices.push(i * 4 * (subdivisions + 1) + j * 4 + 2);
      indices.push(i * 4 * (subdivisions + 1) + j * 4);
      indices.push(i * 4 * (subdivisions + 1) + j * 4 + 2);
      indices.push(i * 4 * (subdivisions + 1) + j * 4 + 3);
    }
  }
  return {
    vertices: new Float32Array(vertices),
    normals: new Float32Array(normals),
    uvs: new Float32Array(uvs),
    indices: new Uint16Array(indices),
  };
}

export const cube: Mesh = {
  vertices: flatten(
    ...[
      vec3(-1, -1, -1),
      vec3(-1, -1, 1),
      vec3(-1, 1, -1),
      vec3(-1, 1, 1),
      vec3(1, -1, -1),
    ]
  ),
  normals: flatten(
    ...[
      vec3(-1, -1, -1),
      vec3(-1, -1, 1),
      vec3(-1, 1, -1),
      vec3(-1, 1, 1),
      vec3(1, -1, -1),
    ]
  ),
  uvs: flatten(...[vec2(0, 0), vec2(0, 1), vec2(1, 0), vec2(1, 1)]),
  indices: new Uint16Array([
    0, 1, 2, 1, 3, 2, 2, 3, 4, 3, 5, 4, 4, 5, 0, 5, 1, 0, 1, 5, 3, 5, 4, 3, 3,
    4, 2, 4, 0, 2,
  ]),
};
