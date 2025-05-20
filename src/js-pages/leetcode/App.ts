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
// console.log(maxNumberOfBalloons('loonbalxballpoon'));

/* 
  Given a binary array nums, return the maximum length of a contiguous subarray with an equal number of 0 and 1.
*/
function findMaxLength(nums: number[]): number {
  const map = new Map<number, number>();
  map.set(0, -1); // To handle cases where the entire prefix forms a valid subarray
  let maxLength = 0;
  let balance = 0;

  for (let i = 0; i < nums.length; i++) {
    balance += nums[i] === 1 ? 1 : -1;

    if (map.has(balance)) {
      maxLength = Math.max(maxLength, i - map.get(balance)!);
    } else {
      map.set(balance, i);
    }
  }

  return maxLength;
}

// console.log(findMaxLength([0, 1, 0]));

/*
  Given an array of strings strs, group the anagrams together. You can return the answer in any order.
*/
function groupAnagrams(strs: string[]): string[][] {
  const hash = new Map();
  for (let i = 0; i < strs.length; i++) {
    const word = strs[i];
    const wordSorted = word.split('').sort().join();

    const existingWords = hash.get(wordSorted);
    if (existingWords) {
      hash.set(wordSorted, [...existingWords, word]);
    } else {
      hash.set(wordSorted, [word]);
    }
  }
  return Array.from(hash.values());
}

// console.log(groupAnagrams(['eat', 'tea', 'tan', 'ate', 'nat', 'bat']));

/* 
You are given an integer array cards where cards[i] represents the value of the ith card. 
A pair of cards are matching if the cards have the same value.

Return the minimum number of consecutive cards you have to pick up to have a pair of matching cards 
among the picked cards. If it is impossible to have matching cards, return -1.
*/
function minimumCardPickup(cards: number[]): number {
  const occ = new Map();
  let ans = Infinity;

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    if (occ.has(card)) {
      ans = Math.min(ans, i - occ.get(card) + 1);
    }
    occ.set(card, i);
  }

  return ans === Infinity ? -1 : ans;
}

// console.log(minimumCardPickup([3, 4, 2, 3, 4, 7]));

/*
You are given a 0-indexed array nums consisting of positive integers. 
You can choose two indices i and j, such that i != j, and the sum of digits of the number nums[i] is equal to that of nums[j].

Return the maximum value of nums[i] + nums[j] that you can obtain over all possible indices i and j 
that satisfy the conditions. If no such pair of indices exists, return -1.
*/
function maximumSum(nums: number[]): number {
  const occur = new Map<number, number[]>();

  // Populate the map with numbers grouped by their digit sum
  for (const num of nums) {
    const digitSum = num
      .toString()
      .split('')
      .reduce((acc, curr) => acc + Number(curr), 0);

    if (!occur.has(digitSum)) {
      occur.set(digitSum, []);
    }
    occur.get(digitSum)!.push(num);
  }

  let maxValue = -1;

  // Iterate over the grouped numbers
  for (const numList of occur.values()) {
    if (numList.length > 1) {
      numList.sort((a, b) => b - a); // Sort in descending order
      maxValue = Math.max(maxValue, numList[0] + numList[1]); // Take top two
    }
  }

  return maxValue;
}
// console.log(maximumSum([18, 43, 36, 13, 7]));

/*
Given a 0-indexed n x n integer matrix grid, return the number of pairs (ri, cj) such that row ri and column cj are equal.

A row and column pair is considered equal if they contain the same elements in the same order (i.e., an equal array).
*/
function equalPairs(grid: number[][]): number {
  const map = new Map<string, number>();
  let count = 0;

  // Store row occurrences in a map
  for (let i = 0; i < grid.length; i++) {
    const key = grid[i].toString();
    map.set(key, (map.get(key) || 0) + 1);
  }

  // Count matching columns
  for (let i = 0; i < grid.length; i++) {
    const col = [];
    for (let j = 0; j < grid.length; j++) {
      col.push(grid[j][i]);
    }
    const key = col.toString();
    if (map.has(key)) {
      count += map.get(key)!; // Add the count of matching rows
    }
  }

  return count;
}
// console.log(
//   equalPairs([
//     [3, 2, 1],
//     [1, 7, 6],
//     [2, 7, 7],
//   ]),
// );

/*
Given two strings ransomNote and magazine, return true if ransomNote can be constructed by using the 
letters from magazine and false otherwise.

Each letter in magazine can only be used once in ransomNote.
*/

function canConstruct(ransomNote: string, magazine: string): boolean {
  const available = new Map();

  for (let i = 0; i < magazine.length; i++) {
    const letter = magazine[i];
    available.set(letter, (available.get(letter) || 0) + 1);
  }

  for (let i = 0; i < ransomNote.length; i++) {
    const letter = ransomNote[i];
    if (available.has(letter)) {
      const value = available.get(letter);
      if (value === 1) {
        available.delete(letter);
      } else {
        available.set(letter, value - 1);
      }
    } else {
      return false;
    }
  }

  return true;
}

// console.log(canConstruct('aa', 'aab'));

/*
You're given strings jewels representing the types of stones that are jewels, 
and stones representing the stones you have. Each character in stones is a type of stone you have. 
You want to know how many of the stones you have are also jewels.

Letters are case sensitive, so "a" is considered a different type of stone from "A".
*/
function numJewelsInStones(jewels: string, stones: string): number {
  const types = new Set(jewels);
  let res = 0;

  for (let i = 0; i < stones.length; i++) {
    const myStone = stones[i];
    if (types.has(myStone)) {
      res++;
    }
  }

  return res;
}

// console.log(numJewelsInStones('aA', 'aAAbbbb'));

/*
  Given a string s, find the length of the longest substring without duplicate characters.
*/

function lengthOfLongestSubstring(s: string): number {
  let charMap = new Map<string, number>();
  let maxLength = 0;
  let left = 0;

  for (let right = 0; right < s.length; right++) {
    const char = s[right];

    if (charMap.has(char) && charMap.get(char)! >= left) {
      left = charMap.get(char)! + 1; // Move left pointer past the last occurrence
    }

    charMap.set(char, right);
    maxLength = Math.max(maxLength, right - left + 1);
  }

  return maxLength;
}

// console.log(lengthOfLongestSubstring('abcabcbb'));

var deleteDuplicates = function (head: any) {
  let curr = head;

  while (curr && curr.next) {
    if (curr.val === curr.next.val) {
      // Skip the duplicate node
      curr.next = curr.next.next;
    } else {
      // Move to the next node only if no deletion happened
      curr = curr.next;
    }
  }

  return head;
};

class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}

/*
Given the head of a singly linked list and two integers left and right where left <= right, 
reverse the nodes of the list from position left to position right, and return the reversed list.
*/
var reverseBetween = function (head, left, right) {
  let ln = head;

  for (let i = 0; i < left - 1; i++) {
    ln = ln.next;
  }
  let rn = ln;
  for (let i = left; i < right; i++) {
    rn = rn.next;
  }

  return rn;
};

//Nodes

const t = new ListNode(5, null);
const s = new ListNode(4, t);
const r = new ListNode(3, s);
const i = new ListNode(2, r);
const f = new ListNode(1, i);

// console.log(reverseBetween(f, 2, 4));

/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function (s) {
  if (s.length === 1) return false;
  const stack = [];
  const options = new Map([
    ['{', '}'],
    ['[', ']'],
    ['(', ')'],
  ]);
  const closing = new Set(Array.from(options.values()));

  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    //Char is a closing one. Now we need to compare it with dict value
    if (closing.has(char)) {
      if (char !== options.get(stack.pop())) {
        return false;
      }
    } else {
      // Char is not closing one, so push it to the stack.
      stack.push(char);
    }
  }

  if (stack.length !== 0) return false;

  return true;
};
// console.log(isValid('()[]'));

/*
You are given a string s consisting of lowercase English letters. A duplicate removal 
consists of choosing two adjacent and equal letters and removing them.

We repeatedly make duplicate removals on s until we no longer can.

Return the final string after all such duplicate removals have been made. It can be proven that the answer is unique.
*/

var removeDuplicates = function (s) {
  const lifo: string[] = [];

  for (let i = 0; i < s.length; i++) {
    const letter = s[i];

    if (lifo[lifo.length - 1] === letter) {
      lifo.pop();
    } else {
      lifo.push(letter);
    }
  }

  return lifo.join('');
};

// console.log(removeDuplicates('azxxzy'));

/*
Given two strings s and t, return true if they are equal
when both are typed into empty text editors. '#' means a backspace character.

Note that after backspacing an empty text, the text will continue empty.
*/

var backspaceCompare = function (s, t) {
  const sWord = [];

  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    if (char === '#') {
      sWord.pop();
    } else {
      sWord.push(char);
    }
  }

  const tWord = [];

  for (let i = 0; i < t.length; i++) {
    const char = t[i];
    if (char === '#') {
      tWord.pop();
    } else {
      tWord.push(char);
    }
  }

  console.log(sWord, tWord);

  if (sWord.join('') === tWord.join('')) return true;

  return false;
};

// console.log(backspaceCompare('ab##', 'c#d#'));

/*
You are given an absolute path for a Unix-style file system, which always begins with 
a slash '/'. Your task is to transform this absolute path into its simplified canonical path.

The rules of a Unix-style file system are as follows:

A single period '.' represents the current directory.
A double period '..' represents the previous/parent directory.
Multiple consecutive slashes such as '//' and '///' are treated as a single slash '/'.
Any sequence of periods that does not match the rules above should be treated as a 
valid directory or file name. For example, '...' and '....' are valid directory or file names.
The simplified canonical path should follow these rules:

The path must start with a single slash '/'.
Directories within the path must be separated by exactly one slash '/'.
The path must not end with a slash '/', unless it is the root directory.
The path must not have any single or double periods ('.' and '..') used to denote current or parent directories.
Return the simplified canonical path.
*/
var simplifyPath = function (path) {
  const pathArr = path.split('/'); //Empty array is a slash;
  let result = [];

  for (let i = 0; i < pathArr.length; i++) {
    const v = pathArr[i];

    if (v === '..') {
      result.pop();
    } else if (v === '.' || v === '') {
      continue;
    } else {
      result.push(v);
    }
  }

  return '/' + result.join('/');
};

// console.log(simplifyPath('/home/user/Documents/../Pictures'));

var RecentCounter = function () {
  this.arr = [];
};

/**
 * @param {number} t
 * @return {number}
 */
RecentCounter.prototype.ping = function (t) {
  this.arr.push(t);

  while (this.arr[0] < t - 3000) this.arr.shift();

  return this.arr.length;
};

/**
 * Your RecentCounter object will be instantiated and called as such:
 */
// var obj = new RecentCounter();
// var param_1 = obj.ping('RecentCounter', 'ping', 'ping', 'ping', 'ping');

/*
Given an array of integers temperatures represents the daily temperatures, 
return an array answer such that answer[i] is the number of days you have to wait 
after the ith day to get a warmer temperature. If there is no future day for which this is possible, 
keep answer[i] == 0 instead.
 */
var dailyTemperatures = function (temperatures) {
  let stack = [];
  let answer = new Array(temperatures.length).fill(0);

  for (let i = 0; i < temperatures.length; i++) {
    while (stack.length && temperatures[stack[stack.length - 1]] < temperatures[i]) {
      let j = stack.pop();
      answer[j] = i - j;
    }

    stack.push(i);
  }

  return answer;
};

// console.log(dailyTemperatures([73, 74, 75, 71, 69, 72, 76, 73]));

class Animal {
  name = 'twojstary';

  speak() {
    console.log('Animal makes a sound');
  }
}

class Dog extends Animal {
  speak() {
    console.log('Dog barks', this.name);
  }

  x = () => {
    console.log('x called: ', this.name);
  };
}

const x = new Dog();
// x.x();

/*
The next greater element of some element x in an array is the first greater element that is to the right of x in the same array.

You are given two distinct 0-indexed integer arrays nums1 and nums2, where nums1 is a subset of nums2.

For each 0 <= i < nums1.length, find the index j such that nums1[i] == nums2[j] and determine the next greater element of nums2[j] in nums2. If there is no next greater element, then the answer for this query is -1.

Return an array ans of length nums1.length such that ans[i] is the next greater element as described above.

Example 1:

Input: nums1 = [4,1,2], nums2 = [1,3,4,2]
Output: [-1,3,-1]
Explanation: The next greater element for each value of nums1 is as follows:
- 4 is underlined in nums2 = [1,3,4,2]. There is no next greater element, so the answer is -1.
- 1 is underlined in nums2 = [1,3,4,2]. The next greater element is 3.
- 2 is underlined in nums2 = [1,3,4,2]. There is no next greater element, so the answer is -1.
*/

/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number[]}
 */
var nextGreaterElement = function (nums1, nums2) {
  const ans = nums1.map((el) => {
    const curr = nums2.findIndex((v) => v === el);

    if (curr === -1) return -1;

    let mv = -1;
    for (let j = curr; j < nums2.length; j++) {
      console.log(el, curr, j);
      if (nums2[j] > el) {
        mv = nums2[j];
        break;
      }
    }

    return mv;
  });

  return ans;
};

// console.log(nextGreaterElement([1, 3, 5, 2, 4], [6, 5, 4, 3, 2, 1, 7]));
// console.log(nextGreaterElement([4, 1, 2], [1, 3, 4, 2]));

/*
Given the root of a binary tree, return its maximum depth.

A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.
*/

/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number}
 */
// Recursive approach:
// var maxDepth = function (root) {
//   if (!root) return 0;
//   let lc = maxDepth(root.left);
//   let rc = maxDepth(root.right);

//   return Math.max(lc, rc) + 1;
// };

//Iterative approach:
/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number}
 */
// var maxDepth = function(root) {
//   if(!root) return 0;

//   const stack = [{node:root, depth:1}];
//   let ans = 1;
//   while(stack.length > 0){
//       const {node, depth} = stack.pop();
//       ans = Math.max(ans, depth)

//       if(node.left){
//           stack.push({node: node.left, depth: depth+1})
//       }

//       if(node.right){
//           stack.push({node: node.right, depth: depth+1})
//       }
//   }
//   return ans;
// };

/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @param {number} targetSum
 * @return {boolean}
 */

// var hasPathSum = function (root, targetSum) {
//   let dfs = (node, curr) => {
//     if (!node) {
//       return false;
//     }

//     // if both children are null, then the node is a leaf
//     if (!node.left && !node.right) {
//       return curr + node.val == targetSum;
//     }

//     curr += node.val;
//     let left = dfs(node.left, curr);
//     let right = dfs(node.right, curr);
//     return left || right;
//   };

//   return dfs(root, 0);
// };

/*
Given a binary tree root, a node X in the tree is named good if in the path from root to X there are no nodes with a value greater than X.

Return the number of good nodes in the binary tree.
*/

// var goodNodes = function (root) {
//   let ans = 0;
//   const dfs = (node, currMax) => {
//     if (!node) return;

//     if (node.val >= currMax) {
//       ans += 1;
//     }

//     currMax = Math.max(currMax, node.val);

//     dfs(node.left, currMax);
//     dfs(node.right, currMax);
//   };

//   dfs(root, root.val);

//   return ans;
// };

/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} p
 * @param {TreeNode} q
 * @return {boolean}
 */
var isSameTree = function (p, q) {
  if (!p && q) return false;
  if (!q && p) return false;
  if (!p && !q) return true;
  if (p.val !== q.val) return false;

  return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
};
