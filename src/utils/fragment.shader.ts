import {mainShader} from "./shader.src";

export function importFragmentShader(gl:WebGLRenderingContext){
    //create fragment shader
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, mainShader.frag);
    gl.compileShader(fragmentShader);

    return fragmentShader;
}