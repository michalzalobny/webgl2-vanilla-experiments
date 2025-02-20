import { Mat4 } from '../lib/math/Mat4';

export const printMat4 = (m: Mat4) => {
  //Copy the matrix so we don't modify the original
  const mCopy = new Mat4().copy(m);

  // Example:
  // | 1 0 0 0 |
  // | 0 1 0 0 |
  // | 0 0 1 0 |
  // | 0 0 0 1 |

  const arr = Array.from(mCopy).map((n) => n.toFixed(2));

  console.log(
    `| ${arr[0]} ${arr[4]} ${arr[8]} ${arr[12]} |\n` +
      `| ${arr[1]} ${arr[5]} ${arr[9]} ${arr[13]} |\n` +
      `| ${arr[2]} ${arr[6]} ${arr[10]} ${arr[14]} |\n` +
      `| ${arr[3]} ${arr[7]} ${arr[11]} ${arr[15]} |`,
  );
};
