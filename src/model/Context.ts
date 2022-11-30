import PrimaryShader from "../shaders/PrimaryShader";
import {generatePlane} from "../utils/Mesh";
import {add, identity, Mat4, multiply, rotation, vec3, Vec3} from "../utils/MVU";
import Mesh from "./Mesh.type";
import {SubdivisionNumber} from "./SubdivisionNumber";

const PLANE_WIDTH = 50;
const PLANE_HEIGHT = 50;

// The interface for the application state context
export class Context {
	/**
	 * The WebGL context
	 */
	gl: WebGL2RenderingContext;
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

	worldUp: Vec3;

	constructor(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement) {
		this.gl = gl;
		this.canvas = canvas;
		this.heightMap = null;
		this.shader = new PrimaryShader(gl);
		this.projectionMatrix = identity(4);
		this.viewMatrix = identity(4);
		this.modelMatrix = identity(4);
		this.normalMatrix = identity(4);
		this.plane = {
			scale: vec3(.8, .8, .8),
			position: vec3(0, 0, 0),
			up: vec3(0, 1, 0),
			rotation: 0,
			mesh_data: generatePlane(PLANE_WIDTH, PLANE_HEIGHT, 100),
		};
		this.wireframe = false;
		this.worldUp = vec3(0, 1, 0);

		this.shader.use();

		this.refreshBuffers();
	}


	refreshBuffers(): void {
		const shader = this.shader;
		const plane = this.plane;

		shader.setPositionBufferData(plane.mesh_data.vertices);
		shader.setNormalBufferData(plane.mesh_data.normals);
		shader.setTextureCoordsBufferData(plane.mesh_data.uvs);
		shader.setIndexBufferData(plane.mesh_data.indices);
		return;
	}

	setPlaneSubdivision(subdivision: SubdivisionNumber): void {
		this.plane.mesh_data = generatePlane(
			PLANE_WIDTH,
			PLANE_HEIGHT,
			subdivision as number
		);
	}

	setPlaneScale(scale: Vec3) {
		this.plane.scale = scale;
	}
	setPlanePosition(position: Vec3) {
		this.plane.position = position;
	}

	setPlaneRotation(rotation: number) {
		this.plane.rotation = rotation;
	}

	translatePlane(translation: Vec3) {
		this.plane.position = add(translation, this.plane.position);
	}

	rotatePlane(radians: number) {
		this.plane.rotation += radians;
		this.modelMatrix = multiply(rotation(radians, this.plane.up), this.modelMatrix)
		this.shader.setModelMatrix(this.modelMatrix);
	}
}

export interface PlaneInfo {
	scale: Vec3;
	position: Vec3;
	up: Vec3;
	rotation: number;
	mesh_data: Mesh;
}

