import { Vec2 } from '../lib/math/Vec2';
import { Stick } from './Stick';

type Props = {
  x: number;
  y: number;
  mass: number;
};

export class Point {
  private sticks: Stick[] = [];

  private pos = new Vec2();
  private prevPos = new Vec2();
  private initPos = new Vec2();

  private isPinned = false;
  private isSelected = false;

  constructor(props: Props) {
    this.pos.setTo(props.x, props.y);
    this.prevPos.copy(this.pos);
    this.initPos.copy(this.pos);
  }

  /** Stick registration (max 2) */
  public addStick(stick: Stick, index: 0 | 1): void {
    this.sticks[index] = stick;
  }

  public getPosition() {
    return this.pos;
  }

  public setPosition(x: number, y: number) {
    this.pos.setTo(x, y);
  }

  public pin(): void {
    this.isPinned = true;
  }
}
