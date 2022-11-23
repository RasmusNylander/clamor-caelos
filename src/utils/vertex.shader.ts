import {mainShader} from "./shader.src";

export function importVertexShader(gl:WebGLRenderingContext){
    //Vertex shader (can has params)
    //create vertex shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, mainShader.vert);
    gl.compileShader(vertexShader);

    return vertexShader;
}