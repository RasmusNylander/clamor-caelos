import Shader from "../model/Shader";
import {Result} from "../utils/Resulta";

// Primary shader
export default class PrimaryShader extends Shader {
	public constructor(gl: WebGLRenderingContext) {
		super(
			gl,
			require("./vertex.glsl"),
			require("./fragment.glsl")
		);

		let result: Result<any>;

		result = this.getUniformLocation("uModelViewMatrix");
		if (!result.ok) throw result.error;
		this.uModelViewMatrixLocation = result.value;

		result = this.getUniformLocation("uProjectionMatrix");
		if (!result.ok) throw result.error;
		this.uProjectionMatrixLocation = result.value;

		// result = this.getUniformLocation("uNormalMatrix");
		// if (!result.ok) throw result.error;
		// this.uNormalMatrixLocation = result.value;

		result = this.getUniformLocation("uHeightMap");
		if (!result.ok) throw result.error;
		this.uHeightMapLocation = result.value;

		// result = this.getUniformLocation("uTiling");
		// if (!result.ok) throw result.error;
		// this.uTilingLocation = result.value;


		result = this.getAttribLocation("aPosition");
		if (!result.ok) throw result.error;
		this.aPositionLocation = result.value;

		result = this.getAttribLocation("aNormal");
		if (!result.ok) throw result.error;
		this.aNormalLocation = result.value;

		result = this.getAttribLocation("aTexCoords");
		if (!result.ok) throw result.error;
		this.aTextureCoordsLocation = result.value;
	}

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

	public setModelViewMatrix(matrix: Float32Array): void {
		this.setUniformMatrix4fv(this.uModelViewMatrixLocation, false, matrix);
	}

	public setProjectionMatrix(matrix: Float32Array): void {
		this.setUniformMatrix4fv(this.uProjectionMatrixLocation, false, matrix);
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

	public setPositionBuffer(buffer: WebGLBuffer): void {
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
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

	public setNormalBuffer(buffer: WebGLBuffer): void {
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
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

	public setTextureCoordsBuffer(buffer: WebGLBuffer): void {
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
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

	public setIndexBuffer(buffer: WebGLBuffer): void {
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
	}

	/** Set buffer data */

	private setBufferData(buffer: WebGLBuffer, data: Float32Array): void {
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
	}

	public setPositionBufferData(buffer: WebGLBuffer, data: Float32Array): void {
		this.setBufferData(buffer, data);
	}

	public setNormalBufferData(buffer: WebGLBuffer, data: Float32Array): void {
		this.setBufferData(buffer, data);
	}

	public setTextureCoordsBufferData(
		buffer: WebGLBuffer,
		data: Float32Array
	): void {
		this.setBufferData(buffer, data);
	}

	public setIndexBufferData(buffer: WebGLBuffer, data: Uint16Array): void {
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
	}
}
