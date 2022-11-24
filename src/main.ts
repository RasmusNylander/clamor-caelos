import { setupWebGL } from "./utils/WebGLUtils";
import { initShadersFromString } from "./utils/initShaders";
import { mainShader } from "./shaders/shader.src";
import createContext, {
  Context,
  refreshBuffers,
  rotatePlane,
  setPlaneSubdivision,
} from "./model/Context";
import heightMapPath from "./assets/images/perlin_512.png";
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
  rotationMatrixZ,
  scale,
  scalingMatrix,
  translation,
  vec3,
} from "./utils/MVU";
import Shader from "./model/Shader";

const SHOULD_LOOP = true;

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
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  const context = createContext(gl, canvas);

  loadHeightmap(gl, context);
  setupMatrices(context);
  handleHTMLInput(context);

  requestAnimationFrame((time) => drawScene(gl, context, SHOULD_LOOP, time));
  return;
}

// Refresh the plane mesh and buffers
function refreshPlane(gl: WebGLRenderingContext, context: Context): void {
  refreshBuffers(context);
  setupMatrices(context);
}

function loadHeightmap(gl: WebGLRenderingContext, context: Context): void {
  context.heightMapImage = document.getElementById(
    "heightmap"
  ) as HTMLImageElement;

  if (!context.heightMapImage)
    return onFatalError(new Error("Could not find heightmap image"));
  context.heightMapImage.src = heightMapPath;

  const heightMap = gl.createTexture();
  if (!heightMap) return onFatalError(new Error("Could not create heightmap"));
  context.shader.setHeightMap(heightMap, context.heightMapImage);
  console.debug("Heightmap loaded:", context.heightMapImage);
}
function setupMatrices(context: Context): void {
  context.projectionMatrix = perspective(
    45,
    context.canvas.width / context.canvas.height,
    0.1,
    150
  );

  let viewMatrix = identity(4);
  const eye = vec3(50, 30, 20);
  const at = vec3(0, -10, 0);
  const up = vec3(0, 1, 0);
  const viewRotation = lookAt(eye, at, up);
  viewMatrix = multiply(viewMatrix, viewRotation);

  let modelMatrix = identity(4);
  const modelTranslation = translation(context.plane.position);
  const modelScale = scalingMatrix(context.plane.scale);
  const rotateX = rotationMatrixX(-90 + context.plane.rotation[0]);
  const rotateY = rotationMatrixY(context.plane.rotation[1]);
  const rotateZ = rotationMatrixZ(context.plane.rotation[2]);

  modelMatrix = multiply(modelMatrix, modelTranslation);
  modelMatrix = multiply(modelMatrix, rotateX);
  modelMatrix = multiply(modelMatrix, rotateY);
  modelMatrix = multiply(modelMatrix, rotateZ);
  modelMatrix = multiply(modelMatrix, modelScale);

  context.modelViewMatrix = multiply(viewMatrix, modelMatrix);
  context.normalMatrix = identity(4);

  // calculate normal matrix
  const normMat = inverse(context.modelViewMatrix);
  if (normMat.ok) context.normalMatrix = normMat.value;

  // set matrices in shader
  context.shader.setProjectionMatrix(flattenMat(context.projectionMatrix));
  context.shader.setModelViewMatrix(flattenMat(context.modelViewMatrix));
  context.shader.setNormalMatrix(flattenMat(context.normalMatrix));
  
}

function handleHTMLInput(context: Context): void {
  const subdivisionsSlider = document.getElementById(
    "subdivisions"
  ) as HTMLInputElement;
  subdivisionsSlider.oninput = function (event) {
    const subdivisions = parseInt(subdivisionsSlider.value);
    setPlaneSubdivision(context, subdivisions);
    refreshPlane(context.gl, context);
    console.debug("Subdivisions changed to:", subdivisions);
  };

  const tilingSlider = document.getElementById("tiling") as HTMLInputElement;
  tilingSlider.oninput = function (event) {
    const tiling = parseInt(tilingSlider.value);
  };
}

function drawScene(
  gl: WebGLRenderingContext,
  context: Context,
  loop: boolean,
  time: number
): void {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  rotatePlane(context, vec3(0, 0, 0.1));
  setupMatrices(context);


  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, context.buffers.index);
  gl.drawElements(
    context.wireframe ? gl.LINES : gl.TRIANGLES,
    context.plane.mesh_data.indices.length,
    gl.UNSIGNED_SHORT,
    0
  );

  if (loop) requestAnimationFrame((time) => drawScene(gl, context, loop, time));
}

