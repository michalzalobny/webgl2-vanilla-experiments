import { Vec4 } from '../Vec4';

/**
 * Calculates the length of a vec4
 *
 * @param {Vec4} a vector to calculate length of
 * @returns {Number} length of a
 */
export function length(a: Vec4) {
  let x = a[0];
  let y = a[1];
  let z = a[2];
  let w = a[3];
  return Math.sqrt(x * x + y * y + z * z + w * w);
}

/**
 * Copy the values from one vec4 to another
 *
 * @param {Vec4} out the receiving vector
 * @param {Vec4} a the source vector
 * @returns {Vec4} out
 */
export function copy(out: Vec4, a: Vec4) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}

/**
 * Set the components of a vec4 to the given values
 *
 * @param {Vec4} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {Vec4} out
 */
export function set(out: Vec4, x: number, y: number, z: number, w: number) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = w;
  return out;
}

/**
 * Adds two vec4's
 *
 * @param {Vec4} out the receiving vector
 * @param {Vec4} a the first operand
 * @param {Vec4} b the second operand
 * @returns {Vec4} out
 */
export function add(out: Vec4, a: Vec4, b: Vec4) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  return out;
}

/**
 * Subtracts vector b from vector a
 *
 * @param {Vec4} out the receiving vector
 * @param {Vec4} a the first operand
 * @param {Vec4} b the second operand
 * @returns {Vec4} out
 */
export function subtract(out: Vec4, a: Vec4, b: Vec4) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  return out;
}

/**
 * Multiplies two vec4's
 *
 * @param {Vec4} out the receiving vector
 * @param {Vec4} a the first operand
 * @param {Vec4} b the second operand
 * @returns {Vec4} out
 */
export function multiply(out: Vec4, a: Vec4, b: Vec4) {
  out[0] = a[0] * b[0];
  out[1] = a[1] * b[1];
  out[2] = a[2] * b[2];
  out[3] = a[3] * b[3];
  return out;
}

/**
 * Divides two vec4's
 *
 * @param {Vec4} out the receiving vector
 * @param {Vec4} a the first operand
 * @param {Vec4} b the second operand
 * @returns {Vec4} out
 */
export function divide(out: Vec4, a: Vec4, b: Vec4) {
  out[0] = a[0] / b[0];
  out[1] = a[1] / b[1];
  out[2] = a[2] / b[2];
  out[3] = a[3] / b[3];
  return out;
}

/**
 * Scales a vec4 by a scalar number
 *
 * @param {Vec4} out the receiving vector
 * @param {Vec4} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {Vec4} out
 */
export function scale(out: Vec4, a: Vec4, b: number) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  return out;
}

/**
 * Calculates the squared length of a vec4
 *
 * @param {Vec4} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
export function squaredLength(a: Vec4) {
  let x = a[0];
  let y = a[1];
  let z = a[2];
  let w = a[3];
  return x * x + y * y + z * z + w * w;
}

/**
 * Calculates the euclidean distance between two vec4's
 *
 * @param {Vec4} a the first operand
 * @param {Vec4} b the second operand
 * @returns {Number} distance between a and b
 */
export function distance(a: Vec4, b: Vec4) {
  let x = b[0] - a[0];
  let y = b[1] - a[1];
  let z = b[2] - a[2];
  let w = b[3] - a[3];
  return Math.sqrt(x * x + y * y + z * z + w * w);
}

/**
 * Normalize a vec4
 *
 * @param {Vec4} out the receiving vector
 * @param {Vec4} a vector to normalize
 * @returns {Vec4} out
 */
export function normalize(out: Vec4, a: Vec4) {
  let x = a[0];
  let y = a[1];
  let z = a[2];
  let w = a[3];
  let len = x * x + y * y + z * z + w * w;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
  }
  out[0] = a[0] * len;
  out[1] = a[1] * len;
  out[2] = a[2] * len;
  out[3] = a[3] * len;
  return out;
}

/**
 * Calculates the dot product of two vec4's
 *
 * @param {Vec4} a the first operand
 * @param {Vec4} b the second operand
 * @returns {Number} dot product of a and b
 */
export function dot(a: Vec4, b: Vec4) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}
