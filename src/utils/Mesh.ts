// Generate a plane with the given width and height and subdivisions

import Mesh from "../model/Mesh.type";
import { vec2, vec3 } from "./MVU";

/*
 * Generate a plane with the given width and height and subdivisions
 * @param {number} width - The width of the plane
 * @param {number} height - The height of the plane
 * @param {number} subdivisions - The number of subdivisions of the plane
 * @returns {Plane} - The plane
 */
export function generatePlane(width: number, height: number, subdivisions: number): Mesh {
  const plane: Mesh = {
    vertices: [],
    normals: [],
    uvs: [],
    indices: [],
  };

  const { vertices, normals, uvs, indices } = plane;

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

      vertices.push(vec3(x, -z, 0));
      normals.push(vec3(normal[0], normal[1], normal[2]));
      uvs.push(vec2(ix / gridX , 1 - (iz / gridZ)));
    }
  }

  for (let iz = 0; iz < gridZ; iz++) {
    for (let ix = 0; ix < gridX; ix++) {
      let a = ix + gridX1 * iz;
      let b = ix + gridX1 * (iz + 1);
      let c = ix + 1 + gridX1 * (iz + 1);
      let d = ix + 1 + gridX1 * iz;

      indices.push(vec3(a, b, d));
      indices.push(vec3(b, c, d));
    }
  }

  return {
    vertices,
    normals,
    uvs,
    indices,
  };
}


export const cube : Mesh = {
  vertices: [
    vec3(-1, -1, -1),
    vec3(-1, -1, 1),
    vec3(-1, 1, -1),
    vec3(-1, 1, 1),
    vec3(1, -1, -1),
  ],
  normals: [
    vec3(-1, -1, -1),
    vec3(-1, -1, 1),
    vec3(-1, 1, -1),
    vec3(-1, 1, 1),
    vec3(1, -1, -1),
  ],
  uvs: [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 0),
    vec2(1, 1),
  ],
  indices: [
    vec3(0, 1, 2),
    vec3(1, 3, 2),
    vec3(0, 2, 4),
    vec3(2, 3, 4),
    vec3(0, 4, 1),
    vec3(4, 3, 1),
  ],
};