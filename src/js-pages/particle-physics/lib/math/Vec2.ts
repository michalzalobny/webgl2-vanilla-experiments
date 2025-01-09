import * as Vec2Func from './utils/Vec2Func';

export class Vec2 extends Float32Array {
  constructor(x = 0, y = x) {
    super([x, y]);
  }

  get x() {
    return this[0];
  }

  get y() {
    return this[1];
  }

  set x(v) {
    this[0] = v;
  }

  set y(v) {
    this[1] = v;
  }

  // Can't use 'set' as Float32Array uses it
  setTo(x: Vec2 | number, y = x) {
    // @ts-ignore
    if (x.length) return this.copy(x);
    // @ts-ignore
    Vec2Func.set(this, x, y);
    return this;
  }

  copy(v: Vec2) {
    Vec2Func.copy(this, v);
    return this;
  }

  add(va: Vec2, vb: Vec2) {
    if (vb) Vec2Func.add(this, va, vb);
    else Vec2Func.add(this, this, va);
    return this;
  }

  sub(va: Vec2, vb: Vec2) {
    if (vb) Vec2Func.subtract(this, va, vb);
    else Vec2Func.subtract(this, this, va);
    return this;
  }

  multiply(v: Vec2 | number) {
    // @ts-ignore
    if (v.length) Vec2Func.multiply(this, this, v);
    // @ts-ignore
    else Vec2Func.scale(this, this, v);
    return this;
  }

  divide(v: Vec2 | number) {
    // @ts-ignore
    if (v.length) Vec2Func.divide(this, this, v);
    // @ts-ignore
    else Vec2Func.scale(this, this, 1 / v);
    return this;
  }

  // Can't use 'length' as Array.prototype uses it
  len() {
    return Vec2Func.length(this);
  }

  distance(v: Vec2) {
    if (v) return Vec2Func.distance(this, v);
    else return Vec2Func.length(this);
  }

  cross(va: Vec2, vb: Vec2) {
    if (vb) return Vec2Func.cross(va, vb);
    return Vec2Func.cross(this, va);
  }

  scale(v: number) {
    Vec2Func.scale(this, this, v);
    return this;
  }

  normalize() {
    Vec2Func.normalize(this, this);
    return this;
  }

  dot(v: Vec2) {
    return Vec2Func.dot(this, v);
  }

  clone() {
    return new Vec2(this[0], this[1]);
  }
}
