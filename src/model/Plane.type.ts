import { Vec3 } from "../utils/MVU";

export default interface Plane {
    vertices : Vec3[];
    normals : Vec3[],
    uvs : number[],
    indices : number[]
}