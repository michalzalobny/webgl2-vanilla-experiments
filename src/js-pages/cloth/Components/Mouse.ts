import { Vec2 } from '../lib/math/Vec2';
import { GlobalResize } from '../utils/GlobalResize';

import { MouseMove } from '../utils/MouseMove';

export class Mouse {
  private mouseMove = MouseMove.getInstance();
  private pos = new Vec2();
  private prevPos = new Vec2();

  private cursorSize: number = 40;
  private readonly maxCursorSize: number = 100;
  private readonly minCursorSize: number = 20;

  private leftButtonDown: boolean = false;
  private rightButtonDown: boolean = false;

  constructor() {
    this.mouseMove.addEventListener('mousemove', this.onMouseMove);

    window.addEventListener('mousedown', (e: MouseEvent) => {
      if (e.button === 0) this.setLeftMouseButton(true); // Left click
      if (e.button === 2) this.setRightMouseButton(true); // Right click
    });

    window.addEventListener('mouseup', (e: MouseEvent) => {
      if (e.button === 0) this.setLeftMouseButton(false);
      if (e.button === 2) this.setRightMouseButton(false);
    });

    // Optional: disable context menu on right-click if using canvas
    window.addEventListener('contextmenu', (e: MouseEvent) => {
      e.preventDefault();
    });

    // Optional: scroll wheel to zoom cursor size
    window.addEventListener('wheel', (e: WheelEvent) => {
      const increment = e.deltaY < 0 ? 5 : -5;
      this.increaseCursorSize(increment);
    });
  }

  public destroy() {
    this.mouseMove.removeEventListener('mousemove', this.onMouseMove);
  }

  private onMouseMove = (e: any) => {
    const mouseX = (e.target as MouseMove).mouse.x;
    const mouseY = (e.target as MouseMove).mouse.y;

    const stageX = GlobalResize.windowSize.value[0];
    const stageY = GlobalResize.windowSize.value[1];

    this.updatePosition(mouseX - stageX / 2, -mouseY + stageY / 2);
  };

  public updatePosition(x: number, y: number): void {
    this.prevPos.copy(this.pos);
    this.pos.setTo(x, y);
  }

  public getPosition() {
    return this.pos;
  }

  public getPreviousPosition() {
    return this.prevPos;
  }

  public getLeftButtonDown(): boolean {
    return this.leftButtonDown;
  }

  public setLeftMouseButton(state: boolean): void {
    this.leftButtonDown = state;
  }

  public getRightMouseButton(): boolean {
    return this.rightButtonDown;
  }

  public setRightMouseButton(state: boolean): void {
    this.rightButtonDown = state;
  }

  public increaseCursorSize(increment: number): void {
    this.cursorSize = Math.min(this.maxCursorSize, Math.max(this.minCursorSize, this.cursorSize + increment));
  }

  public getCursorSize(): number {
    return this.cursorSize;
  }
}
