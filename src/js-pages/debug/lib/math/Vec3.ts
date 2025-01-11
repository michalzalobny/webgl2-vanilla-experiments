import * as Vec3Func from './utils/Vec3Func';

export class Vec3 extends Float32Array {
  constructor(x = 0, y = x, z = x) {
    super([x, y, z]);
  }

  get x() {
    return this[0];
  }

  get y() {
    return this[1];
  }

  get z() {
    return this[2];
  }

  set x(v) {
    this[0] = v;
  }

  set y(v) {
    this[1] = v;
  }

  set z(v) {
    this[2] = v;
  }

  // Can't use 'set' as Float32Array uses it
  setTo(x: Vec3 | number, y = x, z = x) {
    // @ts-ignore
    if (x.length) return this.copy(x);
    // @ts-ignore
    Vec3Func.set(this, x, y, z);
    return this;
  }

  copy(v: Vec3) {
    Vec3Func.copy(this, v);
    return this;
  }

  add(va: Vec3, vb?: Vec3) {
    if (vb) Vec3Func.add(this, va, vb);
    else Vec3Func.add(this, this, va);
    return this;
  }

  sub(va: Vec3, vb?: Vec3) {
    if (vb) Vec3Func.subtract(this, va, vb);
    else Vec3Func.subtract(this, this, va);
    return this;
  }

  multiply(v: Vec3 | number) {
    // @ts-ignore
    if (v.length) Vec3Func.multiply(this, this, v);
    // @ts-ignore
    else Vec3Func.scale(this, this, v);
    return this;
  }

  divide(v: Vec3 | number) {
    // @ts-ignore
    if (v.length) Vec3Func.divide(this, this, v);
    // @ts-ignore
    else Vec3Func.scale(this, this, 1 / v);
    return this;
  }

  // Can't use 'length' as Array.prototype uses it
  len() {
    return Vec3Func.length(this);
  }

  distance(v: Vec3) {
    if (v) return Vec3Func.distance(this, v);
    else return Vec3Func.length(this);
  }

  cross(va: Vec3, vb?: Vec3) {
    if (vb) Vec3Func.cross(this, va, vb);
    else Vec3Func.cross(this, this, va);
    return this;
  }

  scale(v: number) {
    Vec3Func.scale(this, this, v);
    return this;
  }

  normalize() {
    Vec3Func.normalize(this, this);
    return this;
  }

  dot(v: Vec3) {
    return Vec3Func.dot(this, v);
  }

  clone() {
    return new Vec3(this[0], this[1], this[2]);
  }
}
