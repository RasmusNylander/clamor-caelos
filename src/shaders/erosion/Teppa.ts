import Shader from "../../model/Shader";
import {error, ok, Result} from "../../utils/Resulta";
import assert from "../../utils/assert";

interface VertexBuffer extends Buffer {
	glsl_name: string;
}

interface Buffer {
	buffer: WebGLBuffer;
	size: number;
}

interface InputOutputPair {
	vertex_array_object: WebGLVertexArrayObject;
	transform_feedback: WebGLTransformFeedback;
}

const number_of_raindrops: number = 1000;

export class Teppa extends Shader {
	private inputOutputPairs: {current: InputOutputPair, other: InputOutputPair};

	public canvas(): OffscreenCanvas {
		return this.gl.canvas as OffscreenCanvas;
	}

	createVertexArray(buffers: VertexBuffer[]): Result<WebGLVertexArrayObject> {
		const gl = this.gl;
		const vao = gl.createVertexArray();
		if (!vao) return error("Cannot create vertex array object");

		const attributeLocations = this.findAttributes(...buffers.map(buffer => buffer.glsl_name));
		if (!attributeLocations.ok) return error("Cannot find attributes", attributeLocations.error);

		gl.bindVertexArray(vao);
		for (let i = 0; i < buffers.length; i++) {
			gl.bindBuffer(gl.ARRAY_BUFFER, buffers[i].buffer);
			gl.enableVertexAttribArray(attributeLocations.value[i]);
			gl.vertexAttribPointer(attributeLocations.value[i], buffers[i].size, gl.FLOAT, false, 0, 0);
		}
		gl.bindVertexArray(null);
		return ok(vao);
	}

	createTransformFeedback(buffers: WebGLBuffer[]): Result<WebGLTransformFeedback> {
		const gl = this.gl;
		const transformFeedback = gl.createTransformFeedback();
		if (!transformFeedback) return error("Cannot create transform feedback");

		gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transformFeedback);
		for (let i = 0; i < buffers.length; i++) {
			try {
				gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, i, buffers[i]);
				if (gl.getError() !== gl.NO_ERROR) return error("Cannot bind buffer base to transform feedback. Failed at buffer ${i + 1}/${buffers.length}");
			}
			catch (e) {
				console.log(buffers[i])
				return error(`Cannot bind buffer base to transform feedback. Failed at buffer ${i + 1}/${buffers.length}`, e as Error);
			}
		}
		gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
		return ok(transformFeedback);
	}

	public constructor(gl: WebGL2RenderingContext) {

		const glsl_input_buffer_names = ["current_position", "current_velocity", "current_water", "current_sediment"];
		const glsl_output_buffer_names = ["new_position", "new_velocity", "new_water", "new_sediment"];
		const buffer_sizes = [2, 2, 1, 1];
		assert(buffer_sizes.length === glsl_input_buffer_names.length && buffer_sizes.length === glsl_output_buffer_names.length, "Buffer sizes must match buffer names");
		super(
			gl,
			require("./teppa_vertex.glsl"),
			require("./teppa_fragment.glsl"),
			glsl_output_buffer_names,
		);
		this.use();

		this.initTextures();

		const bufferCreationResult = this.createBuffers(buffer_sizes.length * 2);
		if (!bufferCreationResult.ok) throw new Error("Cannot create buffers", {cause: bufferCreationResult.error});
		const buffers = bufferCreationResult.value;
		const buffer_set_1: VertexBuffer[] = buffers.slice(0, buffer_sizes.length).map((buffer, i) => ({buffer, size: buffer_sizes[i], glsl_name: glsl_input_buffer_names[i]}));
		const buffer_set_2: VertexBuffer[] = buffers.slice(buffer_sizes.length, 8).map((buffer, i) => ({buffer, size: buffer_sizes[i], glsl_name: glsl_input_buffer_names[i]}));

		const input_output_pair1 = this.createInputOutputBuffersPair(buffer_set_1, buffer_set_2.map(buffer => buffer.buffer));
		if (!input_output_pair1.ok) throw new Error("Cannot create input output pair", {cause: input_output_pair1.error});
		const input_output_pair2 = this.createInputOutputBuffersPair(buffer_set_2, buffer_set_1.map(buffer => buffer.buffer));
		if (!input_output_pair2.ok) throw new Error("Cannot create input output pair", {cause: input_output_pair2.error});
		this.inputOutputPairs = {current: input_output_pair1.value, other: input_output_pair2.value};

		function lerp(a: number, b: number, t: number) {
			return a + (b - a) * t;
		}

		this.random_points = new Float32Array(number_of_raindrops * buffer_sizes[0]);
		const random_start_velocities = new Float32Array(number_of_raindrops * buffer_sizes[1]);
		const random_start_water = new Float32Array(number_of_raindrops * buffer_sizes[2]);
		for (let i = 0; i < this.random_points.length; i++) {
			if (i < this.random_points.length)
				this.random_points[i] = lerp(-1, 1, Math.random());
			if (i < random_start_velocities.length)
				random_start_velocities[i] = lerp(-1, 1, Math.random());
			if (i < random_start_water.length)
				random_start_water[i] = lerp(0.9, 1, Math.random());
		}

		for (const buffer of buffers) {
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.random_points.length), gl.STATIC_DRAW);
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, buffers[0]);
		gl.bufferData(gl.ARRAY_BUFFER, this.random_points, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, buffers[1]);
		gl.bufferData(gl.ARRAY_BUFFER, random_start_velocities, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, buffers[2]);
		gl.bufferData(gl.ARRAY_BUFFER, random_start_water, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}

	private swapInputOutput() {
		const {current, other} = this.inputOutputPairs;
		this.inputOutputPairs = {current: other, other: current};
	}

	private createInputOutputBuffersPair(input_buffers: VertexBuffer[], output_buffers: WebGLBuffer[]): Result<InputOutputPair> {
		const vertexArrayObject = this.createVertexArray(input_buffers);
		if (!vertexArrayObject.ok) return error("Cannot create vertex array object", vertexArrayObject.error);
		const transformFeedback = this.createTransformFeedback(output_buffers);
		if (!transformFeedback.ok) return error("Cannot create transform feedback", transformFeedback.error);
		return ok({vertex_array_object: vertexArrayObject.value, transform_feedback: transformFeedback.value});
	}

	private initTextures() {
		const gl = this.gl;

		const uniformLocations = this.findUniforms("heightmap");
		if (!uniformLocations.ok) throw new Error("Cannot find uniforms", {cause: uniformLocations.error});
		const [uHeightmapLocation] = uniformLocations.value;

		const heightmapTexture = gl.createTexture();
		if (!heightmapTexture) throw new Error("Cannot create height map texture");

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, heightmapTexture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
		this.setUniform1i(uHeightmapLocation, 0);
	}
	
	random_points: Float32Array;
	public erode(heightmap: TexImageSource): ImageBitmap {
		const gl = this.gl;
		gl.useProgram(this.program);


		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, heightmap);

		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.inputOutputPairs.current.transform_feedback);
		gl.beginTransformFeedback(gl.POINTS);
		gl.bindVertexArray(this.inputOutputPairs.current.vertex_array_object);
		gl.drawArrays(gl.POINTS, 0, number_of_raindrops);
		gl.bindVertexArray(null);
		gl.endTransformFeedback();
		gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
		this.swapInputOutput();

		return this.canvas().transferToImageBitmap();
	}

}