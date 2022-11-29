import Shader from "../model/Shader";
import {flattenMat, Mat4} from "../utils/MVU";
import {error, ok, Result} from "../utils/Resulta";

// Primary shader
export default class PrimaryShader extends Shader {
	// Uniforms
	private uModelViewMatrixLocation: WebGLUniformLocation;
	private uProjectionMatrixLocation: WebGLUniformLocation;
	// private uNormalMatrixLocation: WebGLUniformLocation;
	private uHeightMapLocation: WebGLUniformLocation;
	// private uTilingLocation: WebGLUniformLocation;

	// Attributes
	private aPositionLocation: number;
	private aNormalLocation: number;
	private aTextureCoordsLocation: number;

	// Buffers
	private vertexBuffer: WebGLBuffer;
	private normalBuffer: WebGLBuffer;
	private textureCoordsBuffer: WebGLBuffer;
	private indexBuffer: WebGLBuffer;

	public constructor(gl: WebGLRenderingContext) {
		super(
			gl,
			require("./vertex.glsl"),
			require("./fragment.glsl")
		);

		const uniformsResult = this.findUniforms("uModelViewMatrix", "uProjectionMatrix", "uHeightMap");
		if (!uniformsResult.ok) throw new Error("Cannot find uniforms", {cause: uniformsResult.error});
		[this.uModelViewMatrixLocation, this.uProjectionMatrixLocation, this.uHeightMapLocation] = uniformsResult.value;

		const attributesResult = this.findAttributes("aPosition", "aNormal", "aTexCoords");
		if (!attributesResult.ok) throw new Error("Cannot find attributes", {cause: attributesResult.error});
		[this.aPositionLocation, this.aNormalLocation, this.aTextureCoordsLocation] = attributesResult.value;

		const buffersResult = this.createBuffers(4);
		if (!buffersResult.ok) throw new Error("Cannot create buffers", {cause: buffersResult.error});
		[this.vertexBuffer, this.normalBuffer, this.textureCoordsBuffer, this.indexBuffer] = buffersResult.value;
		this.setBuffers();
	}

	private createBuffers(num: number): Result<Array<WebGLBuffer>> {
		const buffers = new Array<WebGLBuffer | null>(num);
		for (; num > 0; num--) buffers[num - 1] = this.gl.createBuffer();
		if (buffers.some(b => b === null)) {
			const numNull = buffers.reduce((acc: number, b) => acc + (b === null ? 1 : 0), 0);
			return error(`${num} buffers were requested, but only ${numNull} were created.`);
		}
		return ok(buffers as Array<WebGLBuffer>);
	}

	public setModelViewMatrix(matrix: Mat4): void {
		this.setUniformMatrix4fv(this.uModelViewMatrixLocation, false, flattenMat(matrix));
	}

	public setProjectionMatrix(matrix: Mat4): void {
		this.setUniformMatrix4fv(this.uProjectionMatrixLocation, false, flattenMat(matrix));
	}

	// public setNormalMatrix(matrix: Float32Array): void {
	// 	this.setUniformMatrix4fv(this.uNormalMatrixLocation, false, matrix);
	// }

	public setHeightMap(
		heightMap: WebGLTexture,
		texImageSource: TexImageSource
	): void {
		const gl = this.gl;
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, heightMap);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			texImageSource
		);

		this.setUniform1i(this.uHeightMapLocation, 0);
	}

	// public setTiling(tiling: number): void {
	// 	this.setUniform1f(this.uTilingLocation, tiling);
	// }

	/** Initialize buffers */
	public setBuffers(): void {
		this.setPositionBuffer();
		this.setNormalBuffer();
		this.setTextureCoordsBuffer();
		this.bindIndexBuffer();
	}

	public setPositionBuffer(): void {
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
		this.gl.vertexAttribPointer(
			this.aPositionLocation,
			3,
			this.gl.FLOAT,
			false,
			0,
			0
		);
		this.gl.enableVertexAttribArray(this.aPositionLocation);
	}

	public setNormalBuffer(): void {
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
		this.gl.vertexAttribPointer(
			this.aNormalLocation,
			3,
			this.gl.FLOAT,
			false,
			0,
			0
		);
		this.gl.enableVertexAttribArray(this.aNormalLocation);
	}

	public setTextureCoordsBuffer(): void {
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureCoordsBuffer);
		this.gl.vertexAttribPointer(
			this.aTextureCoordsLocation,
			2,
			this.gl.FLOAT,
			false,
			0,
			0
		);
		this.gl.enableVertexAttribArray(this.aTextureCoordsLocation);
	}

	public bindIndexBuffer(): void {
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
	}

	/** Set buffer data */

	private setBufferData(buffer: WebGLBuffer, data: Float32Array | Uint16Array, bufferType: BufferType = BufferType.ARRAY_BUFFER): void {
		this.gl.bindBuffer(bufferType, buffer);
		this.gl.bufferData(bufferType, data, this.gl.STATIC_DRAW);
	}

	public setPositionBufferData(data: Float32Array): void {
		this.setBufferData(this.vertexBuffer, data);
	}

	public setNormalBufferData(data: Float32Array): void {
		this.setBufferData(this.normalBuffer, data);
	}

	public setTextureCoordsBufferData(data: Float32Array): void {
		this.setBufferData(this.textureCoordsBuffer, data);
	}

	public setIndexBufferData(data: Uint16Array): void {
		this.setBufferData(this.indexBuffer, data, BufferType.ELEMENT_ARRAY_BUFFER);
	}
}

enum BufferType {
	ARRAY_BUFFER = WebGLRenderingContext.ARRAY_BUFFER,
	ELEMENT_ARRAY_BUFFER = WebGLRenderingContext.ELEMENT_ARRAY_BUFFER,
}