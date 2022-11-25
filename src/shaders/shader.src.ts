import {ShaderSource} from "../model/ShaderSource";

const mainShader: ShaderSource = {
	fragment: require("./fragment.glsl"),
	vertex: require("./vertex.glsl")
}

export {mainShader}