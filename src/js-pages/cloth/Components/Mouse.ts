import { Vec2 } from '../lib/math/Vec2';
import { GlobalResize } from '../utils/GlobalResize';
import { MouseMove } from '../utils/MouseMove';
import { EventDispatcher } from '../utils/EventDispatcher';

export class Mouse extends EventDispatcher {
  private mouseMove = MouseMove.getInstance();
  private pos = new Vec2();
  private prevPos = new Vec2();

  constructor() {
    super();
    this.mouseMove.addEventListener('mousemove', this.onMouseMove);
  }

  private onMouseMove = (e: any) => {
    const mouseX = (e.target as MouseMove).mouse.x;
    const mouseY = (e.target as MouseMove).mouse.y;

    const stageX = GlobalResize.windowSize.value[0];
    const stageY = GlobalResize.windowSize.value[1];

    this.updatePosition(mouseX - stageX / 2, -mouseY + stageY / 2);
  };

  private updatePosition(x: number, y: number): void {
    this.prevPos.copy(this.pos);
    this.pos.setTo(x, y);
  }

  public getRightButtonDown(): boolean {
    return this.mouseMove.rightButtonDown;
  }

  public getLeftButtonDown(): boolean {
    return this.mouseMove.leftButtonDown;
  }

  public getPosition() {
    return this.pos;
  }

  public destroy() {
    this.mouseMove.removeEventListener('mousemove', this.onMouseMove);
  }
}
