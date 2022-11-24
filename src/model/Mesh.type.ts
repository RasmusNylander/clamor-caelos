import { Vec2, Vec3 } from "../utils/MVU";

export default interface Mesh {
    vertices : Float32Array;
    normals : Float32Array,
    uvs : Float32Array,
    indices : Float32Array
}