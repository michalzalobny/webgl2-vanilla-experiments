import { Vec2 } from '../lib/math/Vec2';
import { Vec3 } from '../lib/math/Vec3';
import { Stick } from './Stick';
import { Mouse } from './Mouse';

type Props = {
  x: number;
  y: number;
  z: number;
  mass: number;
};

var DAMPING = 0.03;
var DRAG = 1 - DAMPING;
var MASS = 0.1;
var restDistance = 25;
var GRAVITY = 981 * 1.4;
var gravity = new Vec3(0, -GRAVITY, 0).multiply(MASS);

var TIMESTEP = 18 / 1000;
var TIMESTEP_SQ = TIMESTEP * TIMESTEP;

var tmpForce = new Vec3();

export class Point {
  // Other
  public position = new Vec3();
  previous = new Vec3();
  original = new Vec3();
  a = new Vec3(0, 0, 0); // acceleration
  mass;
  invMass;
  tmp = new Vec3();
  tmp2 = new Vec3();

  //My
  private sticks: (Stick | null)[] = [];
  private isPinned = false;
  private isSelected = false;

  constructor(props: Props) {
    this.mass = props.mass;
    this.invMass = 1 / this.mass;
    this.position.setTo(props.x, props.y, props.z);

    this.position.setTo(props.x, props.y, props.z);
    this.previous.copy(this.position);
    this.original.copy(this.position);
  }

  public addForce(force: Vec3) {
    this.a.add(this.tmp2.copy(force).multiply(this.invMass));
  }

  public integrate(timesq: number) {
    const newPos = this.position.clone().sub(this.previous);
    newPos.multiply(DRAG).add(this.position);
    newPos.add(this.a.multiply(timesq));

    this.tmp = this.previous;
    this.previous = this.position;
    this.position = newPos;

    this.a.setTo(0, 0, 0);
  }

  /** Stick registration (max 2) */
  public addStick(stick: Stick, index: 0 | 1): void {
    this.sticks[index] = stick;
  }

  public getPosition(): Vec3 {
    return this.position;
  }

  public setPosition(x: number, y: number, z = 0): void {
    this.position.setTo(x, y, z);
    // this.previous.setTo(x, y, z);
  }

  public pin(): void {
    this.isPinned = true;
  }

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
    const mouseDir = this.position.clone().sub(new Vec3(...mouse.getPosition(), 0));

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

      this.previous = this.position.clone().sub(new Vec3(...diff, 0));
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
      this.position.copy(this.original);
      return;
    }

    this.integrate(deltaTime);
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
}
