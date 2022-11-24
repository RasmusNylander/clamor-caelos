import { setupWebGL } from "./utils/WebGLUtils";
import { initShadersFromString } from "./utils/initShaders";
import { mainShader } from "./glsl/shader.src";
import createContext, { Context } from "./model/Context";
import heightMapPath from "./assets/images/perlin_512.png";
import { generatePlane, plane as Plane} from "./utils/Mesh";
import {
  flatten,
  flattenMat,
  identity,
  inverse,
  lookAt,
  multiply,
  perspective,
  rotationMatrixX,
  rotationMatrixY,
  scale,
  scalingMatrix,
  translation,
  vec3,
} from "./utils/MVU";

const plane = generatePlane(100, 100, 100);

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

export async function main(): Promise<void> {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  if (!canvas) return onFatalError(new Error("Could not find canvas element"));
  const gl = setupWebGL(canvas);
  if (!gl) return onFatalError(new Error("WebGL isn't available"));

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.9, 0.9, 0.9, 1);
  gl.enable(gl.DEPTH_TEST);

  console.debug("Loading shaders: ", mainShader);

  const program = initShadersFromString(
    gl,
    mainShader.vertex,
    mainShader.fragment
  );

  if (!program.ok) return onFatalError(program.error);
  gl.useProgram(program.value);
  console.debug("Shader program loaded:", program.value);

  const context = createContext(gl, canvas, program.value);
  console.debug("Context created:", context);

  createBuffers(gl, context);
  loadHeightmap(gl, context);
  bindBuffers(gl, context);
  setupMatrices(context);
  drawScene(gl, context);
  return;
}
function loadHeightmap(gl: WebGLRenderingContext, context: Context): void {
  context.heightMapImage = document.getElementById(
    "heightmap"
  ) as HTMLImageElement;

  if (!context.heightMapImage)
    return onFatalError(new Error("Could not find heightmap image"));
  context.heightMapImage.src = heightMapPath;

  const heightMap = gl.createTexture();
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, heightMap);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGB,
    gl.RGB,
    gl.UNSIGNED_BYTE,
    context.heightMapImage
  );
  gl.uniform1i(context.uniformLocations.heightMap, 0);

  console.debug("Heightmap loaded:", context.heightMapImage);
}

function createBuffers(gl: WebGLRenderingContext, context: Context): void {
  const vBuffer = createEmptyArrayBuffer(
    gl,
    context.attributeLocations.vertex,
    3,
    gl.FLOAT
  );
  const nBuffer = createEmptyArrayBuffer(
    gl,
    context.attributeLocations.normal,
    3,
    gl.FLOAT
  );
  const hBuffer = createEmptyArrayBuffer(
    gl,
    context.attributeLocations.texture_coords,
    2,
    gl.FLOAT
  );
  const iBuffer = gl.createBuffer();

  if (!vBuffer || !nBuffer || !hBuffer || !iBuffer)
    return onFatalError(new Error("Could not create buffers"));

  context.buffers = {
    vertex: vBuffer,
    normal: nBuffer,
    texture: hBuffer,
    index: iBuffer,
  };
  console.debug("Buffers created:", context.buffers);
}

function bindBuffers(gl: WebGLRenderingContext, context: Context): void {
  gl.bindBuffer(gl.ARRAY_BUFFER, context.buffers.vertex);
  gl.bufferData(gl.ARRAY_BUFFER, plane.vertices, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, context.buffers.normal);
  gl.bufferData(gl.ARRAY_BUFFER, plane.normals, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, context.buffers.texture);
  gl.bufferData(gl.ARRAY_BUFFER, plane.uvs, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, context.buffers.index);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, plane.indices, gl.STATIC_DRAW);
  console.debug("All buffers bound");
}

function setupMatrices(context: Context): void {
  context.projectionMatrix = perspective(
    45,
    context.canvas.width / context.canvas.height,
    0.1,
    100
  );

  let viewMatrix = identity(4);
  const eye = vec3(20, 0, 0);
  const at = vec3(0, 0, 0);
  const up = vec3(0, 1, 0);
  const viewRotation = lookAt(eye, at, up);
  viewMatrix = multiply(viewMatrix, viewRotation);

  let modelMatrix = identity(4);
  const modelTranslation = translation(vec3(0, 0, 0));
  const modelScale = scalingMatrix(vec3(100, 100, 1));
  const rotateX = rotationMatrixX(-90);
  const rotateY = rotationMatrixY(0);

  modelMatrix = multiply(modelMatrix, modelTranslation);
  modelMatrix = multiply(modelMatrix, rotateY);
  modelMatrix = multiply(modelMatrix, rotateX);
  modelMatrix = multiply(modelMatrix, modelScale);

  context.modelViewMatrix = multiply(viewMatrix, modelMatrix);
  context.normalMatrix = identity(4);

 
  // calculate normal matrix
  const normMat = inverse(context.modelViewMatrix);
  if (normMat.ok) context.normalMatrix = normMat.value;

  console.debug(
    "Matrices loaded:",
    context.projectionMatrix,
    context.modelViewMatrix,
    context.normalMatrix
  );
}

function drawScene(gl: WebGLRenderingContext, context: Context): void {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.uniformMatrix4fv(
    context.uniformLocations.projection,
    false,
    flattenMat(context.projectionMatrix)
  );
  gl.uniformMatrix4fv(
    context.uniformLocations.modelView,
    false,
    flattenMat(context.modelViewMatrix)
  );

  //   gl.uniformMatrix4fv(
  //     context.uniformLocations.normalMatrix,
  //     false,
  //     flattenMat(context.normalMatrix)
  //   );

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, context.buffers.index);

  //gl.drawArrays(gl.TRIANGLES, 0, plane.vertices.length);
  gl.drawElements(gl.TRIANGLES, plane.indices.length, gl.UNSIGNED_SHORT, 0);
  console.debug("Scene drawn");
}

export function createEmptyArrayBuffer(
  gl: WebGLRenderingContext,
  a_attribute: number,
  num: number,
  type: number
) {
  var buffer = gl.createBuffer(); // Create a buffer object
  if (!buffer) {
    console.log("Failed to create the buffer object");
    return null;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0); // Assign the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute); // Enable the assignment

  return buffer;
}
