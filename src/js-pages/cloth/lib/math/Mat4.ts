import * as Mat4Func from './utils/Mat4Func';
import { Vec3 } from './Vec3';

export class Mat4 extends Float32Array {
  constructor(
    m00 = 1,
    m01 = 0,
    m02 = 0,
    m03 = 0,
    m10 = 0,
    m11 = 1,
    m12 = 0,
    m13 = 0,
    m20 = 0,
    m21 = 0,
    m22 = 1,
    m23 = 0,
    m30 = 0,
    m31 = 0,
    m32 = 0,
    m33 = 1,
  ) {
    super([m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33]);
    return this;
  }

  get x() {
    return this[12];
  }

  get y() {
    return this[13];
  }

  get z() {
    return this[14];
  }

  get w() {
    return this[15];
  }

  set x(v) {
    this[12] = v;
  }

  set y(v) {
    this[13] = v;
  }

  set z(v) {
    this[14] = v;
  }

  set w(v) {
    this[15] = v;
  }

  // Can't use 'set' as Float32Array uses it
  setTo(
    m00: Mat4 | number,
    m01 = m00,
    m02 = m00,
    m03 = m00,
    m10 = m00,
    m11 = m00,
    m12 = m00,
    m13 = m00,
    m20 = m00,
    m21 = m00,
    m22 = m00,
    m23 = m00,
    m30 = m00,
    m31 = m00,
    m32 = m00,
    m33 = m00,
  ) {
    // @ts-ignore
    if (m00.length) return this.copy(m00);
    // @ts-ignore
    Mat4Func.set(this, m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33);
    return this;
  }

  translate(v: Vec3, m = this) {
    Mat4Func.translate(this, m, v);
    return this;
  }

  rotate(v: number, axis: Vec3, m = this) {
    Mat4Func.rotate(this, m, v, axis);
    return this;
  }

  rotateX(v: number, m = this) {
    Mat4Func.rotateX(this, m, v);
    return this;
  }

  rotateY(v: number, m = this) {
    Mat4Func.rotateY(this, m, v);
    return this;
  }

  rotateZ(v: number, m = this) {
    Mat4Func.rotateZ(this, m, v);
    return this;
  }

  scale(v: Vec3 | number, m = this) {
    // @ts-ignore
    if (v.length) return Mat4Func.scale(this, m, v);
    // @ts-ignore
    Mat4Func.scale(this, m, new Vec3(v));
    return this;
  }

  add(ma: Mat4, mb: Mat4) {
    if (mb) Mat4Func.add(this, ma, mb);
    else Mat4Func.add(this, this, ma);
    return this;
  }

  sub(ma: Mat4, mb: Mat4) {
    if (mb) Mat4Func.subtract(this, ma, mb);
    else Mat4Func.subtract(this, this, ma);
    return this;
  }

  multiply(ma: Mat4 | number, mb?: Mat4) {
    // @ts-ignore
    if (!ma.length) {
      // @ts-ignore
      Mat4Func.multiplyScalar(this, this, ma);
    } else if (mb) {
      // @ts-ignore
      Mat4Func.multiply(this, ma, mb);
    } else {
      // @ts-ignore
      Mat4Func.multiply(this, this, ma);
    }
    return this;
  }

  identity() {
    Mat4Func.identity(this);
    return this;
  }

  copy(m: Mat4) {
    Mat4Func.copy(this, m);
    return this;
  }

  setPosition(v: Vec3) {
    this.x = v[0];
    this.y = v[1];
    this.z = v[2];
    return this;
  }

  inverse(m = this) {
    Mat4Func.invert(this, m);
    return this;
  }
}
