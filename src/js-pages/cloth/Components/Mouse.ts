import { Vec2 } from '../lib/math/Vec2';
import { GlobalResize } from '../utils/GlobalResize';
import { MouseMove } from '../utils/MouseMove';

export class Mouse {
  private mouseMove = MouseMove.getInstance();
  private pos = new Vec2();
  private prevPos = new Vec2();

  private cursorSize = 40;

  private leftButtonDown = false;
  private rightButtonDown = false;

  constructor() {
    // Mouse move (desktop)
    this.mouseMove.addEventListener('mousemove', this.onMouseMove);

    // Mouse down
    window.addEventListener('mousedown', (e: MouseEvent) => {
      if (e.button === 0) this.setLeftMouseButton(true); // Left click
      if (e.button === 2) this.setRightMouseButton(true); // Right click
    });

    // Mouse up
    window.addEventListener('mouseup', (e: MouseEvent) => {
      if (e.button === 0) this.setLeftMouseButton(false);
      if (e.button === 2) this.setRightMouseButton(false);
    });

    // Disable context menu
    window.addEventListener('contextmenu', (e: MouseEvent) => {
      e.preventDefault();
    });

    // ---- MOBILE TOUCH SUPPORT ----

    // Touch start
    window.addEventListener('touchstart', (e: TouchEvent) => {
      if (e.touches.length === 1) {
        this.setLeftMouseButton(true);
      } else if (e.touches.length === 2) {
        this.setRightMouseButton(true);
      }
    });

    // Touch end
    window.addEventListener('touchend', (e: TouchEvent) => {
      // All touches lifted: reset both
      if (e.touches.length === 0) {
        this.setLeftMouseButton(false);
        this.setRightMouseButton(false);
      } else if (e.touches.length === 1) {
        // If one finger remains, assume it's still left click
        this.setLeftMouseButton(true);
        this.setRightMouseButton(false);
      }
    });
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

  private getPreviousPosition() {
    return this.prevPos;
  }

  private setLeftMouseButton(state: boolean): void {
    this.leftButtonDown = state;
  }

  private setRightMouseButton(state: boolean): void {
    this.rightButtonDown = state;
  }

  public getRightMouseButton(): boolean {
    return this.rightButtonDown;
  }

  public getLeftButtonDown(): boolean {
    return this.leftButtonDown;
  }

  public getPosition() {
    return this.pos;
  }

  public getCursorSize(): number {
    return this.cursorSize;
  }

  public destroy() {
    this.mouseMove.removeEventListener('mousemove', this.onMouseMove);
  }
}
