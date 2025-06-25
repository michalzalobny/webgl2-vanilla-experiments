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

  private isActive: boolean = true;
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

    const diffX = p0Pos.x - p1Pos.x;
    const diffY = p0Pos.y - p1Pos.y;

    const dist = Math.sqrt(diffX * diffX + diffY * diffY);
    if (dist === 0) return;

    const diffFactor = (this.length - dist) / dist;
    const offsetX = diffX * diffFactor * 0.5;
    const offsetY = diffY * diffFactor * 0.5;

    this.p0.setPosition(p0Pos.x + offsetX, p0Pos.y + offsetY);
    this.p1.setPosition(p1Pos.x - offsetX, p1Pos.y - offsetY);
  }

  public break(): void {
    this.isActive = false;
  }
}
