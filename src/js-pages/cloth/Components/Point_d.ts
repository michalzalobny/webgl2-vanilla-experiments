import { Vec2 } from '../lib/math/Vec2';
import { Stick } from './Stick';
import { Mouse } from './Mouse';

type Props = {
  x: number;
  y: number;
};

export class Point {
  private sticks: (Stick | null)[] = [];

  private pos = new Vec2();
  private prevPos = new Vec2();
  private initPos = new Vec2();

  private isPinned = false;
  private isSelected = false;

  private tempVec2 = new Vec2();
  private velocity = new Vec2();

  constructor(props: Props) {
    this.pos.setTo(props.x, props.y);
    this.prevPos.copy(this.pos);
    this.initPos.copy(this.pos);
  }

  /** Stick registration (max 2) */
  public addStick(stick: Stick, index: 0 | 1): void {
    this.sticks[index] = stick;
  }

  public getPosition(): Vec2 {
    return this.pos;
  }

  public setPosition(x: number, y: number): void {
    this.pos.setTo(x, y);
    // this.prevPos.setTo(x, y);
  }

  public pin(): void {
    this.isPinned = true;
  }

  // Euler integration of the particle's position and velocity
  private integrate = (dt: number, acceleration: Vec2) => {
    const velocity = this.pos.clone().sub(this.prevPos);
    const accelerationEff = acceleration.clone();
    const newPos = this.pos.clone().add(velocity).add(accelerationEff);

    // Update velocity: velocity += acceleration * dt
    // this.tempVec2.copy(acceleration).multiply(dt);
    // this.velocity.add(this.tempVec2);

    // Update position: position += velocity * dt
    this.tempVec2.copy(velocity).multiply(dt);

    this.prevPos.copy(this.pos);
    this.pos.copy(newPos);

    //   const velocity = this.pos
    //   .clone()
    //   .sub(this.prevPos)
    //   .scale(1 - drag);
    // const accelerationEffect = acceleration.clone().scale(deltaTime * deltaTime);
    // const newPos = this.pos.clone().add(velocity).add(accelerationEffect);

    // this.prevPos.copy(this.pos);
    // this.pos.copy(newPos);
  };

  public update(
    deltaTime: number,
    drag: number,
    acceleration: Vec2,
    elasticity: number,
    mouse: Mouse,
    windowWidth: number,
    windowHeight: number,
  ): void {
    // Check if mouse is near this point
    const mouseDir = this.pos.clone().sub(mouse.getPosition());

    // updateDebug(mouse.getPosition());

    const mouseDist = mouseDir.len();
    this.isSelected = mouseDist < mouse.getCursorSize();

    // Propagate selection to sticks
    for (const stick of this.sticks) {
      if (stick) {
        stick.setIsSelected(this.isSelected);
      }
    }

    // Left-click drag interaction
    if (mouse.getLeftButtonDown() && this.isSelected) {
      const diff = mouse.getPosition().clone().sub(mouse.getPreviousPosition());

      diff.x = Math.max(-elasticity, Math.min(elasticity, diff.x));
      diff.y = Math.max(-elasticity, Math.min(elasticity, diff.y));

      this.prevPos = this.pos.clone().sub(diff);
    }

    // Right-click to break sticks
    if (mouse.getRightMouseButton() && this.isSelected) {
      for (const stick of this.sticks) {
        if (stick) {
          stick.break();
        }
      }
    }

    // Pinned point stays fixed
    if (this.isPinned) {
      this.pos.copy(this.initPos);
      return;
    }

    this.integrate(deltaTime, acceleration);

    // Verlet integration
    // const velocity = this.pos
    //   .clone()
    //   .sub(this.prevPos)
    //   .scale(1 - drag);
    // const accelerationEffect = acceleration.clone().scale(deltaTime * deltaTime);
    // const newPos = this.pos.clone().add(velocity).add(accelerationEffect);

    // this.prevPos.copy(this.pos);
    // this.pos.copy(newPos);

    // // Verlet integration
    // const velocity = this.pos
    //   .clone()
    //   .sub(this.prevPos)
    //   .scale(1 - drag);
    // const accelerationEffect = acceleration.clone().scale((1 - drag) * deltaTime * deltaTime);
    // const newPos = this.pos.clone().add(velocity).add(accelerationEffect);

    // this.prevPos.copy(this.pos);
    // this.pos.copy(newPos);

    // // this.keepInsideView(windowWidth, windowHeight);
  }

  private keepInsideView(windowWidth: number, windowHeight: number): void {
    this.pos.x = Math.max(0, Math.min(windowWidth, this.pos.x));
    this.pos.y = Math.max(0, Math.min(windowHeight, this.pos.y));
  }
}
