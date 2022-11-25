import {setupWebGL} from "./utils/WebGLUtils";
import {Context, createContext, refreshBuffers, rotatePlane, setPlaneSubdivision,} from "./model/Context";
import heightMapPath from "./assets/images/terrain_1024.png";
import {
	flattenMat,
	identity,
	inverse,
	lookAt,
	multiply,
	perspective,
	rotationMatrixX,
	rotationMatrixY,
	rotationMatrixZ,
	scalingMatrix,
	translation,
	vec3,
} from "./utils/MVU";
import {error, ok, Result} from "./utils/Resulta";

const SHOULD_LOOP = true;

function onFatalError(error: Error): void {
	console.error(error);
	let alertMessage: string = error.message;
	while (error.cause) {
		error = error.cause as Error;
		alertMessage += "\n" + error.message;
	}
	alert(alertMessage);
	console.error("Fatal error: " + alertMessage);
	return;
}

/**
 *  the main function that is called when the page is loaded
 *  @todo We should probably move all the rendering code to a Renderer class to split the rendering from the hydraulic simulation logic
 */
export async function main(): Promise<void> {
	const canvas = document.getElementById("canvas") as HTMLCanvasElement;
	if (!canvas) return onFatalError(new Error("Could not find canvas element"));
	const gl = setupWebGL(canvas, {premultipliedAlpha: false});
	if (!gl) return onFatalError(new Error("WebGL isn't available"));

	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.9, 0.9, 0.9, 0);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.BACK);

	const contextResult = createContext(gl, canvas);
	if (!contextResult.ok) return onFatalError(contextResult.error);
	const context = contextResult.value;

	const heightMap = await fetchHeightmap(heightMapPath);
	if (!heightMap.ok) return onFatalError(heightMap.error);

	const possibleError = loadHeightmap(gl, context);
	if (!possibleError.ok) return onFatalError(possibleError.error);
	setupMatrices(context);
	handleHTMLInput(context);

	requestAnimationFrame((time) => drawScene(gl, context, SHOULD_LOOP, time));
	return;
}

/**
 * Refresh the plane buffers and recalculate the matrices.
 * @todo Later the matrices will be recalculated automatically in both the Camera class and a Mesh class, but for now we do it manually.
 * @param gl The WebGL context
 * @param context The application context
 */
function refreshPlane(gl: WebGLRenderingContext, context: Context): Result<void> {
	const result = refreshBuffers(context);
	if (!result.ok) return error("Could not refresh buffers", result.error);
	setupMatrices(context);
	return ok();
}

/**
 * Load the heightmap image and set it as a texture
 * @param gl The WebGL context
 * @param context The application context
 */
function loadHeightmap(gl: WebGLRenderingContext, context: Context): Result<void> {
	const heightMapImage = document.getElementById(
		"heightmap"
	) as HTMLImageElement;

	if (heightMapImage === null)
		return error("Could not find heightmap image element");
	heightMapImage.src = heightMapPath;

	const heightMap = gl.createTexture();
	if (!heightMap)
		return error("Could not create heightmap texture");
	context.shader.setHeightMap(heightMap, heightMapImage);
	console.debug("Heightmap loaded:", heightMapImage);
	return ok();
}

/**
 * Setup the matrices for the scene
 * @todo Later the matrices will be recalculated automatically in both the Camera class and a Mesh class, but for now we do it manually.
 * @param context The context to setup the matrices for
 */
function setupMatrices(context: Context): void {
	/**
	 *  We start with calculating the projection matrix.
	 */
	context.projectionMatrix = perspective(
		45,
		context.canvas.width / context.canvas.height,
		0.1,
		150
	);

	/**
	 *  Camera View Matrix
	 */

	let viewMatrix = identity(4);
	const eye = vec3(50, 30, 20);
	const at = vec3(0, -10, 0);
	const up = vec3(0, 1, 0);
	const viewRotation = lookAt(eye, at, up);
	viewMatrix = multiply(viewMatrix, viewRotation);

	/** Model Matrix of the terrain plane */
	let modelMatrix = identity(4);
	const modelTranslation = translation(context.plane.position);
	const modelScale = scalingMatrix(context.plane.scale);
	const rotateX = rotationMatrixX(-90 + context.plane.rotation[0]);
	const rotateY = rotationMatrixY(context.plane.rotation[1]);
	const rotateZ = rotationMatrixZ(context.plane.rotation[2]);

	modelMatrix = multiply(modelMatrix, modelTranslation);
	modelMatrix = multiply(modelMatrix, rotateX);
	modelMatrix = multiply(modelMatrix, rotateY);
	modelMatrix = multiply(modelMatrix, rotateZ);
	modelMatrix = multiply(modelMatrix, modelScale);

	context.modelViewMatrix = multiply(viewMatrix, modelMatrix);

	/** Normal matrix of the view * model */
	context.normalMatrix = identity(4);
	const normMat = inverse(context.modelViewMatrix);
	if (normMat.ok) context.normalMatrix = normMat.value;

	// set matrices in shader
	context.shader.setProjectionMatrix(flattenMat(context.projectionMatrix));
	context.shader.setModelViewMatrix(flattenMat(context.modelViewMatrix));
	context.shader.setNormalMatrix(flattenMat(context.normalMatrix));
}

/**
 * Handle the HTML input, such as the subdivision slider.
 * @todo We should probably move this to a separate input handler class/file and make it more generic and clean.
 * @param context The application context
 */
function handleHTMLInput(context: Context): void {
	const subdivisionsSlider = document.getElementById(
		"subdivisions"
	) as HTMLInputElement;
	subdivisionsSlider.oninput = function (event) {
		const subdivisions = parseInt(subdivisionsSlider.value);
		setPlaneSubdivision(context, subdivisions);
		const result = refreshPlane(context.gl, context);
		if (!result.ok) return onFatalError(result.error);
		console.debug("Subdivisions changed to:", subdivisions);
	};

	// wireframe toggle button
	const wireframeToggle = document.getElementById(
		"wireframeToggle"
	) as HTMLInputElement;
	wireframeToggle.onclick = function (event) {
		context.wireframe = !context.wireframe;
	};

	const tilingSlider = document.getElementById("tiling") as HTMLInputElement;
	tilingSlider.oninput = function (event) {
		const tiling = parseInt(tilingSlider.value);
	};
}

/**
 * Draw the scene, and request the next frame if we should loop
 * @param gl The WebGL context
 * @param context The application context
 * @param loop Whether to render the scene continuously
 * @param time The time in milliseconds since the last frame
 */
function drawScene(
	gl: WebGLRenderingContext,
	context: Context,
	loop: boolean,
	time: number
): void {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	rotatePlane(context, vec3(0, 0, 0.1));
	setupMatrices(context);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, context.buffers.index);
	gl.drawElements(
		context.wireframe ? gl.LINES : gl.TRIANGLES,
		context.plane.mesh_data.indices.length,
		gl.UNSIGNED_SHORT,
		0
	);

	if (loop) requestAnimationFrame((time) => drawScene(gl, context, loop, time));
}
