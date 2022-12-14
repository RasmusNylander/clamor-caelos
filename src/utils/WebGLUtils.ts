import {error, ok, Result} from "./Resulta";

/**
 * Creates a webgl context.
 * @param {HTMLCanvasElement} canvas. The canvas element to create a context from.
 * @param {WebGLContextAttributes} opt_attribs Any creation attributes you want to pass in.
 * @return {Result<WebGL2RenderingContext>} A result containing the created context or an error.
 */
export function setupWebGL(canvas: HTMLCanvasElement, opt_attribs?: WebGLContextAttributes): Result<WebGL2RenderingContext> {
	if (!window.WebGL2RenderingContext)
		return error("WebGL is not supported by your browser. See https://get.webgl.org/ for more information.");

	return create3DContext(canvas, opt_attribs);
}


/**
 * Creates a webgl context.
 * @param {HTMLCanvasElement} canvas The canvas tag to get context from.
 * @return {Result<WebGL2RenderingContext>} A result containing the created context or an error.
 */
export function create3DContext(canvas: HTMLCanvasElement, opt_attribs?: WebGLContextAttributes): Result<WebGL2RenderingContext> {
	const names = ["webgl2", "experimental-webgl2"];
	for (const name of names) {
		try {
			const context = <WebGL2RenderingContext>canvas.getContext(name, opt_attribs);
			if (context !== null) return ok(context);
		} catch (e) {}
	}
	return error("Could not create WebGL context", new Error("It doesn't appear your computer can support WebGL; see https://get.webgl.org/troubleshooting/"));
}
