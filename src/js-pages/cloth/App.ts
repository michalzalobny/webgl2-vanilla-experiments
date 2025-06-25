import GUI from 'lil-gui';

import { globalState } from './utils/globalState';
import { MouseMove } from './utils/MouseMove';
import { Scene } from './Scene';
import { eventBus } from './utils/EventDispatcher';
import { lerp } from './utils/lerp';
import { GlobalResize } from './utils/GlobalResize';
import { GlobalFrame, UpdateEventProps } from './utils/GlobalFrame';

export class App {
  private globalFrame = GlobalFrame.getInstance();
  private mouseMove = MouseMove.getInstance();
  private globalResize = GlobalResize.getInstance();

  constructor() {
    globalState.gui = new GUI();

    globalState.gui.hide();

    new Scene();

    this.addListeners();
    this.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.onResize();
  }

  private onResize = () => {
    eventBus.dispatchEvent({ type: 'resize' });
  };

  private setPixelRatio(pixelRatio: number) {
    globalState.pixelRatio.value = pixelRatio;
    eventBus.dispatchEvent({ type: 'pixelratiochange' });
  }

  private addListeners() {
    this.globalFrame.addEventListener('update', this.renderOnFrame);
    this.mouseMove.addEventListener('mousemove', this.onMouseMove);
    this.globalResize.addEventListener('resize', this.onResize);
  }

  private onMouseMove = (e: any) => {
    const mouseX = (e.target as MouseMove).mouse.x;
    const mouseY = (e.target as MouseMove).mouse.y;

    const stageX = GlobalResize.windowSize.value[0];
    const stageY = GlobalResize.windowSize.value[1];

    globalState.mouse2DTarget.value = [(mouseX / stageX) * 2 - 1, -(mouseY / stageY) * 2 + 1];
  };

  private renderOnFrame = (e: UpdateEventProps) => {
    // Lerp mouse position
    const lerpSpeed = 0.3;
    const mouse2DTarget = globalState.mouse2DTarget.value;
    const mouse2DCurrent = globalState.mouse2DCurrent.value;
    mouse2DCurrent[0] = lerp(mouse2DCurrent[0], mouse2DTarget[0], lerpSpeed * GlobalFrame.dt.value);
    mouse2DCurrent[1] = lerp(mouse2DCurrent[1], mouse2DTarget[1], lerpSpeed * GlobalFrame.dt.value);

    eventBus.dispatchEvent({ type: 'update', e });
  };

  public destroy() {
    this.globalResize.removeEventListener('resize', this.onResize);
    this.globalFrame.addEventListener('update', this.renderOnFrame);
    this.mouseMove.removeEventListener('mousemove', this.onMouseMove);
    globalState.gui?.destroy();
    eventBus.dispatchEvent({ type: 'destroy' });
  }
}

// https://webglfundamentals.org/webgl/lessons/webgl-qna-recording-fps-in-webgl.html
const fpsElem = document.querySelector('#fps');
const frame = GlobalFrame.getInstance();
let then = 0;
function render(props: UpdateEventProps) {
  let now = props.uTime;
  now *= 0.001; // convert to seconds
  const deltaTime = now - then; // compute time since last frame
  then = now; // remember time for next frame
  const fps = 1 / deltaTime; // compute frames per second
  if (fpsElem) fpsElem.textContent = fps.toFixed(1); // update fps display
}
frame.addEventListener('update', render);

//Check if there is "deubg" in the url, if so, make the debug visible
globalState.debugHolderEl = document.querySelector('.debug-holder') as HTMLDivElement;
if (window.location.href.indexOf('debug') > -1) {
  globalState.debugHolderEl.style.display = 'block';
}

// Don't allow to zoom
document.addEventListener(
  'touchstart',
  (event) => {
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  },
  { passive: false },
);

globalState.canvasEl = document.getElementById('canvas') as HTMLCanvasElement;

new App();
