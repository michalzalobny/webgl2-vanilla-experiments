import { globalState } from './utils/globalState';
import { Camera } from './lib/Camera';
import { lerp } from './utils/lerp';
import { TexturesManager } from './lib/textures-manager/TexturesManager';
import { GeometriesManager } from './lib/GeometriesManager';

import { Particle } from './Components/Particle';
import { Background } from './Components/Background';
import { Vec3 } from './lib/math/Vec3';
import { Force } from './physics/Force';
import { Line } from './Components/Line';

const PARTICLES_COUNT = 10;

export class Scene {
  private gl: WebGL2RenderingContext;
  private camera = new Camera();

  private texturesManager;
  private geometriesManager;

  private restLength = 15;
  private k = 200;
  private anchorPos = new Vec3(0);
  private anchor: Particle | null = null;
  private bobs: Particle[] = [];
  private lines: Line[] = [];
  private forceLine: Line | null = null;

  private background: Background | null = null;

  private pushForce = new Vec3();

  private isPointerDown = { value: false };

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

    this.anchorPos.setTo(0, globalState.stageSize.value[1] / 2, 0);

    //Create bobs
    for (let i = 0; i < PARTICLES_COUNT; i++) {
      const bob = new Particle({
        x: this.anchorPos.x,
        y: this.anchorPos.y - (i + 1) * this.restLength,
        mass: 2,
        radius: 6,
        geometriesManager: this.geometriesManager,
        gl: this.gl,
        camera: this.camera,
      });
      this.bobs.push(bob);
    }

    this.anchor = new Particle({
      x: this.anchorPos.x,
      y: this.anchorPos.y,
      mass: 2,
      radius: 6,
      geometriesManager: this.geometriesManager,
      gl: this.gl,
      camera: this.camera,
    });

    for (let i = 0; i < this.bobs.length; i++) {
      const line = new Line({
        gl: this.gl,
        camera: this.camera,
        geometriesManager: this.geometriesManager,
        color: new Vec3(0.65, 0.65, 0.65),
      });
      this.lines.push(line);
    }

    this.forceLine = new Line({
      gl: this.gl,
      camera: this.camera,
      geometriesManager: this.geometriesManager,
      color: new Vec3(0.1, 0.9, 0.1),
    });

    this.background = new Background({
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
    this.background?.render();

    // Render transparent objects below
    gl.depthMask(false);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    if (!this.anchor || !this.forceLine) return;

    this.bobs.forEach((bob, i) => {
      // Add push force
      bob.addForce(this.pushForce);

      // Add drag force
      const dragForce = Force.GenerateDragForce(bob, 0.002);
      bob.addForce(dragForce);

      // Add weight force
      const weight = new Vec3(0, bob.mass * -9.8 * 50, 0);
      bob.addForce(weight);

      // Add spring force
      const isPrevParticleAnchor = i === 0;
      const prevParticle = this.bobs[i - 1] || this.anchor;
      const springForce = Force.GenerateSpringForceTwoParticles(bob, prevParticle, this.restLength, this.k);

      bob.addForce(springForce);
      if (!isPrevParticleAnchor) {
        prevParticle.addForce(springForce.multiply(-1));
      }

      bob.update();
    });

    this.anchor.update();
    this.lines.forEach((line, i) => {
      const bob = this.bobs[i - 1] || this.anchor;
      const nextBob = this.bobs[i];
      line.update(bob.mesh.position, nextBob.mesh.position);
    });

    const endPoint = new Vec3(
      (globalState.mouse2DTarget.value[0] * globalState.stageSize.value[0]) / 2,
      (globalState.mouse2DTarget.value[1] * globalState.stageSize.value[1]) / 2,
      0,
    );
    const bob = this.bobs[this.bobs.length - 1];
    this.forceLine.update(bob.mesh.position, endPoint);

    this.lines.forEach((line) => {
      line.render();
    });

    if (this.isPointerDown.value) {
      this.forceLine.render();
    }

    this.bobs.forEach((bob) => {
      bob.render();
    });
    this.anchor.render();
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
    this.bobs.forEach((bob) => {
      bob.onResize();
    });
    this.anchor?.onResize();
    this.lines.forEach((line) => {
      line.onResize();
    });
  }

  private onKeyDownWSAD = (e: KeyboardEvent) => {
    const strength = 2500;
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
    this.isPointerDown.value = true;
  };

  private onPointerUp = (e: PointerEvent) => {
    this.isPointerDown.value = false;

    const impulseForce = new Vec3(
      (globalState.mouse2DTarget.value[0] * globalState.stageSize.value[0]) / 2,
      (globalState.mouse2DTarget.value[1] * globalState.stageSize.value[1]) / 2,
      0,
    );

    const bob = this.bobs[this.bobs.length - 1];
    //Calculate the direction of the force
    impulseForce.sub(bob.mesh.position).multiply(-5);

    bob.velocity.setTo(impulseForce);
  };

  private addListeners() {
    window.addEventListener('keydown', this.onKeyDownWSAD);
    window.addEventListener('keyup', this.onKeyUpWSAD);
    window.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointerup', this.onPointerUp);
  }

  private removeListeners() {
    window.removeEventListener('keydown', this.onKeyDownWSAD);
    window.removeEventListener('keyup', this.onKeyUpWSAD);
    window.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointerup', this.onPointerUp);
  }

  public destroy() {
    this.geometriesManager?.destroy();
    this.texturesManager?.destroy();

    this.removeListeners();

    this.bobs.forEach((bob) => {
      bob.destroy();
    });
    this.anchor?.destroy();
    this.lines.forEach((line) => {
      line.destroy();
    });
    this.forceLine?.destroy();

    this.background?.destroy();
  }
}
