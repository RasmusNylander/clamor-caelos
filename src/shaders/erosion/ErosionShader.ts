import Shader from "../../model/Shader";

export interface Heightmap {
    width: number;
    height: number;
    data: Array<number> | Float32Array;
}

export class ErosionShader extends Shader {
    // Uniforms
    private uHeightMapLocation: WebGLUniformLocation;
    private heightmap: WebGLTexture;

    // Attributes
    private aNormalLocation: number;

    // Buffers
    private normalBuffer: WebGLBuffer;

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

        const heightmap = gl.createTexture();
        if (!heightmap) throw new Error("Cannot create height map texture");
        this.heightmap = heightmap;
    }

    initBuffers(): void {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
        
    }

    public setHeightMap(heightmap: WebGLTexture): void {
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, heightmap);
        this.gl.uniform1i(this.uHeightMapLocation, 0);
    }

    

}