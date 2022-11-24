import { identity, Mat4 } from "../utils/MVU";


// The interface for the application state context
export interface Context {
    /**
     * The WebGL context
     */
    gl: WebGLRenderingContext;

    /**
     * The WebGLProgram of the main shader
     */
    program: WebGLProgram;

    /**
     * The canvas that the WebGL context is attached to
     */
    canvas: HTMLCanvasElement;

    /**
     * The heightmap in the form of a  WebGL texture
     */
    heightMap: WebGLTexture | null;

    /**
     * The html element that contains the height map image
     */
    heightMapImage: HTMLImageElement | null;

    // The buffers to send stuff to the GPU
    buffers: {

        /**
         * the vertex buffer
         * This is where the vertices are stored
         */
        vertex: WebGLBuffer  | null;

        /**
         * The normal buffer
         * This is where the normals are stored to calculate lighting and more
         */
        normal: WebGLBuffer  | null;

        /**
         * The texture coordinate buffer
         * This is where the texture coordinates are stored to map the texture to the vertices
         */
        texture: WebGLBuffer  | null;
        
        /**
         * The index buffer
         * This is where the indices are stored to tell the GPU which vertices to draw
         */
        index: WebGLBuffer  | null;
    };

    /**
     * The locations of attributes in the shader program
     */
    attributeLocations: {

        /**
         * The location of the vertex attribute in the shader program
         */
        vertex: number;

        /**
         * The location of the normals attribute in the shader program
         */
        normal: number;
        /**
         * The location of the heightmap texture attribute in the shader program
         */
        texture_coords: number;
    };

    /**
     * The uniform locations for the shader
     */
    uniformLocations: {

        /**
         * The projection matrix uniform location for the shader
         */
        projection: WebGLUniformLocation;

        /**
         * The view matrix uniform location for the shader
         */
        modelView: WebGLUniformLocation;

        /**
         * The height map uniform location for the shader
         */
        normalMatrix: WebGLUniformLocation | null;

        /**
         * The height map uniform location for the shader
         */
        heightMap: WebGLUniformLocation;
    }

    /**
     * The projection matrix for the camera
     */
    projectionMatrix: Mat4;

    /**
     * The model view matrix for the camera
     *  
     * This is the matrix that will be used to transform the vertices
     * of the objects in the scene.
     */
    modelViewMatrix: Mat4;

    /**
     * The normal matrix for the camera. This is the matrix that will be used to transform the normals of the objects in the scene.
     */
    normalMatrix: Mat4;
    
};


const createContext = (gl: WebGLRenderingContext, canvas: HTMLCanvasElement, program: WebGLProgram): Context => {
    const projectionLocation = gl.getUniformLocation(program, "uProjectionMatrix");
    const modelViewLocation = gl.getUniformLocation(program, "uModelViewMatrix");
    //const normalMatrixLocation = gl.getUniformLocation(program, "uNormalMatrix");
    const heightMapLocation = gl.getUniformLocation(program, "uHeightMap");

    if( !projectionLocation || !modelViewLocation /*|| !normalMatrixLocation*/ || !heightMapLocation ) throw new Error(`Could not get uniform locations ${projectionLocation} ${modelViewLocation} ${heightMapLocation}`);

    return {
        gl,
        canvas,
        program,
        heightMap: null,
        heightMapImage: null,
        buffers: {
            vertex: null,
            normal: null,
            texture: null,
            index: null
        },
        attributeLocations: {
            vertex: gl.getAttribLocation(program, "aVertex"),
            normal: gl.getAttribLocation(program, "aNormal"),
            texture_coords: gl.getAttribLocation(program, "aHeightmap")
        },
        uniformLocations: {
            projection: projectionLocation,
            modelView: modelViewLocation,
            normalMatrix: null,
            heightMap: heightMapLocation
        },
        projectionMatrix: identity(4),
        modelViewMatrix: identity(4),
        normalMatrix: identity(4)
    };
}

export default createContext;