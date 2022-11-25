import {add, identity, Mat4, perspective, Vec3} from "../utils/MVU";


export type CameraMode = "free" | "orbit";

export default class Camera {
	private position: Vec3;
	private rotation: Vec3;
	private fov: number;
	private aspect: number;
	private near: number;
	private far: number;
	private cameraMode: CameraMode = "free";

	constructor(
		position: Vec3,
		rotation: Vec3,
		fov: number,
		aspect: number,
		near: number,
		far: number
	) {
		this.position = position;
		this.rotation = rotation;
		this.fov = fov;
		this.aspect = aspect;
		this.near = near;
		this.far = far;
	}

	/*
	TODO: Implement the method to get the view matrix of the camera.
	*/
	public getViewMatrix(): Mat4 {
		const {position, rotation} = this;
		const viewMatrix = identity(4);


		return viewMatrix;
	}

	public getProjectionMatrix(): Mat4 {
		const {fov, aspect, near, far} = this;
		let projectionMatrix = identity(4);
		projectionMatrix = perspective(fov, aspect, near, far);
		return projectionMatrix;
	}

	public translate(vec: Vec3): void {
		this.position = add(this.position, vec);
	}

	public rotate(vec: Vec3): void {
		this.rotation = add(this.rotation, vec);
	}

	public setFov(fov: number): void {
		this.fov = fov;
	}

	public setAspect(aspect: number): void {
		this.aspect = aspect;
	}

	public setNear(near: number): void {
		this.near = near;
	}

	public setFar(far: number): void {
		this.far = far;
	}

	public setPosition(position: Vec3): void {
		this.position = position;
	}

	public setRotation(rotation: Vec3): void {
		this.rotation = rotation;
	}

	public getPosition(): Vec3 {
		return this.position;
	}

	public getRotation(): Vec3 {
		return this.rotation;
	}

	public getFov(): number {
		return this.fov;
	}

	public getAspect(): number {
		return this.aspect;
	}

	public getNear(): number {
		return this.near;
	}

	public getFar(): number {
		return this.far;
	}
}
