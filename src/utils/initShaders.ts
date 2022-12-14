//
//  initShaders.js
//

import {error, Failure, ok, Result} from "./Resulta";

export enum ShaderType {
	VERTEX_SHADER,
	FRAGMENT_SHADER,
}

function shaderTypeToString(shaderType: ShaderType): string {
	switch (shaderType) {
		case ShaderType.VERTEX_SHADER:
			return "vertex shader";
		case ShaderType.FRAGMENT_SHADER:
			return "fragment shader";
	}
	throw new Error(`Unreachable! Unknown shader type: ${shaderType}`);
}

export function compileShader(gl: WebGL2RenderingContext, shaderType: ShaderType, shaderSource: string): Result<WebGLShader> {
	const shader: WebGLShader | null = gl.createShader(shaderType === ShaderType.VERTEX_SHADER ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER);
	if (shader === null) {
		return error("WebGL returned null shader.");
	}

	gl.shaderSource(shader, shaderSource);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const info = gl.getShaderInfoLog(shader);
		gl.deleteShader(shader);
		return error(`Failed to compile ${shaderTypeToString(shaderType)} shader: ${info}`);
	}
	return ok(shader);
}

export function loadShader(gl: WebGL2RenderingContext, type: ShaderType, shaderId: string): Result<WebGLShader> {
	const shaderScriptElement = document.getElementById(shaderId) as HTMLScriptElement;
	if (!shaderScriptElement)
		return error("Could not find shader script element with id: " + shaderId);
	const source = shaderScriptElement.text;
	let shader = compileShader(gl, type, source);
	if (!shader.ok)
		return error(`Failed to compile ${shaderId}`, (<Failure>shader).error);
	return shader;
}

export async function loadShaderFromFile(gl: WebGL2RenderingContext, type: ShaderType, filename: string): Promise<Result<WebGLShader>> {
	try {
		const response: Response = await fetch(filename);
		const source = await response.text();
		return compileShader(gl, type, source);
	} catch (e) {
		return error(`Unable to fetch shader '${filename}'`, e as Error);
	}
}

export function loadShaderFromString(gl: WebGL2RenderingContext, type: ShaderType, source: string): Result<WebGLShader> {
	return compileShader(gl, type, source);
}

export function compileProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader, transformFeedbackVaryings: Array<string>): Result<WebGLProgram> {
	const program = gl.createProgram();
	if (program === null) {
		return error("WebGL returned null program.");
	}

	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	if (transformFeedbackVaryings.length > 0) {
		gl.transformFeedbackVaryings(program, transformFeedbackVaryings, gl.SEPARATE_ATTRIBS);
	}
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		const info = gl.getProgramInfoLog(program);
		gl.deleteProgram(program);
		gl.deleteShader(vertexShader);
		gl.deleteShader(fragmentShader);
		return error(`Failed to link shader program: ${info}`);
	}
	return ok(program);
}

export async function initShadersFromFile(gl: WebGL2RenderingContext, vertexShaderFilename: string, fragmentShaderFilename: string, transformFeedbackVaryings?: Array<string>): Promise<Result<WebGLProgram>> {
	const [vertexShader, fragmentShader] = await Promise.all([
		loadShaderFromFile(gl, ShaderType.VERTEX_SHADER, vertexShaderFilename),
		loadShaderFromFile(gl, ShaderType.FRAGMENT_SHADER, fragmentShaderFilename),
	]);

	if (vertexShader.ok && fragmentShader.ok)
		return compileProgram(gl, vertexShader.value, fragmentShader.value, !transformFeedbackVaryings ? [] : transformFeedbackVaryings); // Memory leak on failure: the shaders are not deleted.

	gl.deleteShader(vertexShader.ok ? vertexShader.value : null);
	gl.deleteShader(fragmentShader.ok ? fragmentShader.value : null);

	if (!vertexShader.ok && !fragmentShader.ok)
		return error(`Failed to compile both vertex and fragment shaders.\nVertex shader error: ${vertexShader["error"].message}\nFragment shader error: ${fragmentShader["error"].message}`);

	if (!vertexShader.ok)
		return error(`Failed to load vertex shader '${vertexShaderFilename}'`, (<Failure>vertexShader).error);
	return error(`Failed to load fragment shader '${fragmentShaderFilename}'`, (<Failure>fragmentShader).error);
}

export function initShadersFromString(gl: WebGL2RenderingContext, vertexShaderSource: string, fragmentShaderSource: string, transformFeedbackVaryings?: Array<string>): Result<WebGLProgram> {
	const vertexShader = compileShader(gl, ShaderType.VERTEX_SHADER, vertexShaderSource);
	const fragmentShader = compileShader(gl, ShaderType.FRAGMENT_SHADER, fragmentShaderSource);

	if (vertexShader.ok && fragmentShader.ok)
		return compileProgram(gl, vertexShader.value, fragmentShader.value, !transformFeedbackVaryings ? [] : transformFeedbackVaryings); // Memory leak on failure: the shaders are not deleted.

	gl.deleteShader(vertexShader.ok ? vertexShader.value : null);
	gl.deleteShader(fragmentShader.ok ? fragmentShader.value : null);

	if (!vertexShader.ok && !fragmentShader.ok)
		return error(`Failed to compile both vertex and fragment shaders.\nVertex shader error: ${vertexShader["error"].message}\nFragment shader error: ${fragmentShader["error"].message}`);

	if (!vertexShader.ok)
		return error(`Failed to load vertex shader`, (<Failure>vertexShader).error);
	return error(`Failed to load fragment shader`, (<Failure>fragmentShader).error);
}

export function initShaders(gl: WebGL2RenderingContext, vertexShaderId: string, fragmentShaderId: string, transformFeedbackVaryings?: Array<string>): Result<WebGLProgram> {
	const program: WebGLProgram | null = gl.createProgram();
	if (program === null)
		return error("WebGL returned null program.");

	let vertexShaderResult = loadShader(gl, ShaderType.VERTEX_SHADER, vertexShaderId);
	if (!vertexShaderResult.ok) return vertexShaderResult;
	let vertexShader = vertexShaderResult.value;

	let fragmentShaderResult = loadShader(gl, ShaderType.FRAGMENT_SHADER, fragmentShaderId);
	if (!fragmentShaderResult.ok) {
		gl.deleteShader(vertexShader);
		return fragmentShaderResult;
	}
	let fragmentShader = fragmentShaderResult.value;

	return compileProgram(gl, vertexShader, fragmentShader, !transformFeedbackVaryings ? [] : transformFeedbackVaryings); // Memory leak on failure: the shaders are not deleted.
}