function numSubarrayProductLessThanK(nums: number[], k: number): number {
  let left = 0;
  let curr = 1;
  let ans = 0;

  if (k <= 1) {
    return 0;
  }

  for (let right = 0; right < nums.length; right++) {
    curr *= nums[right];

    while (curr >= k) {
      curr /= nums[left];
      left += 1;
    }
    ans += right - left + 1;
  }
  return ans;
}

const value = numSubarrayProductLessThanK([10, 5, 2, 6], 100);
console.log(value);
