import Shader from "../../model/Shader";


export class ErosionShader extends Shader {
    // Uniforms
    private uHeightMapLocation: WebGLUniformLocation;
    private heightmap: WebGLTexture;

    // Attributes
    private aNormalLocation: number;

    // Buffers
    private normalBuffer: WebGLBuffer;

    public constructor(gl: WebGL2RenderingContext) {
        super(
            gl,
            require("./erosion_vertex.glsl"),
            require("./erosion_fragment.glsl")
        );

        const uniformsResult = this.findUniforms("uHeightMap");
        if (!uniformsResult.ok) throw new Error("Cannot find uniforms", {cause: uniformsResult.error});
        [this.uHeightMapLocation] = uniformsResult.value;

        const attributesResult = this.findAttributes("aNormal");
        if (!attributesResult.ok) throw new Error("Cannot find attributes", {cause: attributesResult.error});
        [this.aNormalLocation] = attributesResult.value;

        const buffersResult = this.createBuffers(1);
        if (!buffersResult.ok) throw new Error("Cannot create buffers", {cause: buffersResult.error});
        [this.normalBuffer] = buffersResult.value;
        this.initBuffers();

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