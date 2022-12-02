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

    }

    protected initDummyBuffer(lengthOfDummyData: number): void {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.dummyBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(lengthOfDummyData), this.gl.STATIC_DRAW);
    }

}