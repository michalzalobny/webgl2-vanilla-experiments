import { globalState } from './utils/globalState';
import { Camera } from './lib/Camera';
import { lerp } from './utils/lerp';
import { TexturesManager } from './lib/textures-manager/TexturesManager';
import { GeometriesManager } from './lib/GeometriesManager';

import { Particle } from './Components/Particle';
import { Background } from './Components/Background';
import { Liquid } from './Components/Liquid';
import { Vec3 } from './lib/math/Vec3';
import { Force } from './physics/Force';

export class Scene {
  private gl: WebGL2RenderingContext;
  private camera = new Camera();

  private texturesManager;
  private geometriesManager;

  private particles: Particle[] = [];
  private particlesCreationTimeouts: NodeJS.Timeout[] = [];
  private background: Background | null = null;
  private liquid: Liquid | null = null;

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
    // Plane made out of two triangles
    const planeVertices = [-0.5, 0.5, 0, -0.5, -0.5, 0, 0.5, -0.5, 0, -0.5, 0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0];
    const planeTexcoords = [0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1];

    this.geometriesManager.addGeometry({
      geometryUrl: 'plane',
      geometryObject: { vertices: planeVertices, texcoords: planeTexcoords, normals: [] },
    });

    for (let i = 0; i < 30; i++) {
      const timeout = setTimeout(() => {
        const mass = 1 + Math.random() * 1.8;
        const particle = new Particle({
          x: 0,
          y: 0,
          mass: mass,
          radius: mass * 6,
          geometriesManager: this.geometriesManager,
          gl: this.gl,
          camera: this.camera,
        });

        this.particles.push(particle);
      }, i * 30);

      this.particlesCreationTimeouts.push(timeout);
    }

    this.background = new Background({
      camera: this.camera,
      geometriesManager: this.geometriesManager,
      gl: this.gl,
    });

    this.liquid = new Liquid({
      camera: this.camera,
      geometriesManager: this.geometriesManager,
      gl: this.gl,
    });
  }

  public update() {
    // Lerp mouse position
    const mouse2DTarget = globalState.mouse2DTarget.value;
    const mouse2DCurrent = globalState.mouse2DCurrent.value;
    mouse2DCurrent[0] = lerp(mouse2DCurrent[0], mouse2DTarget[0], 0.35 * globalState.dt.value);
    mouse2DCurrent[1] = lerp(mouse2DCurrent[1], mouse2DTarget[1], 0.35 * globalState.dt.value);

    this.render();
  }

  private render() {
    const gl = this.gl;

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    gl.depthMask(true);

    // Clear the canvas AND the depth buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Render opaque objects first
    this.background?.update();

    // Render transparent objects below
    gl.depthMask(false);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this.particles.forEach((particle) => {
      // Add drag force depedning if its inside the liquid or not
      if (!this.liquid || !this.liquid.mesh) return;
      if (particle.mesh.position[1] * 2 < this.liquid?.mesh?.position[1]) {
        const drag = Force.GenerateDragForce(particle, 0.05);
        particle.addForce(drag);
      }
      particle.addForce(this.pushForce);
      particle.update();
    });

    this.liquid?.update();
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

    this.background?.onResize();
    this.liquid?.onResize();
    this.particles.forEach((particle) => {
      particle.onResize();
    });
  }

  private onKeyDownWSAD = (e: KeyboardEvent) => {
    const strength = 4000;
    switch (e.key) {
      case 'w':
      case 'ArrowUp':
        this.pushForce[1] = strength;
        break;
      case 's':
      case 'ArrowDown':
        this.pushForce[1] = -strength;
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
        this.pushForce[1] = 0;
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

  private onPointerDown = (e: PointerEvent) => {
    const mass = 1 + Math.random() * 1.8;
    //Create a new particle on click
    const particle = new Particle({
      x: e.clientX - globalState.stageSize.value[0] / 2,
      y: -e.clientY + globalState.stageSize.value[1] / 2,
      mass: mass,
      radius: mass * 6,
      geometriesManager: this.geometriesManager,
      gl: this.gl,
      camera: this.camera,
    });

    this.particles.push(particle);
  };

  private addListeners() {
    window.addEventListener('keydown', this.onKeyDownWSAD);
    window.addEventListener('keyup', this.onKeyUpWSAD);
    window.addEventListener('pointerdown', this.onPointerDown);
  }

  private removeListeners() {
    window.removeEventListener('keydown', this.onKeyDownWSAD);
    window.removeEventListener('keyup', this.onKeyUpWSAD);
    window.removeEventListener('pointerdown', this.onPointerDown);
  }

  public destroy() {
    this.geometriesManager?.destroy();
    this.texturesManager?.destroy();

    this.removeListeners();

    this.particlesCreationTimeouts.forEach((timeout) => {
      clearTimeout(timeout);
    });

    this.particles.forEach((particle) => {
      particle.destroy();
    });
    this.background?.destroy();
    this.liquid?.destroy();
  }
}
