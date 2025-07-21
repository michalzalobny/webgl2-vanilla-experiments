import { Vec3 } from '../lib/math/Vec3';
import { Stick } from './Stick';
import { MouseMove } from '../utils/MouseMove';

type Props = {
  x: number;
  y: number;
  z: number;
  mass: number;
  onStickBreak: () => void;
};

var DAMPING = 0.03;
var DRAG = 1 - DAMPING;
var MASS = 0.1;
var GRAVITY = 9.81 * 0.5;
var gravity = new Vec3(0, -GRAVITY, 0).multiply(MASS);

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
  public isSelected = false;

  private isDragged = false;
  private dragTarget: Vec3 | null = null;

  public isActive: boolean = true;

  private onStickBreak: () => void;

  constructor(props: Props) {
    this.onStickBreak = props.onStickBreak;
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

  // Verlet integration
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

  public update(deltaTime: number, mouseMove: MouseMove, mousePosition: Vec3): void {
    // Check if mouse is near this point
    const mouseDir = this.position.clone().sub(mousePosition);

    // updateDebug(mouse.getPosition());

    const mouseDist = mouseDir.len();
    // this.isSelected = mouseDist < 40;

    // Propagate selection to sticks
    for (const stick of this.sticks) {
      if (stick) {
        stick.setIsSelected(this.isSelected);
      }
    }

    // // Left-click drag interaction
    // if (mouse.getLeftButtonDown() && this.isSelected) {
    //   const diff = mouse.getPosition().clone().sub(mouse.getPreviousPosition());

    //   diff.x = Math.max(-elasticity, Math.min(elasticity, diff.x));
    //   diff.y = Math.max(-elasticity, Math.min(elasticity, diff.y));

    //   this.previous = this.position.clone().sub(new Vec3(...diff, 0));
    // }

    if (mouseMove.leftButtonDown && this.isSelected) {
      this.isDragged = true;
      this.dragTarget = mousePosition;
    } else {
      this.isDragged = false;
      this.dragTarget = null;
    }

    if (this.isDragged && this.dragTarget) {
      const toMouse = this.dragTarget.clone().sub(this.position);
      const strength = 1; // spring constant
      const damping = 0.1; // between 0 (no motion) and 1 (no damping)

      // Simulate elastic force pulling to mouse
      const force = toMouse.scale(strength);
      this.addForce(force);

      // Optional: slightly damp the Verlet velocity
      const velocity = this.position.clone().sub(this.previous).scale(damping);
      this.previous = this.position.clone().sub(velocity);
    }

    // Right-click to break sticks
    if (mouseMove.rightButtonDown && this.isSelected) {
      for (const stick of this.sticks) {
        if (stick) {
          stick.break();
          this.onStickBreak();
          this.isActive = false;
        }
      }
    }

    // Pinned point stays fixed
    if (this.isPinned) {
      this.position.copy(this.original);
      return;
    }

    this.addForce(gravity);
    this.integrate(deltaTime);
  }
}
