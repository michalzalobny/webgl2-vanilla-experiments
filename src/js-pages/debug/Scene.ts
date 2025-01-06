import { globalState } from './utils/globalState';
import { Camera } from './lib/Camera';
import { lerp } from './utils/lerp';
import { TexturesManager } from './lib/textures-manager/TexturesManager';
import { GeometriesManager } from './lib/GeometriesManager';

import { Particle } from './Components/Particle';

export class Scene {
  private gl: WebGL2RenderingContext;
  private camera = new Camera();

  private texturesManager;
  private geometriesManager;

  private particle: Particle | null = null;

  constructor() {
    if (!globalState.canvasEl) {
      throw new Error('Canvas element not found');
    }
    const ctx = globalState.canvasEl.getContext('webgl2');
    if (!ctx) {
      throw new Error('WebGL2 not supported');
    }
    this.gl = ctx;
    this.texturesManager = new TexturesManager({ gl: this.gl });
    this.geometriesManager = new GeometriesManager();

    this.init();
  }

  private async init() {
    // Plane made out of two triangles
    const planeVertices = [-0.5, 0.5, 0, -0.5, -0.5, 0, 0.5, -0.5, 0, -0.5, 0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0];
    const planeTexcoords = [0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1];

    this.geometriesManager.addGeometry({
      geometryUrl: 'plane',
      geometryObject: { vertices: planeVertices, texcoords: planeTexcoords, normals: [] },
    });

    await this.texturesManager.loadTexture(`/public/assets/generated_images/1.jpg`);

    this.particle = new Particle({
      x: 0,
      y: 0,
      mass: 1,
      geometriesManager: this.geometriesManager,
      gl: this.gl,
      camera: this.camera,
    });

    globalState.appLoadTime = window.performance.now() - globalState.appLoadTime;
  }

  public update() {
    // Lerp mouse position
    const mouse2DTarget = globalState.mouse2DTarget.value;
    const mouse2DCurrent = globalState.mouse2DCurrent.value;
    mouse2DCurrent[0] = lerp(mouse2DCurrent[0], mouse2DTarget[0], 0.053 * globalState.slowDownFactor.value);
    mouse2DCurrent[1] = lerp(mouse2DCurrent[1], mouse2DTarget[1], 0.053 * globalState.slowDownFactor.value);

    this.render();
  }

  private render() {
    const gl = this.gl;

    // Clear the canvas and depth buffer from previous frame
    gl.enable(gl.DEPTH_TEST);

    this.particle?.update();
  }

  // Partially based on: https://webglfundamentals.org/webgl/lessons/webgl-resizing-the-canvas.html
  public onResize() {
    let w = globalState.stageSize.value[0];
    let h = globalState.stageSize.value[1];

    const ratio = globalState.pixelRatio.value;

    w = Math.round(w * ratio);
    h = Math.round(h * ratio);

    this.gl.viewport(0, 0, w, h);

    // this.gl.canvas is the same sa globalState.canvasEl
    this.gl.canvas.width = w;
    this.gl.canvas.height = h;

    // 1 screen pixel = 1 CSS pixel
    const windowHeight = globalState.stageSize.value[1];
    const cameraPositionZ = this.camera.position[2];
    const fov = 2 * Math.atan(windowHeight / 2 / cameraPositionZ);

    this.camera.updateProjectionMatrix({
      fov: fov,
      aspect_ratio: w / h,
      near: 0.1,
      far: 2000,
    });

    this.texturesManager.resize();
  }

  public destroy() {
    this.geometriesManager?.destroy();
    this.texturesManager?.destroy();

    this.particle?.destroy();
  }
}
