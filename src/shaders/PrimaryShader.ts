import Shader from "../model/Shader";

// Primary shader
export default class PrimaryShader extends Shader {
  public constructor(gl: WebGLRenderingContext) {
    super(
      gl,
      require("./vertex.glsl"),
      require("./fragment.glsl")
    );
    this.init();
  }
  // Uniforms
  private uModelViewMatrixLocation: WebGLUniformLocation | null = null;
  private uProjectionMatrixLocation: WebGLUniformLocation | null = null;
  private uNormalMatrixLocation: WebGLUniformLocation | null = null;
  private uHeightMapLocation: WebGLUniformLocation | null = null;
  private uTilingLocation: WebGLUniformLocation | null = null;

  // Attributes
  private aPositionLocation: number = -1;
  private aNormalLocation: number = -1;
  private aTextureCoordsLocation: number = -1;

  public init(): void {
    this.uModelViewMatrixLocation = this.getUniformLocation("uModelViewMatrix");
    this.uProjectionMatrixLocation =
      this.getUniformLocation("uProjectionMatrix");
    this.uNormalMatrixLocation = this.getUniformLocation("uNormalMatrix");
    this.uHeightMapLocation = this.getUniformLocation("uHeightMap");
    this.uTilingLocation = this.getUniformLocation("uTiling");

    this.aPositionLocation = this.getAttribLocation("aVertex");
    this.aNormalLocation = this.getAttribLocation("aNormal");
    this.aTextureCoordsLocation = this.getAttribLocation("aTexCoords");
  }

  public setModelViewMatrix(matrix: Float32Array): void {
    this.setUniformMatrix4fv(this.uModelViewMatrixLocation, false, matrix);
  }

  public setProjectionMatrix(matrix: Float32Array): void {
    this.setUniformMatrix4fv(this.uProjectionMatrixLocation, false, matrix);
  }

  public setNormalMatrix(matrix: Float32Array): void {
    this.setUniformMatrix4fv(this.uNormalMatrixLocation, false, matrix);
  }

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
      gl.RGB,
      gl.RGB,
      gl.UNSIGNED_BYTE,
      texImageSource
    );

    this.setUniform1i(this.uHeightMapLocation, 0);
  }

  public setTiling(tiling: number): void {
    this.setUniform1f(this.uTilingLocation, tiling);
  }

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
