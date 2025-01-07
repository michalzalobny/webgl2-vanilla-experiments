import { globalState } from './utils/globalState';
import { constants } from './utils/constants';
import { debounce } from './utils/debounce';
import { Scene } from './Scene';
import { MouseMove } from './utils/MouseMove';

export class App {
  private rafId: number | null = null;
  private isResumed = true;
  private lastFrameTime: number | null = null;
  private scene: Scene;

  constructor() {
    this.scene = new Scene();
    this.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.addListeners();
    this.resumeAppFrame();
    this.onResize();
  }

  private onResize = () => {
    if (!globalState.canvasEl) {
      return;
    }

    const bounds = globalState.canvasEl.getBoundingClientRect();
    const stageX = bounds.width;
    const stageY = bounds.height;
    globalState.stageSize.value = [stageX, stageY];
    this.scene.onResize();
  };

  private setPixelRatio(pixelRatio: number) {
    globalState.pixelRatio.value = pixelRatio;
  }

  private onVisibilityChange = () => {
    if (document.hidden) {
      this.stopAppFrame();
    } else {
      this.resumeAppFrame();
    }
  };

  private addListeners() {
    window.addEventListener('resize', this.onResize);
    window.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  private resumeAppFrame() {
    this.isResumed = true;
    if (!this.rafId) {
      this.rafId = window.requestAnimationFrame(this.renderOnFrame);
    }
  }

  private renderOnFrame = (time: number) => {
    this.rafId = window.requestAnimationFrame(this.renderOnFrame);

    if (this.isResumed || !this.lastFrameTime) {
      this.lastFrameTime = window.performance.now();
      this.isResumed = false;
      return;
    }

    const delta = time - this.lastFrameTime;
    const slowDownFactor = delta / constants.DT_FPS;
    globalState.slowDownFactor.value = slowDownFactor;
    globalState.uTime.value = time * 0.001;

    this.lastFrameTime = time;

    this.scene.update();
  };

  private stopAppFrame() {
    if (this.rafId) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  public destroy() {
    this.stopAppFrame();
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.scene.destroy();
  }
}

// Don't allow to zoom
document.addEventListener(
  'touchstart',
  (event) => {
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  },
  { passive: false }
);

// https://webglfundamentals.org/webgl/lessons/webgl-qna-recording-fps-in-webgl.html
const fpsElem = document.querySelector('#fps');
let then = 0;
function render(now: number) {
  now *= 0.001; // convert to seconds
  const deltaTime = now - then; // compute time since last frame
  then = now; // remember time for next frame
  const fps = 1 / deltaTime; // compute frames per second
  if (fpsElem) fpsElem.textContent = fps.toFixed(1); // update fps display
  requestAnimationFrame(render);
}
requestAnimationFrame(render);

const onMouseMove = (e: any) => {
  const mouseX = (e.target as MouseMove).mouse.x;
  const mouseY = (e.target as MouseMove).mouse.y;

  const stageX = globalState.stageSize.value[0];
  const stageY = globalState.stageSize.value[1];

  globalState.mouse2DTarget.value = [(mouseX / stageX) * 2 - 1, -(mouseY / stageY) * 2 + 1];
};

globalState.debugHolderEl = document.querySelector('.debug-holder') as HTMLDivElement;
globalState.canvasEl = document.getElementById('canvas') as HTMLCanvasElement;
globalState.appLoadTime = window.performance.now();

const mouseMove = MouseMove.getInstance();
mouseMove.addEventListener('mousemove', onMouseMove);

new App();
