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
// console.log(waysToSplitArray([10, 4, -8, 7]));

/*
  Given an array of integers nums, you start with an initial positive value startValue.
  In each iteration, you calculate the step by step sum of startValue plus elements in nums (from left to right).
  Return the minimum positive value of startValue such that the step by step sum is never less than 1.
*/
function minStartValue(nums: number[]): number {
  let runningSum = [nums[0]];
  for (let i = 1; i < nums.length; i++) {
    runningSum[i] = runningSum[i - 1] + nums[i];
  }

  let lowest = 0;

  // 1. Need to find lowest number from the runningSum
  // 2. Answer will be (Math.abs(lowest number) + 1) if its <= 0 OR 0 if lowest number > 0

  for (let i = 0; i < nums.length; i++) {
    lowest = Math.min(lowest, runningSum[i]);
  }

  if (lowest <= 0) {
    return Math.abs(lowest) + 1;
  } else {
    return 0;
  }
}
// console.log(minStartValue([-3, 2, -3, 4, 2]));

/*
  You are given a 0-indexed array nums of n integers, and an integer k.
  The k-radius average for a subarray of nums centered at some index i with the radius k is the average of all elements in nums between the indices i - k and i + k (inclusive). If there are less than k elements before or after the index i, then the k-radius average is -1.
  Build and return an array avgs of length n where avgs[i] is the k-radius average for the subarray centered at index i.
  The average of x elements is the sum of the x elements divided by x, using integer division. The integer division truncates toward zero, which means losing its fractional part.
  For example, the average of four elements 2, 3, 1, and 5 is (2 + 3 + 1 + 5) / 4 = 11 / 4 = 2.75, which truncates to 2.
*/
function getAverages(nums: number[], k: number): number[] {
  let runningSum = [nums[0]];
  for (let i = 1; i < nums.length; i++) {
    runningSum[i] = runningSum[i - 1] + nums[i];
  }

  let ans = [];

  for (let i = 0; i < nums.length; i++) {
    if (i - k < 0 || nums.length - 1 - i < k) {
      ans[i] = -1;
    } else {
      let total = runningSum[i + k] - (i - k > 0 ? runningSum[i - k - 1] : 0);
      ans[i] = Math.trunc(total / (2 * k + 1));
    }
  }
  return ans;
}
// console.log(getAverages([7, 4, 3, 9, 1, 8, 5, 2, 6], 3));

/*
  Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
  You may assume that each input would have exactly one solution, and you may not use the same element twice.
  You can return the answer in any order.
*/
function twoSum(nums: number[], target: number): number[] {
  const d = new Map();

  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];
    const complementary = target - num;
    if (d.has(complementary)) {
      return [i, d.get(complementary)];
    } else {
      d.set(num, i);
    }
  }
  return [];
}
// console.log(twoSum([2, 7, 11, 15], 9));

function countElements(arr: number[]): number {
  const m = new Map();
  let ans = 0;
  for (let i = 0; i < arr.length; i++) {
    const num = arr[i];
    m.set(num, num + 1);
  }

  console.log(m);

  for (let i = 0; i < arr.length; i++) {
    const num = arr[i] + 1;
    if (m.get(num)) {
      ans++;
    }
  }

  return ans;
}
// console.log(countElements([1, 2, 3]));

/*
  Given a 2D integer array nums where nums[i] is a non-empty array of distinct positive integers, return the list of
  integers that are present in each array of nums sorted in ascending order.
  Example 1:
  Input: nums = [[3,1,2,4,5],[1,2,3,4],[3,4,5,6]]
  Output: [3,4]
*/
function intersection(nums: number[][]): number[] {
  const m = new Map();

  nums.forEach((arr) => {
    arr.forEach((el) => {
      const occ = m.get(el);
      if (!occ) {
        m.set(el, 1);
      } else {
        m.set(el, occ + 1);
      }
    });
  });

  let ans: number[] = [];

  m.forEach((value, key) => {
    if (value === nums.length) {
      ans.push(key);
    }
  });

  return ans.sort((curr, next) => curr - next);
}
// console.log(
//   intersection([
//     [3, 1, 2, 4, 5],
//     [1, 2, 3, 4],
//     [3, 4, 5, 6],
//   ]),
// );

/*
  Given a string s, return true if s is a good string, or false otherwise.
  A string s is good if all the characters that appear in s have the same number of occurrences (i.e., the same frequency).
  Example 1:
  Input: s = "abacbc"
  Output: true
*/
function areOccurrencesEqual(s: string): boolean {
  const m = new Map();

  for (let i = 0; i < s.length; i++) {
    const v = m.get(s[i]);
    if (!v) {
      m.set(s[i], 1);
    } else {
      m.set(s[i], v + 1);
    }
  }

  //Check if all the values are the same
  return new Set([...m.values()]).size === 1;
}
// console.log(areOccurrencesEqual('abacbc'));

/*
  Given an array of integers nums and an integer k, return the total number of subarrays whose sum equals to k.
  A subarray is a contiguous non-empty sequence of elements within an array.
*/
// function subarraySum(nums: number[], k: number): number {
//   const counts = new Map();
//   counts.set(0, 1);
//   let curr = 0;
//   let ans = 0;

//   for (let i = 0; i < nums.length; i++) {
//     const num = nums[i];
//     curr += num % 2; // add 0 or 1

//     ans += counts.get(curr - k) || 0;
//     counts.set(curr, (counts.get(curr) || 0) + 1);
//   }

//   return ans;
// }
// console.log(subarraySum([1, 1, 1], 2));

/*
  You are given an integer array matches where matches[i] = [winneri, loseri] indicates that the player winneri
  defeated player loseri in a match.

  Return a list answer of size 2 where:

  answer[0] is a list of all players that have not lost any matches.
  answer[1] is a list of all players that have lost exactly one match.
  The values in the two lists should be returned in increasing order.
*/
function findWinners(matches: number[][]): number[][] {
  const lost = new Map(); /* (id:loss-count) */
  const winnersIds: Set<number> = new Set();

  for (let i = 0; i < matches.length; i++) {
    const outcome = matches[i];

    const winId = outcome[0];
    const lostId = outcome[1];

    lost.set(lostId, (lost.get(lostId) || 0) + 1);

    winnersIds.add(winId);
  }

  // Remove any players that lost anything different than one match.
  lost.forEach((value, key) => {
    winnersIds.delete(key);
    if (value !== 1) {
      lost.delete(key);
    }
  });
  return [Array.from(winnersIds).sort((a, b) => a - b), Array.from(lost.keys()).sort((a, b) => a - b)];
}
// console.log(
//   findWinners([
//     [1, 3],
//     [2, 3],
//     [3, 6],
//     [5, 6],
//     [5, 7],
//     [4, 5],
//     [4, 8],
//     [4, 9],
//     [10, 4],
//     [10, 9],
//   ]),
// );

/* 
  Given an integer array nums, return the largest integer that only occurs once. If no integer occurs once, return -1.
*/
function largestUniqueNumber(nums: number[]): number {
  const occurrences = new Map();

  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];
    occurrences.set(num, (occurrences.get(num) || 0) + 1);
  }

  const once = Array.from(occurrences.entries()).filter((arr) => {
    return arr[1] === 1;
  });

  if (once.length === 0) {
    return -1;
  }

  return once.map((arr) => arr[0]).sort((a, b) => b - a)[0];
}
// console.log(largestUniqueNumber([5, 7, 3, 9, 4, 9, 8, 3, 1]));

/*
  Given a string text, you want to use the characters of text to form as many instances of the word "balloon" as possible.
  You can use each character in text at most once. Return the maximum number of instances that can be formed.
*/
function maxNumberOfBalloons(text: string): number {
  const occurrences = new Map();
  const needs = new Map();

  const targetWord = 'balloon';

  for (let i = 0; i < targetWord.length; i++) {
    const letter = targetWord[i];
    needs.set(letter, (needs.get(letter) || 0) + 1);
  }

  const target = new Set(targetWord);
  for (let i = 0; i < text.length; i++) {
    const letter = text[i];
    if (target.has(letter)) {
      occurrences.set(letter, (occurrences.get(letter) || 0) + 1);
    }
  }

  let ans = [];

  const n = Array.from(target);
  for (let i = 0; i < n.length; i++) {
    const letter = n[i];
    const occAmount = occurrences.get(letter) || 0;
    const needAmount = needs.get(letter);
    const final = Math.floor(occAmount / needAmount);
    ans[i] = final;
  }

  return ans.sort((a, b) => a - b)[0];
}
console.log(maxNumberOfBalloons('loonbalxballpoon'));
