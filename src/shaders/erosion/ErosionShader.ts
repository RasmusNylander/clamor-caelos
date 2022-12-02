import Shader from "../../model/Shader";
import {error, ok, Result} from "../../utils/Resulta";

export interface Heightmap {
    width: number;
    height: number;
    data: Array<number> | Float32Array;
}

export function heightmapFromImageBitmap(imageBitmap: ImageBitmap) {
    const canvas = document.createElement("canvas");
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return error("Could not get 2d context from canvas");
    ctx.drawImage(imageBitmap, 0, 0);
    const imageData = ctx.getImageData(0, 0, imageBitmap.width, imageBitmap.height);
    const data = new Float32Array(imageData.data.length / 4);
    for (let i = 0; i < data.length; i++) {
        data[i] = imageData.data[i * 4] / 255;
    }
    return ok({
        width: imageBitmap.width,
        height: imageBitmap.height,
        data,
    });
}

export class ErosionShader extends Shader {
    // Uniforms
    private uHeightWaterSolutesMap: WebGLUniformLocation;
    private heightWaterSolutesMap: WebGLTexture;

    public constructor(heightmap: Heightmap, gl?: WebGL2RenderingContext) {
        if (!gl) {
            gl = new OffscreenCanvas(heightmap.width, heightmap.height).getContext('webgl2') as WebGL2RenderingContext;
            if (gl === null)
                throw new Error('Unable to create offscreen canvas context, and no WebGL2RenderingContext was provided.');
        }
        super(
            gl,
            require("./erosion_vertex_shader.glsl"),
            require("./erosion_fragment_shader.glsl")
        );

        const uniformsResult = this.findUniforms("u_heightmap_watermap_solutesmap");
        if (!uniformsResult.ok) throw new Error("Cannot find uniforms", {cause: uniformsResult.error});
        [this.uHeightWaterSolutesMap] = uniformsResult.value;

        const heightWaterSolutesMap = gl.createTexture();
        if (!heightWaterSolutesMap) throw new Error("Cannot create height map texture");
        this.heightWaterSolutesMap = heightWaterSolutesMap;

        this.initTexture();
        this.initialiseDataOnGPU(heightmap);
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

    public initialiseDataOnGPU(heightmap: Heightmap): Result<void> {
        if (heightmap.width * heightmap.height !== heightmap.data.length)
            return error("Illegal heightmap!", new Error(`Heightmap data length does not match width and height. height * width = ${heightmap.width * heightmap.height}, data length = ${heightmap.data.length}`));


        const heightWaterSolutesMap = new Float32Array(heightmap.width * heightmap.height * 3);
        for (let i = 0; i < heightmap.width * heightmap.height; i++) {
            heightWaterSolutesMap[i * 3] = heightmap.data[i];
            heightWaterSolutesMap[i * 3 + 1] = 0;
            heightWaterSolutesMap[i * 3 + 2] = 0;
        }

        const gl = this.gl;
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB32F, 256, 256, 0, gl.RGB, gl.FLOAT, new Float32Array(heightWaterSolutesMap));

        gl.uniform1i(this.uHeightWaterSolutesMap, 0);
        return ok();
    }
}