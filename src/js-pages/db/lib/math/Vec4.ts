import * as Vec4Func from './utils/Vec4Func';

export class Vec4 extends Float32Array {
  constructor(x = 0, y = x, z = x, w = x) {
    super([x, y, z, w]);
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

  get w() {
    return this[3];
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

  set w(v) {
    this[3] = v;
  }

  // Can't use 'set' as Float32Array uses it
  setTo(x: Vec4 | number, y = x, z = x, w = x) {
    // @ts-ignore
    if (x.length) return this.copy(x);
    // @ts-ignore
    Vec4Func.set(this, x, y, z, w);
    return this;
  }

  copy(v: Vec4) {
    Vec4Func.copy(this, v);
    return this;
  }

  add(va: Vec4, vb?: Vec4) {
    if (vb) Vec4Func.add(this, va, vb);
    else Vec4Func.add(this, this, va);
    return this;
  }

  sub(va: Vec4, vb?: Vec4) {
    if (vb) Vec4Func.subtract(this, va, vb);
    else Vec4Func.subtract(this, this, va);
    return this;
  }

  multiply(v: Vec4 | number) {
    // @ts-ignore
    if (v.length) Vec4Func.multiply(this, this, v);
    // @ts-ignore
    else Vec4Func.scale(this, this, v);
    return this;
  }

  divide(v: Vec4 | number) {
    // @ts-ignore
    if (v.length) Vec4Func.divide(this, this, v);
    // @ts-ignore
    else Vec4Func.scale(this, this, 1 / v);
    return this;
  }

  // Can't use 'length' as Array.prototype uses it
  len() {
    return Vec4Func.length(this);
  }

  distance(v?: Vec4) {
    if (v) return Vec4Func.distance(this, v);
    else return Vec4Func.length(this);
  }

  squaredLen() {
    return Vec4Func.squaredLength(this);
  }

  scale(v: number) {
    Vec4Func.scale(this, this, v);
    return this;
  }

  normalize() {
    Vec4Func.normalize(this, this);
    return this;
  }

  dot(v: Vec4) {
    return Vec4Func.dot(this, v);
  }

  clone() {
    return new Vec4(this[0], this[1], this[2], this[3]);
  }
}
