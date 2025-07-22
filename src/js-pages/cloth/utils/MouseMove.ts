import { EventDispatcher } from './EventDispatcher';

interface Mouse {
  x: number;
  y: number;
}

export class MouseMove extends EventDispatcher {
  private mouseLast: Mouse = { x: 0, y: 0 };
  private isTouching = false;
  private clickStart: Mouse = { x: 0, y: 0 };
  public mouse: Mouse = { x: 0, y: 0 };
  public strength = 0;
  private isInit = false;

  public rightButtonDown = false;

  private static instance: MouseMove | null = null;
  private static canCreate = false;

  public static getInstance(): MouseMove {
    if (!MouseMove.instance) {
      MouseMove.canCreate = true;
      MouseMove.instance = new MouseMove();
      MouseMove.canCreate = false;
    }

    return MouseMove.instance;
  }

  private constructor() {
    super();

    if (MouseMove.instance || !MouseMove.canCreate) {
      throw new Error('Use MouseMove.getInstance()');
    }

    this.addEvents();
    MouseMove.instance = this;
  }

  private onPointerDown = (event: MouseEvent | TouchEvent): void => {
    this.isInit = true;
    this.isTouching = true;

    if ('touches' in event) {
      const touches = event.touches;
      const touch = touches[0];
      this.mouseLast.x = touch.clientX;
      this.mouseLast.y = touch.clientY;
      this.mouse.x = touch.clientX;
      this.mouse.y = touch.clientY;
      this.clickStart = { ...this.mouse };

      this.dispatchEvent({ type: 'down' });
      this.dispatchEvent({ type: 'mousemove' });
    } else {
      this.mouseLast.x = event.clientX;
      this.mouseLast.y = event.clientY;
      this.mouse.x = event.clientX;
      this.mouse.y = event.clientY;
      this.clickStart = { ...this.mouse };

      // Update button states
      if (event.button === 2) {
        this.rightButtonDown = true;
        this.dispatchEvent({ type: 'rightclick' });
      }

      this.dispatchEvent({ type: 'down' });
      this.dispatchEvent({ type: 'mousemove' });
    }
  };

  private onPointerMove = (event: TouchEvent | MouseEvent): void => {
    this.isInit = true;

    const touchX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const touchY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    const deltaX = touchX - this.mouseLast.x;
    const deltaY = touchY - this.mouseLast.y;

    this.strength = deltaX * deltaX + deltaY * deltaY;

    this.mouseLast = { x: touchX, y: touchY };
    this.mouse.x += deltaX;
    this.mouse.y += deltaY;

    this.dispatchEvent({ type: 'mousemove' });
    this.mouseLast = { ...this.mouse };
  };

  private onPointerUp = (event: TouchEvent | MouseEvent): void => {
    this.isTouching = false;

    // Reset button states
    this.rightButtonDown = false;

    this.dispatchEvent({ type: 'up' });
  };

  private onMouseLeave = (): void => {
    this.dispatchEvent({ type: 'left' });
  };

  private onClick = (e: MouseEvent): void => {
    if (e.target instanceof HTMLButtonElement || e.target instanceof HTMLAnchorElement) return;

    this.isInit = true;

    const clickBounds = 10;
    const xDiff = Math.abs(this.clickStart.x - this.mouse.x);
    const yDiff = Math.abs(this.clickStart.y - this.mouse.y);

    if (xDiff <= clickBounds && yDiff <= clickBounds) {
      this.dispatchEvent({ type: 'click' });
    }
  };

  private addEvents(): void {
    window.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('touchstart', this.onPointerDown, { passive: true });

    window.addEventListener('mousemove', this.onPointerMove, { passive: true });
    window.addEventListener('touchmove', this.onPointerMove, { passive: true });

    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('touchend', this.onPointerUp);

    window.addEventListener('click', this.onClick);
    window.addEventListener('mouseout', this.onMouseLeave);

    window.addEventListener('contextmenu', (e) => e.preventDefault());
  }
}
