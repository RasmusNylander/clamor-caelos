import { ShaderSource } from "../model/ShaderSource";

const mainShader : ShaderSource = {
    fragment: require("../glsl/main.frag.glsl"),
    vertex: require("../glsl/main.vert.glsl" )
} 

export {mainShader}