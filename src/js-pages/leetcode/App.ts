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
  //Pre process nums array -> create runningSum array, to easily get the sum of any contiguous sub array
  // [1, 6, 3, 2, 7, 2] -> [1, 7, 10, 12, 19, 21]
  const runningSum = [nums[0]];
  for (let i = 1; i < nums.length; i++) {
    runningSum.push(runningSum[i - 1] + nums[i]);
  }

  for (let i = 0; i < queries.length; i++) {
    const sub = queries[i];
    const totalSum = runningSum[sub[1]] - runningSum[sub[0]] + nums[sub[0]];
    ans.push(totalSum < limit);
  }

  return ans;
}
// console.log(
//   answerQueries(
//     [1, 6, 3, 2, 7, 2],
//     [
//       [0, 3],
//       [2, 5],
//       [2, 4],
//     ],
//     13,
//   ),
// );

/*
  You are given a 0-indexed integer array nums of length n.

  nums contains a valid split at index i if the following are true:

  The sum of the first i + 1 elements is greater than or equal to the sum of the last n - i - 1 elements.
  There is at least one element to the right of i. That is, 0 <= i < n - 1.
  Return the number of valid splits in nums.
*/
function waysToSplitArray(nums: number[]): number {
  let runningSum = []; // Stores the sums of all contiguous subarrays, [10, 4, -8, 7] -> [10, 14, 6, 13]
  runningSum[0] = nums[0];

  for (let i = 1; i < nums.length; i++) {
    runningSum[i] = runningSum[i - 1] + nums[i];
  }

  let ans = 0;

  for (let i = 0; i <= nums.length - 2; i++) {
    // We are going till the
    const leftSide = runningSum[i];
    const rightSide = runningSum[nums.length - 1] - leftSide;

    if (leftSide >= rightSide) {
      ans += 1;
    }
  }
  return ans;
}
console.log(waysToSplitArray([10, 4, -8, 7]));
