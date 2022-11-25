import {initShadersFromString} from "../utils/initShaders";

/**
 * Class to represent a shader.
 * Having it as a class allows us to easier manage the shader program and its attributes and uniforms.
 */
export default class Shader {
	protected readonly gl: WebGLRenderingContext;
	protected readonly program: WebGLProgram;

	constructor(
		gl: WebGLRenderingContext,
		vertexShader: string,
		fragmentShader: string
	) {
		this.gl = gl;
		const shader = initShadersFromString(gl, vertexShader, fragmentShader);
		if (!shader.ok) throw shader.error;
		this.program = shader.value;
	}

	public use(): void {
		this.gl.useProgram(this.program);
	}

	public getUniformLocation(name: string): WebGLUniformLocation | null {
		return this.gl.getUniformLocation(this.program, name);
	}

	public getAttribLocation(name: string): number {
		return this.gl.getAttribLocation(this.program, name);
	}

	public setUniformMatrix4fv(
		location: WebGLUniformLocation | null,
		transpose: boolean,
		value: Float32Array
	): void {
		if (location) this.gl.uniformMatrix4fv(location, transpose, value);
	}

	public setUniform1i(
		location: WebGLUniformLocation | null,
		value: number
	): void {
		if (location) this.gl.uniform1i(location, value);
	}

	public setUniform3fv(
		location: WebGLUniformLocation | null,
		value: Float32Array
	): void {
		if (location) this.gl.uniform3fv(location, value);
	}

	public setUniform1f(
		location: WebGLUniformLocation | null,
		value: number
	): void {
		if (location) this.gl.uniform1f(location, value);
	}

	public setUniform2fv(
		location: WebGLUniformLocation | null,
		value: Float32Array
	): void {
		if (location) this.gl.uniform2fv(location, value);
	}

	public setAttribPointer(
		location: number,
		size: number,
		type: number,
		normalized: boolean,
		stride: number,
		offset: number
	): void {
		this.gl.vertexAttribPointer(location, size, type, normalized, stride, offset);
	}

	public enableVertexAttribArray(location: number): void {
		this.gl.enableVertexAttribArray(location);
	}


}
