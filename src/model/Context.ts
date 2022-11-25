import PrimaryShader from "../shaders/PrimaryShader";
import { generatePlane } from "../utils/Mesh";
import { identity, Mat4, vec3, Vec3 } from "../utils/MVU";
import Mesh from "./Mesh.type";

const PLANE_WIDTH = 50;
const PLANE_HEIGHT = 50;

// The interface for the application state context
export interface Context {
  /**
   * The WebGL context
   */
  gl: WebGLRenderingContext;

  /**
   * The canvas that the WebGL context is attached to
   */
  canvas: HTMLCanvasElement;

  /**
   * The heightmap in the form of a  WebGL texture
   */
  heightMap: WebGLTexture | null;

  /**
   * The html element that contains the height map image
   */
  heightMapImage: HTMLImageElement | null;

  // The buffers to send stuff to the GPU
  buffers: {
    /**
     * the vertex buffer
     * This is where the vertices are stored
     */
    vertex: WebGLBuffer | null;

    /**
     * The normal buffer
     * This is where the normals are stored to calculate lighting and more
     */
    normal: WebGLBuffer | null;

    /**
     * The texture coordinate buffer
     * This is where the texture coordinates are stored to map the texture to the vertices
     */
    texture: WebGLBuffer | null;

    /**
     * The index buffer
     * This is where the indices are stored to tell the GPU which vertices to draw
     */
    index: WebGLBuffer | null;
  };

  shader: PrimaryShader

  /**
   * The projection matrix for the camera
   */
  projectionMatrix: Mat4;

  /**
   * The model view matrix for the camera
   *
   * This is the matrix that will be used to transform the vertices
   * of the objects in the scene.
   */
  modelViewMatrix: Mat4;

  /**
   * The normal matrix for the camera. This is the matrix that will be used to transform the normals of the objects in the scene.
   */
  normalMatrix: Mat4;

  plane: PlaneInfo;

  wireframe: boolean;
}

export interface PlaneInfo {
  scale: Vec3;
  position: Vec3;
  rotation: Vec3;
  mesh_data: Mesh;
}

const createContext = (
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement,
): Context => {

    const buffers = {
        vertex: gl.createBuffer(),
        normal: gl.createBuffer(),
        texture: gl.createBuffer(),
        index: gl.createBuffer(),
    };
    if(!buffers.vertex || !buffers.normal || !buffers.texture || !buffers.index) {
        throw new Error("Failed to create buffers");
    }

    const plane : PlaneInfo= {
        scale: vec3(.8, .8, .8),
        position: vec3(0, 0, 0),
        rotation: vec3(0, 0, 0),
        mesh_data: generatePlane(PLANE_WIDTH, PLANE_HEIGHT, 100),
    };

    const shader = new PrimaryShader(gl);

    shader.use();


    shader.setPositionBuffer(buffers.vertex);
    shader.setNormalBuffer(buffers.normal);
    shader.setTextureCoordsBuffer(buffers.texture);
    shader.setIndexBuffer(buffers.index);

    shader.setPositionBufferData(buffers.vertex, plane.mesh_data.vertices);
    shader.setNormalBufferData(buffers.normal, plane.mesh_data.normals);
    shader.setTextureCoordsBufferData(buffers.texture, plane.mesh_data.uvs);
    shader.setIndexBufferData(buffers.index, plane.mesh_data.indices);

    
  return {
    gl,
    canvas,
    heightMap: null,
    heightMapImage: null,
    buffers: buffers,
    projectionMatrix: identity(4),
    modelViewMatrix: identity(4),
    normalMatrix: identity(4),
    plane: plane,
    wireframe: false,
    shader: shader
  };
};

export function refreshBuffers(context: Context) {
    const { gl, buffers, shader, plane } = context;

    if(!buffers.vertex || !buffers.normal || !buffers.texture || !buffers.index) {
        throw new Error("Failed to get buffers");
    }

    shader.setPositionBufferData(buffers.vertex, plane.mesh_data.vertices);
    shader.setNormalBufferData(buffers.normal, plane.mesh_data.normals);
    shader.setTextureCoordsBufferData(buffers.texture, plane.mesh_data.uvs);
    shader.setIndexBufferData(buffers.index, plane.mesh_data.indices);
}

export function setPlaneSubdivision(context: Context, subdivision: number) {
  context.plane.mesh_data = generatePlane(
    PLANE_WIDTH,
    PLANE_HEIGHT,
    subdivision
  );
}

export function setPlaneScale(context: Context, scale: Vec3) {
  context.plane.scale = scale;
}

export function setPlanePosition(context: Context, position: Vec3) {
    context.plane.position = position;
}

export function setPlaneRotation(context: Context, rotation: Vec3) {
    context.plane.rotation = rotation;
}

export function rotatePlane(context: Context, rotation: Vec3) {
    context.plane.rotation = [
        context.plane.rotation[0] + rotation[0],
        context.plane.rotation[1] + rotation[1],
        context.plane.rotation[2] + rotation[2]
    ]
}

export function translatePlane(context: Context, translation: Vec3) {
    context.plane.position = [
        context.plane.position[0] + translation[0],
        context.plane.position[1] + translation[1],
        context.plane.position[2] + translation[2]
    ]
}



export default createContext;
