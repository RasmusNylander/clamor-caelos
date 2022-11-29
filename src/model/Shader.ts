import {initShadersFromString} from "../utils/initShaders";
import {error, Failure, ok, Result, Success} from "../utils/Resulta";

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

	protected getUniformLocation(name: string): Result<WebGLUniformLocation> {
		const location = this.gl.getUniformLocation(this.program, name);
		if (location) return ok(location);
		return error(`Could not find uniform ${name}`);
	}

	public getAttributeLocation(name: string): Result<GLint> {
		const location = this.gl.getAttribLocation(this.program, name);
		if (location >= 0) return ok(location);
		return error(`Could not find attribute ${name}`);
	}

	protected findUniforms(...names: string[]): Result<Array<WebGLUniformLocation>> {
		if (names === null || names.length === 0)
			return error("No uniforms were specified");

		const results = names.map(name => this.getUniformLocation(name));
		if (results.every(result => result.ok))
			return ok(results.map(result => (result as Success<WebGLUniformLocation>).value));

		const errors = results.filter(result => !result.ok).map(result => (result as Failure).error);
		return error(errors.join("\n\n"));
	}

	protected findAttributes(...names: string[]): Result<Array<GLint>> {
		if (names === null || names.length === 0)
			return error("No attributes were specified");

		const results = names.map(name => this.getAttributeLocation(name));
		if (results.every(result => result.ok))
			return ok(results.map(result => (result as Success<GLint>).value));

		const errors = results.filter(result => !result.ok).map(result => (result as Failure).error);
		return error(errors.join("\n\n"));
	}

	public setUniformMatrix4fv(
		location: WebGLUniformLocation,
		transpose: boolean,
		value: Float32Array
	) {
		this.gl.uniformMatrix4fv(location, transpose, value);
	}

	public setUniform1i(
		location: WebGLUniformLocation,
		value: number
	): void {
		this.gl.uniform1i(location, value);
	}

	public setUniform3fv(
		location: WebGLUniformLocation,
		value: Float32Array
	): void {
		this.gl.uniform3fv(location, value);
	}

	public setUniform1f(
		location: WebGLUniformLocation,
		value: number
	): void {
		this.gl.uniform1f(location, value);
	}

	public setUniform2fv(
		location: WebGLUniformLocation,
		value: Float32Array
	): void {
		this.gl.uniform2fv(location, value);
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
