const mainShader = {
    /**
     * Fragment Shader
     * Color and other interactions with verticies
    */
    frag: require("../glsl/main.frag.glsl"),
    /**
     * Vertex Shader
     * Position and so on
    */
    vert: require("../glsl/main.vert.glsl")
}

export {mainShader}