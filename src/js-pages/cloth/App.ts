// import { globalState } from './utils/globalState';
// import { constants } from './utils/constants';
// import { Scene } from './Scene';
// import { MouseMove } from './utils/MouseMove';

// export class App {
//   private rafId: number | null = null;
//   private isResumed = true;
//   private lastFrameTime: number | null = null;
//   private scene: Scene | null = null;

//   private resizeBackupTimeout: NodeJS.Timeout; // Used for backup resize event, when the initial resize event is not triggered

//   constructor() {
//     this.onResize();
//     this.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//     this.addListeners();
//     this.resumeAppFrame();
//     this.scene = new Scene();
//     this.onResize();

//     const measuredStageX = globalState.stageSize.value[0];
//     const measuredStageY = globalState.stageSize.value[1];
//     this.resizeBackupTimeout = setTimeout(() => {
//       const stageX = globalState.canvasEl?.clientWidth;
//       const stageY = globalState.canvasEl?.clientHeight;
//       if (stageX !== measuredStageX || stageY !== measuredStageY) {
//         this.onResize();
//       }
//       clearTimeout(this.resizeBackupTimeout);
//     }, 300);
//   }

//   private onResize = () => {
//     if (!globalState.canvasEl) {
//       return;
//     }

//     const bounds = globalState.canvasEl.getBoundingClientRect();
//     const stageX = bounds.width;
//     const stageY = bounds.height;
//     globalState.stageSize.value = [stageX, stageY];
//     this.scene?.onResize();
//   };

//   private setPixelRatio(pixelRatio: number) {
//     globalState.pixelRatio.value = pixelRatio;
//   }

//   private onVisibilityChange = () => {
//     if (document.hidden) {
//       this.stopAppFrame();
//     } else {
//       this.resumeAppFrame();
//     }
//   };

//   private addListeners() {
//     window.addEventListener('resize', this.onResize);
//     window.addEventListener('visibilitychange', this.onVisibilityChange);
//   }

//   private resumeAppFrame() {
//     this.isResumed = true;
//     if (!this.rafId) {
//       this.rafId = window.requestAnimationFrame(this.renderOnFrame);
//     }
//   }

//   private renderOnFrame = (time: number) => {
//     this.rafId = window.requestAnimationFrame(this.renderOnFrame);

//     if (this.isResumed || !this.lastFrameTime) {
//       this.lastFrameTime = window.performance.now();
//       this.isResumed = false;
//       return;
//     }

//     const delta = time - this.lastFrameTime;

//     let physics_dt = delta / 1000;
//     //It caps the physics to min 30fps, if its lower, the whole simulation will slow down -> its more to prevent the simulation from exploding
//     if (physics_dt > 0.016 * 2) {
//       physics_dt = 0.016;
//     }

//     const dt = delta / constants.DT_FPS;

//     globalState.dt.value = dt;
//     globalState.physics_dt.value = physics_dt;
//     globalState.uTime.value = time * 0.001;

//     this.lastFrameTime = time;

//     this.scene?.update();
//   };

//   private stopAppFrame() {
//     if (this.rafId) {
//       window.cancelAnimationFrame(this.rafId);
//       this.rafId = null;
//     }
//   }

//   public destroy() {
//     this.stopAppFrame();
//     window.removeEventListener('resize', this.onResize);
//     window.removeEventListener('visibilitychange', this.onVisibilityChange);
//     this.scene?.destroy();
//     if (this.resizeBackupTimeout) {
//       clearTimeout(this.resizeBackupTimeout);
//     }
//   }
// }

// // Don't allow to zoom
// document.addEventListener(
//   'touchstart',
//   (event) => {
//     if (event.touches.length > 1) {
//       event.preventDefault();
//     }
//   },
//   { passive: false },
// );

// // https://webglfundamentals.org/webgl/lessons/webgl-qna-recording-fps-in-webgl.html
// const fpsElem = document.querySelector('#fps');
// let then = 0;
// function render(now: number) {
//   now *= 0.001; // convert to seconds
//   const deltaTime = now - then; // compute time since last frame
//   then = now; // remember time for next frame
//   const fps = 1 / deltaTime; // compute frames per second
//   if (fpsElem) fpsElem.textContent = fps.toFixed(1); // update fps display
//   requestAnimationFrame(render);
// }
// requestAnimationFrame(render);

// const onMouseMove = (e: any) => {
//   const mouseX = (e.target as MouseMove).mouse.x;
//   const mouseY = (e.target as MouseMove).mouse.y;

//   const stageX = globalState.stageSize.value[0];
//   const stageY = globalState.stageSize.value[1];

//   globalState.mouse2DTarget.value = [(mouseX / stageX) * 2 - 1, -(mouseY / stageY) * 2 + 1];
// };

// globalState.debugHolderEl = document.querySelector('.debug-holder') as HTMLDivElement;
// globalState.canvasEl = document.getElementById('canvas') as HTMLCanvasElement;

// const mouseMove = MouseMove.getInstance();
// mouseMove.addEventListener('mousemove', onMouseMove);

// //Check if there is "deubg" in the url, if so, make the debug visible
// if (window.location.href.indexOf('debug') > -1) {
//   globalState.debugHolderEl.style.display = 'block';
// }

// new App();

import GUI from 'lil-gui';

import { globalState } from './utils/globalState';
import { MouseMove } from './utils/MouseMove';
import { Scene } from './Scene';
import { eventBus } from './utils/EventDispatcher';
import { lerp } from './utils/lerp';
import { debounce } from './utils/debounce';
import { GlobalResize } from './utils/GlobalResize';
import { GlobalFrame } from './utils/GlobalFrame';

export class App {
  private globalFrame = GlobalFrame.getInstance();
  private mouseMove = MouseMove.getInstance();
  private globalResize = GlobalResize.getInstance();

  constructor() {
    globalState.gui = new GUI();

    globalState.gui.hide();

    new Scene(); // Init Main class

    this.addListeners();
    this.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.onResize();
  }

  private onResize = () => {
    // const canvas = document.getElementById('webgl-bg-measure') as HTMLCanvasElement | null;
    // if (!canvas) throw new Error('No canvas element with id="webgl-bg-measure" found');
    // const bounding = canvas.getBoundingClientRect();
    // const stageX = bounding.width;
    // const stageY = bounding.height;
    // // const stageX = window.innerWidth;
    // // const stageY = window.innerHeight;
    // globalState.stageSize.value = [stageX, stageY];
    eventBus.dispatchEvent({ type: 'resize' });
  };

  private onResizeDebounced = debounce(() => {
    this.onResize();
  }, 400);

  private setPixelRatio(pixelRatio: number) {
    globalState.pixelRatio.value = pixelRatio;
    eventBus.dispatchEvent({ type: 'pixelratiochange' });
  }

  private addListeners() {
    this.globalFrame.addEventListener('update', this.renderOnFrame);
    this.mouseMove.addEventListener('mousemove', this.onMouseMove);
    this.globalResize.addEventListener('resize', this.onResizeDebounced);
  }

  private onMouseMove = (e: any) => {
    const mouseX = (e.target as MouseMove).mouse.x;
    const mouseY = (e.target as MouseMove).mouse.y;

    const stageX = GlobalResize.windowSize.value[0];
    const stageY = GlobalResize.windowSize.value[1];

    globalState.mouse2DTarget.value = [(mouseX / stageX) * 2 - 1, -(mouseY / stageY) * 2 + 1];
  };

  private renderOnFrame = (time: number) => {
    // Lerp mouse position
    const lerpSpeed = 0.3;
    const mouse2DTarget = globalState.mouse2DTarget.value;
    const mouse2DCurrent = globalState.mouse2DCurrent.value;
    mouse2DCurrent[0] = lerp(mouse2DCurrent[0], mouse2DTarget[0], lerpSpeed * GlobalFrame.dt.value);
    mouse2DCurrent[1] = lerp(mouse2DCurrent[1], mouse2DTarget[1], lerpSpeed * GlobalFrame.dt.value);

    eventBus.dispatchEvent({ type: 'update' });
  };

  public destroy() {
    this.globalResize.removeEventListener('resize', this.onResizeDebounced);
    this.globalFrame.addEventListener('update', this.renderOnFrame);
    this.mouseMove.removeEventListener('mousemove', this.onMouseMove);
    globalState.gui?.destroy();
    eventBus.dispatchEvent({ type: 'destroy' });
  }
}

globalState.canvasEl = document.getElementById('canvas') as HTMLCanvasElement;
new App();
