window.onload = () => {
	const canvas = document.getElementById('canvas') as HTMLCanvasElement;
	console.log(canvas);
	const gl = canvas.getContext('webgl') as WebGLRenderingContext;
	gl.clearColor(0, 1, 0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);
}