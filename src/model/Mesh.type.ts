import { Vec2, Vec3 } from "../utils/MVU";

export default interface Mesh {
    vertices : Vec3[];
    normals : Vec3[],
    uvs : Vec2[],
    indices : Vec3[]
}