import Shader from "../../model/Shader";

export interface Heightmap {
    width: number;
    height: number;
    data: Array<number> | Float32Array;
}

export class ErosionShader extends Shader {
    // Uniforms
    private uHeightWaterSolutesMap: WebGLUniformLocation;
    private heightWaterSolutesMap: WebGLTexture;

    // Buffers
    private dummyBuffer: WebGLBuffer;

    public constructor(gl: WebGL2RenderingContext, heightmap: Heightmap) {
        super(
            gl,
            require("./erosion_vertex_shader.glsl"),
            require("./erosion_fragment_shader.glsl")
        );

        const uniformsResult = this.findUniforms("u_heightmap_watermap_solutesmap");
        if (!uniformsResult.ok) throw new Error("Cannot find uniforms", {cause: uniformsResult.error});
        [this.uHeightWaterSolutesMap] = uniformsResult.value;

        const buffersResult = this.createBuffers(1);
        if (!buffersResult.ok) throw new Error("Cannot create buffers", {cause: buffersResult.error});
        [this.dummyBuffer] = buffersResult.value;
        this.initDummyBuffer(heightmap.width * heightmap.height);

        const heightWaterSolutesMap = gl.createTexture();
        if (!heightWaterSolutesMap) throw new Error("Cannot create height map texture");
        this.heightWaterSolutesMap = heightWaterSolutesMap;

        this.initTexture();
    }

    protected initDummyBuffer(lengthOfDummyData: number): void {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.dummyBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(lengthOfDummyData), this.gl.STATIC_DRAW);
    }

    private initTexture(): void {
        const gl = this.gl;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.heightWaterSolutesMap);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
}