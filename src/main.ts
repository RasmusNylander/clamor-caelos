import { setupWebGL } from "./utils/WebGLUtils";
import { initShadersFromString } from "./utils/initShaders";
import { mainShader } from "./glsl/shader.src";
import createContext, { Context } from "./model/Context";
import heightMapPath from "./assets/images/perlin_512.png";
import { cube, generatePlane } from "./utils/Mesh";
import {
  flatten,
  flattenMat,
  identity,
  multiply,
  perspective,
  rotationMatrixX,
  rotationMatrixY,
  scale,
  scalingMatrix,
  translation,
  vec3,
} from "./utils/MVU";
import { generateKey } from "crypto";

const plane = cube;

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
  gl.clearColor(0, 1, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

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

  context.heightMapImage = document.getElementById(
    "heightmap"
  ) as HTMLImageElement;

  if (!context.heightMapImage)
    return onFatalError(new Error("Could not find heightmap image"));
  context.heightMapImage.src = heightMapPath;

  const heightMap = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, heightMap);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    200,
    200,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([255, 0, 0, 255])
  );
  context.heightMap = heightMap;
  console.debug("Heightmap loaded:", context.heightMapImage);

  createBuffers(gl, context);
  bindBuffers(gl, context);
  setupMatrices(context);
  gl.uniform1i(context.uniformLocations.heightMap, 0);
  drawScene(gl, context);

  return;
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
    context.attributeLocations.heightmap,
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
}

function bindBuffers(gl: WebGLRenderingContext, context: Context): void {
  gl.bindBuffer(gl.ARRAY_BUFFER, context.buffers.vertex);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(...plane.vertices), gl.STATIC_DRAW);

  gl.vertexAttribPointer(
    context.attributeLocations.vertex,
    3,
    gl.FLOAT,
    false,
    0,
    0
  );
  gl.enableVertexAttribArray(context.attributeLocations.vertex);

  gl.bindBuffer(gl.ARRAY_BUFFER, context.buffers.normal);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(...plane.normals), gl.STATIC_DRAW);

  gl.vertexAttribPointer(
    context.attributeLocations.normal,
    3,
    gl.FLOAT,
    false,
    0,
    0
  );
  gl.enableVertexAttribArray(context.attributeLocations.normal);

  gl.bindBuffer(gl.ARRAY_BUFFER, context.buffers.texture);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(...plane.uvs), gl.STATIC_DRAW);

  gl.vertexAttribPointer(
    context.attributeLocations.heightmap,
    2,
    gl.FLOAT,
    false,
    0,
    0
  );
  gl.enableVertexAttribArray(context.attributeLocations.heightmap);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, context.buffers.index);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    flatten(...plane.indices),
    gl.STATIC_DRAW
  );
  console.debug("Buffers created:", context.buffers);
}

function setupMatrices(context: Context): void {
  context.projectionMatrix = perspective(
    45,
    context.canvas.width / context.canvas.height,
    0.1,
    100
  );

  let viewMatrix = identity(4);
  const viewTranslation = translation(vec3(0, 0, -10));
  viewMatrix = multiply(viewMatrix, viewTranslation);

  let modelMatrix = identity(4);
  const modelTranslation = translation(vec3(0, -10, 0));
  const modelScale = scalingMatrix(vec3(0.5, 0.5, 0.5));
  const rotateX = rotationMatrixX(Math.PI * 0.2);
  const rotateY = rotationMatrixY(Math.PI * 0.2);

  modelMatrix = multiply(modelMatrix, modelTranslation);
  modelMatrix = multiply(modelMatrix, rotateY);
  modelMatrix = multiply(modelMatrix, rotateX);
  modelMatrix = multiply(modelMatrix, modelScale);

  context.modelViewMatrix = multiply(viewMatrix, modelMatrix);
  context.normalMatrix = identity(4);

  // calculate model view matrix
  context.modelViewMatrix = multiply(
    context.modelViewMatrix,
    context.projectionMatrix
  );
  context.normalMatrix = multiply(
    context.normalMatrix,
    context.projectionMatrix
  );

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
  gl.uniformMatrix4fv(
    context.uniformLocations.normalMatrix,
    false,
    flattenMat(context.normalMatrix)
  );
  for (let i = 0; i < plane.vertices.length; i++) {
    gl.drawElements(
      gl.TRIANGLES,
      plane.indices[i].length,
      gl.UNSIGNED_SHORT,
      0
    );
  }

  gl.flush();
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
