import PrimaryShader from "../shaders/PrimaryShader";
import {generatePlane} from "../utils/Mesh";
import {identity, Mat4, vec3, Vec3} from "../utils/MVU";
import Mesh from "./Mesh.type";
import {ok, Result} from "../utils/Resulta";

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

	shader: PrimaryShader

	/**
	 * The projection matrix for the camera
	 */
	projectionMatrix: Mat4;

	/**
	 * The view matrix for the camera
	 *
	 * This is the matrix that will be used to transform the vertices
	 * of the objects in the scene.
	 */
	viewMatrix: Mat4;

	/**
	 * The model matrix for the camera
	 *
	 * This is the matrix that will be used to transform the vertices
	 * of the objects in the scene.
	 */
	modelMatrix: Mat4;


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

export function createContext (gl: WebGLRenderingContext, canvas: HTMLCanvasElement): Result<Context> {
    const plane : PlaneInfo= {
        scale: vec3(.8, .8, .8),
        position: vec3(0, 0, 0),
        rotation: vec3(0, 0, 0),
        mesh_data: generatePlane(PLANE_WIDTH, PLANE_HEIGHT, 100),
    };

	const shader = new PrimaryShader(gl);

	shader.use();

	shader.setPositionBufferData(plane.mesh_data.vertices);
	shader.setNormalBufferData(plane.mesh_data.normals);
	shader.setTextureCoordsBufferData(plane.mesh_data.uvs);
	shader.setIndexBufferData(plane.mesh_data.indices);

	return ok({
		gl,
		canvas,
		heightMap: null,
		projectionMatrix: identity(4),
		viewMatrix: identity(4),
		modelMatrix: identity(4),
		normalMatrix: identity(4),
		plane: plane,
		wireframe: false,
		shader: shader
	});
}

export function refreshBuffers(context: Context): Result<void> {
	const {shader, plane} = context;

	shader.setPositionBufferData(plane.mesh_data.vertices);
	shader.setNormalBufferData(plane.mesh_data.normals);
	shader.setTextureCoordsBufferData(plane.mesh_data.uvs);
	shader.setIndexBufferData(plane.mesh_data.indices);
	return ok();
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
