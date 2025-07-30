import { Point } from './Point';

type Props = {
  p0: Point;
  p1: Point;
  length: number;
};

export class Stick {
  public p0: Point;
  public p1: Point;
  private length: number;

  public isActive: boolean = true;
  private isSelected: boolean = false;

  constructor(props: Props) {
    const { length, p0, p1 } = props;
    this.p0 = p0;
    this.p1 = p1;
    this.length = length;
  }

  public setIsSelected(value: boolean): void {
    this.isSelected = value;
  }
  public update(): void {
    if (!this.isActive) return;

    const p0Pos = this.p0.getPosition();
    const p1Pos = this.p1.getPosition();

    const delta = p0Pos.clone().sub(p1Pos); // Vector from p1 to p0
    const dist = delta.len();
    if (dist === 0) return;

    const diffFactor = (this.length - dist) / dist;

    // offset = delta * diffFactor * 0.5
    const offset = delta.scale(diffFactor * 0.5);

    // Apply offset to both points
    this.p0.setPosition(p0Pos.x + offset.x, p0Pos.y + offset.y, p0Pos.z + offset.z);

    this.p1.setPosition(p1Pos.x - offset.x, p1Pos.y - offset.y, p1Pos.z - offset.z);
  }

  public break(): void {
    this.isActive = false;
  }
}
