import {setupWebGL} from "./utils/WebGLUtils";

window.onload = main;

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

function main(): void { // : Result<void>
	const canvas = document.getElementById('canvas') as HTMLCanvasElement;
	if (!canvas) return onFatalError(new Error("Could not find canvas element"));
	const gl = setupWebGL(canvas);
	if (!gl) return onFatalError(new Error("WebGL isn't available"));

	gl.clearColor(0, 1, 1, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);
	return;
}