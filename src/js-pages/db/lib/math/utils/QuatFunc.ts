import { Vec3 } from '../Vec3';
import { Quat } from '../Quat';
import * as Vec3Func from './Vec3Func';

/**
 * Sets the components of a quaternion
 */
export function set(out: Quat, x: number, y: number, z: number, w: number) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = w;
  return out;
}

/**
 * Copies a quaternion
 */
export function copy(out: Quat, q: Quat) {
  out[0] = q[0];
  out[1] = q[1];
  out[2] = q[2];
  out[3] = q[3];
  return out;
}

/**
 * Normalizes a quaternion
 */
export function normalize(out: Quat, q: Quat) {
  const x = q[0],
    y = q[1],
    z = q[2],
    w = q[3];
  let len = x * x + y * y + z * z + w * w;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
    out[0] = x * len;
    out[1] = y * len;
    out[2] = z * len;
    out[3] = w * len;
  }
  return out;
}

/**
 * Sets a quaternion to rotate vector a to vector b
 */
export function rotationTo(out: Quat, a: Vec3, b: Vec3) {
  const v1 = new Vec3();
  Vec3Func.normalize(v1, a);
  const v2 = new Vec3();
  Vec3Func.normalize(v2, b);

  const dot = Vec3Func.dot(v1, v2);
  const EPSILON = 0.000001;

  if (dot < -1 + EPSILON) {
    // Vectors are nearly opposite
    let axis = new Vec3(1, 0, 0);
    Vec3Func.cross(axis, new Vec3(1, 0, 0), v1);
    if (Vec3Func.squaredLength(axis) < EPSILON) {
      Vec3Func.cross(axis, new Vec3(0, 1, 0), v1);
    }
    Vec3Func.normalize(axis, axis);
    return setAxisAngle(out, axis, Math.PI);
  }

  const cross = new Vec3();
  Vec3Func.cross(cross, v1, v2);

  out[0] = cross[0];
  out[1] = cross[1];
  out[2] = cross[2];
  out[3] = 1 + dot;
  normalize(out, out);
  return out;
}

/**
 * Sets a quaternion from axis and angle
 */
export function setAxisAngle(out: Quat, axis: Vec3, rad: number) {
  rad = rad * 0.5;
  const s = Math.sin(rad);
  out[0] = axis[0] * s;
  out[1] = axis[1] * s;
  out[2] = axis[2] * s;
  out[3] = Math.cos(rad);
  return out;
}
