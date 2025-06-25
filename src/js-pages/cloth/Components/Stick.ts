import { Point } from './Point';

interface Props {
  p1: Point;
  p2: Point;
  length: number;
}

export class Stick {
  public p1;
  public p2;
  public length;

  constructor(props: Props) {
    const { p1, p2, length } = props;
    this.p1 = p1;
    this.p2 = p2;
    this.length = length;
  }
}
