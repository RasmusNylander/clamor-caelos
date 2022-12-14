import {setupWebGL} from "./utils/WebGLUtils";
import {Context} from "./model/Context";
// import heightMapPath from "./assets/images/terrain_1024.png";
// import heightMapPath from "./assets/images/perlin_512.png";
import heightMapPath from "./assets/images/texture.png";
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
import PrimaryShader from "./shaders/PrimaryShader";
import {Teppa} from "./shaders/erosion/Teppa";

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

let heightmapContext;
let heightmapImage: ImageBitmap;

/**
 *  the main function that is called when the page is loaded
 *  @todo We should probably move all the rendering code to a Renderer class to split the rendering from the hydraulic simulation logic
 */
export async function main(): Promise<void> {
	try {
		const heightmapPromise = fetchHeightmap(heightMapPath);

		const heightmapCanvas = document.getElementById("heightmap") as HTMLCanvasElement;
		if (heightmapCanvas === null) return reportFatalError(new Error("Could not find heightmap canvas"));
		const heightmapContext = heightmapCanvas.getContext("2d");
		if (heightmapContext === null) return reportFatalError(new Error("Could not get 2d context from heightmap canvas"));
		heightmapDisplayCanvasTemp = heightmapCanvas;
		heightmapDisplayContextTemp = heightmapContext;

		const canvas = document.getElementById("canvas") as HTMLCanvasElement;
		if (!canvas) return reportFatalError(new Error("Could not find canvas element"));
		const glResult = setupWebGL(canvas, {premultipliedAlpha: false});
		if (!glResult.ok) return reportFatalError(new Error("Could not get WebGL2 context for main canvas", {cause: glResult.error}));
		const gl = glResult.value;

		gl.viewport(0, 0, canvas.width, canvas.height);
		gl.clearColor(0.9, 0.9, 0.9, 0);
		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);


		const heightmapImage = await heightmapPromise;
		if (!heightmapImage.ok) return reportFatalError(new Error("Could not fetch heightmap", {cause: heightmapImage.error}));

		const erosionCanvas = new OffscreenCanvas(heightmapImage.value.width, heightmapImage.value.height);
		console.log("Erosion canvas size: " + erosionCanvas.width + "x" + erosionCanvas.height);
		const erosionContext = erosionCanvas.getContext("webgl2") as WebGL2RenderingContext;
		if (erosionContext === null) return reportFatalError(new Error("Could not get WebGL2 context for erosion canvas"));



		const primaryShader = new PrimaryShader(gl);
		const erosionShader = new Teppa(<WebGL2RenderingContext>erosionContext);
		heightmapImageTemp = heightmapImage.value;
		heightmapImageCanvasTemp = document.createElement("canvas");
		heightmapImageCanvasTemp.width = heightmapImage.value.width;
		heightmapImageCanvasTemp.height = heightmapImage.value.height;
		const heightmapImageContextTempResult = heightmapImageCanvasTemp.getContext("2d");
		if (heightmapImageContextTempResult === null) return reportFatalError(new Error("Could not get 2d context from heightmap image canvas"));
		heightmapImageContextTemp = heightmapImageContextTempResult;
		heightmapImageContextTemp.drawImage(heightmapImage.value, 0, 0);

		heightmapContext.drawImage(heightmapImage.value, 0, 0, heightmapCanvas.width, heightmapCanvas.height);

		primaryShader.setHeightMap(heightmapImage.value);
		primaryShader.use()

		const context = new Context(primaryShader, erosionShader, canvas);

		initMatrices(context);
		const inputSetupResult = handleHTMLInput(context);
		if (!inputSetupResult.ok) return reportFatalError(new Error("Could not setup HTML input", {cause: inputSetupResult.error}))

		lastFrameTime = performance.now();
		requestAnimationFrame((time) => drawScene(gl, context, SHOULD_LOOP, time));
	} catch (error) {
		return reportFatalError(error as Error);
	}
	return;
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

	/** Model Matrix of the terrain plane */
	let modelMatrix = rotateAxisTo(context.plane.mesh_data.up_direction, context.worldUp);
	modelMatrix = multiply(translation(context.plane.position), modelMatrix);
	modelMatrix = multiply(rotateAxisTo(context.worldUp, context.plane.up), modelMatrix);
	modelMatrix = multiply(rotation(context.plane.rotation, context.plane.up), modelMatrix);
	modelMatrix = multiply(scalingMatrix(context.plane.scale), modelMatrix);
	context.modelMatrix = modelMatrix;

	/** Normal matrix of the view * model */
	context.normalMatrix = identity(4);
	const normMat = inverse(context.modelMatrix);
	if (normMat.ok) context.normalMatrix = normMat.value;

	/**
	 *  Camera View Matrix
	 */
	const camera_position = vec3(50, 30, 20);
	const camera_up_direction = vec3(0, 1, 0);
	const point_looked_at = vec3(0, -10, 0);
	context.viewMatrix = lookAt(camera_position, point_looked_at, camera_up_direction);

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
let heightmapDisplayCanvasTemp: HTMLCanvasElement;
let heightmapDisplayContextTemp: CanvasRenderingContext2D;
let heightmapImageTemp: TexImageSource;
let heightmapImageCanvasTemp: HTMLCanvasElement;
let heightmapImageContextTemp: CanvasRenderingContext2D;
function drawScene(
	gl: WebGL2RenderingContext,
	context: Context,
	loop: boolean,
	time: number
): void {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	const deltaTime = time - lastFrameTime;
	lastFrameTime = time;

	context.rotatePlane(0.0001 * deltaTime);

	context.shader.bindIndexBuffer();
	gl.drawElements(
		context.wireframe ? gl.LINES : gl.TRIANGLES,
		context.plane.mesh_data.indices.length,
		gl.UNSIGNED_SHORT,
		0
	);

	const heightmapChange = context.erosionShader.erode(heightmapImageCanvasTemp);
	heightmapImageContextTemp.drawImage(heightmapChange, 0, 0, );
	heightmapDisplayContextTemp.drawImage(heightmapChange, 0, 0, heightmapDisplayCanvasTemp.width, heightmapDisplayCanvasTemp.height);
	context.shader.setHeightMap(heightmapDisplayCanvasTemp);

	if (loop) requestAnimationFrame((newTime) => drawScene(gl, context, loop, newTime));
}
