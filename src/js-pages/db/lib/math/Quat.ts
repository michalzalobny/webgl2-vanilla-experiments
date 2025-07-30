import * as QuatFunc from './utils/QuatFunc';

import { Vec3 } from './Vec3';

export class Quat extends Float32Array {
  constructor(x = 0, y = 0, z = 0, w = 1) {
    super([x, y, z, w]);
  }

  static create() {
    return new Quat(0, 0, 0, 1); // Identity quaternion
  }

  setTo(x: number | Quat, y = 0, z = 0, w = 1) {
    if (typeof x !== 'number') {
      return this.copy(x);
    }
    QuatFunc.set(this, x, y, z, w);
    return this;
  }

  copy(q: Quat) {
    QuatFunc.copy(this, q);
    return this;
  }

  normalize() {
    QuatFunc.normalize(this, this);
    return this;
  }

  rotationTo(a: Vec3, b: Vec3) {
    QuatFunc.rotationTo(this, a, b);
    return this;
  }

  clone() {
    return new Quat(this[0], this[1], this[2], this[3]);
  }
}
