import {setupWebGL} from "./utils/WebGLUtils";
import {Context} from "./model/Context";
import heightMapPath from "./assets/images/terrain_1024.png";
import {
	identity,
	inverse,
	lookAt,
	multiply,
	perspective,
	rotateAxisTo,
	rotation,
	scalingMatrix,
	translation,
	vec3,
} from "./utils/MVU";
import {error, ok, Result} from "./utils/Resulta";
import {SubdivisionNumber} from "./model/SubdivisionNumber";

const SHOULD_LOOP = true;

function reportFatalError(error: Error): void {
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
	try {
		const canvas = document.getElementById("canvas") as HTMLCanvasElement;
		if (!canvas) return reportFatalError(new Error("Could not find canvas element"));
		const glResult = setupWebGL(canvas, {premultipliedAlpha: false});
		if (!glResult.ok) return reportFatalError(new Error("WebGL isn't available", {cause: glResult.error}));
		const gl = glResult.value;

		gl.viewport(0, 0, canvas.width, canvas.height);
		gl.clearColor(0.9, 0.9, 0.9, 0);
		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);

		const context = new Context(gl, canvas);

		const possibleError = await loadHeightmap(gl, context);
		if (!possibleError.ok) return reportFatalError(possibleError.error);
		initMatrices(context);
		const inputSetupResult = handleHTMLInput(context);
		if (!inputSetupResult.ok) return reportFatalError(new Error("Could not setup HTML input", {cause: inputSetupResult.error}));

		lastFrameTime = performance.now();
		requestAnimationFrame((time) => drawScene(gl, context, SHOULD_LOOP, time));
	} catch (error) {
		return reportFatalError(error as Error);
	}
	return;
}

/**
 * Refresh the plane buffers and recalculate the matrices.
 * @todo Later the matrices will be recalculated automatically in both the Camera class and a Mesh class, but for now we do it manually.
 * @param gl The WebGL context
 * @param context The application context
 */
function refreshPlane(gl: WebGL2RenderingContext, context: Context): void{
	context.refreshBuffers();
}

async function loadHeightmap(gl: WebGL2RenderingContext, context: Context): Promise<Result<void>> {
	const htmlImageElement = document.getElementById(
		"heightmap"
	) as HTMLImageElement;
	if (htmlImageElement === null) return error("Could not find heightmap image element");
	htmlImageElement.src = heightMapPath;

	const heightMap = await fetchHeightmap(heightMapPath);
	if (!heightMap.ok) return error("Could not fetch heightmap", heightMap.error);
	context.shader.setHeightMap(heightMap.value);
	return ok();
}

async function fetchHeightmap(url: URL): Promise<Result<ImageBitmap>> {
	const response = await fetch(url);
	if (!response.ok) return error(`Bad response: ${response.status} ${response.statusText}`);
	if (response.body === null) return error("Response body is null");
	const blob = await response.blob();
	const image = await createImageBitmap(blob);
	return ok(image);
}

/**
 * Setup the matrices for the scene
 * @todo Later the matrices will be recalculated automatically in both the Camera class and a Mesh class, but for now we do it manually.
 * @param context The context to setup the matrices for
 */
function initMatrices(context: Context): void {
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
	let modelMatrix = rotateAxisTo(context.plane.mesh_data.up_direction, context.worldUp);
	const modelTranslation = translation(context.plane.position);
	const modelScale = scalingMatrix(context.plane.scale);

	modelMatrix = multiply(modelTranslation, modelMatrix);
	modelMatrix = multiply(rotateAxisTo(context.worldUp, context.plane.up), modelMatrix);
	modelMatrix = multiply(rotation(context.plane.rotation, context.plane.up), modelMatrix);
	modelMatrix = multiply(modelMatrix, modelScale);

	context.modelMatrix = modelMatrix;
	context.viewMatrix = viewMatrix;

	/** Normal matrix of the view * model */
	context.normalMatrix = identity(4);
	const normMat = inverse(context.modelMatrix);
	if (normMat.ok) context.normalMatrix = normMat.value;

	// set matrices in shader
	context.shader.setModelMatrix(context.modelMatrix);
	context.shader.setViewMatrix(context.viewMatrix);
	context.shader.setProjectionMatrix(context.projectionMatrix);
	// context.shader.setNormalMatrix(flattenMat(context.normalMatrix));
}

/**
 * Handle the HTML input, such as the subdivision slider.
 * @todo We should probably move this to a separate input handler class/file and make it more generic and clean.
 * @param context The application context
 */
function handleHTMLInput(context: Context): Result<void> {
	const subdivisionsSlider = document.getElementById(
		"subdivisions"
	) as HTMLInputElement;
	if (subdivisionsSlider === null) return error("Could not find subdivisions slider");
	subdivisionsSlider.oninput = function (event) {
		const subdivisions = SubdivisionNumber.fromString(subdivisionsSlider.value);
		if (!subdivisions.ok) {
			const error = new Error("Could not parse subdivisions", {cause: subdivisions.error});
			reportFatalError(error);
			return;
		}
		context.setPlaneSubdivision(subdivisions.value);
		refreshPlane(context.gl, context);
		console.debug("Subdivisions changed to:", subdivisions.value);
	};

	// wireframe toggle button
	const wireframeToggle = document.getElementById(
		"wireframeToggle"
	) as HTMLInputElement;
	if (wireframeToggle === null) return error("Could not find wireframe toggle");
	wireframeToggle.onclick = function (event) {
		context.wireframe = !context.wireframe;
	};

	const tilingSlider = document.getElementById("tiling") as HTMLInputElement;
	if (tilingSlider === null) return error("Could not find tiling slider");
	tilingSlider.oninput = function (event) {
		const tiling = parseInt(tilingSlider.value);
	};

	return ok();
}

/**
 * Draw the scene, and request the next frame if we should loop
 * @param gl The WebGL context
 * @param context The application context
 * @param loop Whether to render the scene continuously
 * @param time
 */
let lastFrameTime: DOMHighResTimeStamp;
function drawScene(
	gl: WebGL2RenderingContext,
	context: Context,
	loop: boolean,
	time: number
): void {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	const deltaTime = time - lastFrameTime;
	lastFrameTime = time;

	context.rotatePlane(0.001 * deltaTime);

	context.shader.bindIndexBuffer();
	gl.drawElements(
		context.wireframe ? gl.LINES : gl.TRIANGLES,
		context.plane.mesh_data.indices.length,
		gl.UNSIGNED_SHORT,
		0
	);

	if (loop) requestAnimationFrame((newTime) => drawScene(gl, context, loop, newTime));
}
