import {Plane} from "../src/model/Plane";
import {expect} from "./utls/Expect";

describe("Plane", () => {
	describe("generateMesh", () => {
		it("should return a mesh with 4 vertices given 1 subdivision", () => {
			const mesh = Plane.generateMesh(1);
			expect(mesh.vertices.length).toBeEqual(4*3);
		});
		it("should return a mesh with 4 normals given 1 subdivision", () => {
			const mesh = Plane.generateMesh(1);
			expect(mesh.normals.length).toBeEqual(4*3);
		});
		it("should return a mesh with 4 uvs given 1 subdivision", () => {
			const mesh = Plane.generateMesh(1);
			expect(mesh.uvs.length).toBeEqual(4*2);
		});
		it("should return a mesh with 2 faces given 1 subdivision", () => {
			const mesh = Plane.generateMesh(1);
			expect(mesh.indices.length).toBeEqual(2*3);
		});

		it("should return a mesh with 9 vertices given 2 subdivisions", () => {
			const mesh = Plane.generateMesh(2);
			expect(mesh.vertices.length).toBeEqual(9*3);
		});

		it("should return a mesh with 9 normals given 2 subdivisions", () => {
			const mesh = Plane.generateMesh(2);
			expect(mesh.normals.length).toBeEqual(9*3);
		});

		it("should return a mesh with 9 uvs given 2 subdivisions", () => {
			const mesh = Plane.generateMesh(2);
			expect(mesh.uvs.length).toBeEqual(9*2);
		});

		it("should return a mesh with 8 faces given 2 subdivisions", () => {
			const mesh = Plane.generateMesh(2);
			expect(mesh.indices.length).toBeEqual(8*3);
		});
	});
});