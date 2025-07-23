import { globalState } from './utils/globalState';
import { Camera } from './lib/Camera';
import { TexturesManager } from './lib/textures-manager/TexturesManager';
import { GeometriesManager } from './lib/GeometriesManager';
import { eventBus } from './utils/EventDispatcher';

import { Background } from './Components/Background';
import { Vec3 } from './lib/math/Vec3';
import { Cloth } from './Components/Cloth';
import { GlobalResize } from './utils/GlobalResize';
import { UpdateEventProps } from './utils/GlobalFrame';

import { cubeObject, planeObject } from './utils/geometries';

export class Scene {
  private gl: WebGL2RenderingContext;
  private camera = new Camera();

  private texturesManager;
  private geometriesManager;

  private background: Background | null = null;
  private cloth: Cloth | null = null;

  private pushForce = new Vec3();

  constructor() {
    if (!globalState.canvasEl) {
      throw new Error('Canvas element not found');
    }
    const ctx = globalState.canvasEl.getContext('webgl2');
    if (!ctx) {
      throw new Error('WebGL2 not supported');
    }
    this.gl = ctx;

    this.addListeners();

    this.texturesManager = new TexturesManager({ gl: this.gl });
    this.geometriesManager = new GeometriesManager();

    this.init();
  }

  private async init() {
    this.geometriesManager.addGeometry({
      geometryUrl: 'plane',
      geometryObject: planeObject,
    });

    this.geometriesManager.addGeometry({
      geometryUrl: 'cube',
      geometryObject: cubeObject,
    });

    // const width = 60 - 1;
    // const height = 30;
    // const spacing = 16;

    const factor = 0.7;
    const width = Math.round((60 - 1) * factor);
    const height = Math.round(25 * factor);
    const spacing = Math.round(16 / factor);

    // const width = 2;
    // const height = 2;
    // const spacing = 100;

    this.cloth = new Cloth({
      camera: this.camera,
      geometriesManager: this.geometriesManager,
      gl: this.gl,
      width,
      height,
      startX: -(width * spacing) / 2 + spacing / 2,
      startY: -(height * spacing) / 2 + spacing / 2,
      spacing,
    });

    this.background = new Background({
      camera: this.camera,
      geometriesManager: this.geometriesManager,
      gl: this.gl,
    });

    await this.geometriesManager.addGeometriesToLoad([
      '/public/assets/models/f22/f22.obj',
      '/public/assets/models/efa/efa.obj',
      '/public/assets/models/crab/crab.obj',
    ]);
  }

  public update = (event: any) => {
    // Update camera
    // this.camera.updateViewMatrix({
    //   target: new Vec3(globalState.mouse2DCurrent.value[0] * 200, globalState.mouse2DCurrent.value[1] * 200, -1),
    // });

    this.cloth?.points.forEach((p) => p.addForce(this.pushForce));

    this.render(event.e);
  };

  private render(e: UpdateEventProps) {
    const gl = this.gl;

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    gl.depthMask(true);

    // Clear the canvas AND the depth buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Render opaque objects first
    this.background?.update();
    this.background?.render();

    // Render transparent objects below
    gl.depthMask(false);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this.cloth?.update(e);
    this.cloth?.render(e);
  }

  // Partially based on: https://webglfundamentals.org/webgl/lessons/webgl-resizing-the-canvas.html
  public onResize = () => {
    let w = GlobalResize.windowSize.value[0];
    let h = GlobalResize.windowSize.value[1];

    const ratio = globalState.pixelRatio.value;

    w = Math.round(w * ratio);
    h = Math.round(h * ratio);

    this.gl.viewport(0, 0, w, h);

    // this.gl.canvas is the same sa globalState.canvasEl
    this.gl.canvas.width = w;
    this.gl.canvas.height = h;

    // 1 screen pixel = 1 CSS pixel
    const windowHeight = GlobalResize.windowSize.value[1];
    const cameraPositionZ = this.camera.position[2];
    const fov = 2 * Math.atan(windowHeight / 2 / cameraPositionZ);

    this.camera.updateProjectionMatrix({
      fov: fov,
      aspect_ratio: w / h,
      near: 0.1,
      far: 2000,
    });

    this.texturesManager.resize();

    this.background?.onResize();
    this.cloth?.onResize();
  };

  private onKeyDownWSAD = (e: KeyboardEvent) => {
    const strength = 0.8;
    switch (e.key) {
      case 'w':
      case 'ArrowUp':
        this.pushForce[2] = -strength;
        break;
      case 's':
      case 'ArrowDown':
        this.pushForce[2] = strength;
        break;
      case 'a':
      case 'ArrowLeft':
        this.pushForce[0] = -strength;
        break;
      case 'd':
      case 'ArrowRight':
        this.pushForce[0] = strength;
        break;
      default:
        break;
    }
  };

  private onKeyUpWSAD = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'w':
      case 's':
      case 'ArrowUp':
      case 'ArrowDown':
        this.pushForce[2] = 0;
        break;
      case 'a':
      case 'd':
      case 'ArrowLeft':
      case 'ArrowRight':
        this.pushForce[0] = 0;
        break;
      default:
        break;
    }
  };

  private addListeners() {
    window.addEventListener('keydown', this.onKeyDownWSAD);
    window.addEventListener('keyup', this.onKeyUpWSAD);

    eventBus.addEventListener('resize', this.onResize);
    eventBus.addEventListener('update', this.update);
  }

  private removeListeners() {
    window.removeEventListener('keydown', this.onKeyDownWSAD);
    window.removeEventListener('keyup', this.onKeyUpWSAD);

    eventBus.removeEventListener('resize', this.onResize);
    eventBus.removeEventListener('update', this.update);
  }

  public destroy() {
    this.geometriesManager?.destroy();
    this.texturesManager?.destroy();

    this.removeListeners();

    this.cloth?.destroy();
    this.background?.destroy();
  }
}
