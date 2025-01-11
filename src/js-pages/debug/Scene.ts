import { Vec3 } from './lib/math/Vec3';

import { globalState } from './utils/globalState';
import { Camera } from './lib/Camera';
import { lerp } from './utils/lerp';
import { TexturesManager } from './lib/textures-manager/TexturesManager';
import { GeometriesManager } from './lib/GeometriesManager';

import { Objects3D } from './Components/Objects3D';

export class Scene {
  private gl: WebGL2RenderingContext;
  private camera = new Camera();

  private texturesManager;
  private geometriesManager;

  private objects3D: Objects3D | null = null;

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

    this.objects3D = new Objects3D({
      gl: this.gl,
      texturesManager: this.texturesManager,
      camera: this.camera,
      geometriesManager: this.geometriesManager,
    });
  }

  private render() {
    const gl = this.gl;

    // Clear the canvas and depth buffer from previous frame
    gl.enable(gl.DEPTH_TEST);

    this.objects3D?.update();
  }

  public update() {
    // Lerp mouse position
    const mouse2DTarget = globalState.mouse2DTarget.value;
    const mouse2DCurrent = globalState.mouse2DCurrent.value;
    mouse2DCurrent[0] = lerp(mouse2DCurrent[0], mouse2DTarget[0], 0.053 * globalState.dt.value);
    mouse2DCurrent[1] = lerp(mouse2DCurrent[1], mouse2DTarget[1], 0.053 * globalState.dt.value);

    // Update camera
    this.camera.updateViewMatrix({
      target: new Vec3(mouse2DCurrent[0] * -0.25, mouse2DCurrent[1] * 0.05, -1),
    });

    this.render();
  }

  // Partially based on: https://webglfundamentals.org/webgl/lessons/webgl-resizing-the-canvas.html
  public onResize() {
    let w = globalState.stageSize.value[0];
    let h = globalState.stageSize.value[1];

    const ratio = globalState.pixelRatio.value;

    // Possibly need to Math.round() w and h here, but will leave for now
    w = Math.round(w * ratio);
    h = Math.round(h * ratio);

    this.gl.viewport(0, 0, w, h);

    // this.gl.canvas is the same sa globalState.canvasEl
    this.gl.canvas.width = w;
    this.gl.canvas.height = h;

    this.camera.updateProjectionMatrix({
      fov: Math.PI / 3,
      aspect_ratio: w / h,
      near: 0.1,
      far: 20,
    });

    this.texturesManager.resize();
  }

  public destroy() {
    this.geometriesManager?.destroy();
    this.texturesManager?.destroy();

    this.objects3D?.destroy();
  }
}
