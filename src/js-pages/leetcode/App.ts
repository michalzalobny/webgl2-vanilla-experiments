//1. Sliding window - we always iterate through right since it has to go forward, and shrink left ONLY when the constraints are not met.
//2. The (right - left + 1) is used only to get the length of the window (length of the array) -
//and it's always the amount of new sub arrays added after we add new component. before: [1],[1,2], [2] now: [1,X], [1,2,X], [2,X], [X] + before
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
// numSubarrayProductLessThanK([10, 5, 2, 6], 100);

function findBestSubarray(nums: number[], k: number): number {
  let curr = 0;

  for (let i = 0; i < k; i++) {
    curr += nums[i];
  }

  let ans = curr;

  for (let i = k; i < nums.length; i++) {
    curr += nums[i] - nums[i - k];
    ans = Math.max(ans, curr);
  }

  return ans;
}
// console.log(findBestSubarray([3, -1, 4, 12, -8, 5, 6], 2));

/*
  Given an integer array nums, an array queries where queries[i] = [x, y] and an
  integer limit, return a boolean array that represents the answer to each query. A query
  is true if the sum of the subarray from x to y is less than limit, or false otherwise.
*/
function answerQueries(nums: number[], queries: number[][], limit: number): boolean[] {
  let ans: boolean[] = [];
  //Pre process nums array -> create prefix array, to easily get the sum of any contiguous sub array
  // [1, 6, 3, 2, 7, 2] -> [1, 7, 10, 12, 19, 21]
  const prefix = [nums[0]];
  for (let i = 1; i < nums.length; i++) {
    prefix.push(prefix[i - 1] + nums[i]);
  }

  for (let i = 0; i < queries.length; i++) {
    const sub = queries[i];
    const totalSum = prefix[sub[1]] - prefix[sub[0]] + nums[sub[0]];
    ans.push(totalSum < limit);
  }

  return ans;
}

console.log(
  answerQueries(
    [1, 6, 3, 2, 7, 2],
    [
      [0, 3],
      [2, 5],
      [2, 4],
    ],
    13,
  ),
);
