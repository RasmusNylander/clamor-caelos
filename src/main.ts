import {setupWebGL} from "./utils/WebGLUtils";
import {initShadersFromString} from "./utils/initShaders";
import {mainShader} from "./glsl/shader.src";

function onFatalError(error: Error): void {
	console.log(error);
	let alertMessage: string = error.message;
	while (error.cause) {
		error = error.cause as Error;
		alertMessage += "\n" + error.message;
	}
	alert(alertMessage);
	console.log("Fatal error: " + alertMessage);
	return;
}

export async function main(): Promise<void> {
	const canvas = document.getElementById('canvas') as HTMLCanvasElement;
	if (!canvas) return onFatalError(new Error("Could not find canvas element"));
	const gl = setupWebGL(canvas);
	if (!gl) return onFatalError(new Error("WebGL isn't available"));

	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0, 1, 1, 1);
	gl.clear(gl.COLOR_BUFFER_BIT)

	const program = initShadersFromString(gl, mainShader.vertex, mainShader.fragment);
	if (!program.ok) return onFatalError(program.error);
	gl.useProgram(program.value);
	const heightMap = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, heightMap);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 200, 200, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255]));


	return;
}
