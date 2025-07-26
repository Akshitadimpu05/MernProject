export const problems = [
  {
    id: '1',
    title: 'Two Sum',
    difficulty: 'Easy',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    example: 'Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].',
    constraints: '• 2 <= nums.length <= 10^4\n• -10^9 <= nums[i] <= 10^9\n• -10^9 <= target <= 10^9\n• Only one valid answer exists.',
    isPremium: false
  },
  {
    id: '2',
    title: 'Add Two Numbers',
    difficulty: 'Medium',
    description: 'You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.',
    example: 'Input: l1 = [2,4,3], l2 = [5,6,4]\nOutput: [7,0,8]\nExplanation: 342 + 465 = 807.',
    constraints: '• The number of nodes in each linked list is in the range [1, 100]\n• 0 <= Node.val <= 9\n• It is guaranteed that the list represents a number that does not have leading zeros.',
    isPremium: false
  },
  {
    id: '3',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    description: 'Given a string s, find the length of the longest substring without repeating characters.',
    example: 'Input: s = "abcabcbb"\nOutput: 3\nExplanation: The answer is "abc", with the length of 3.',
    constraints: '• 0 <= s.length <= 5 * 10^4\n• s consists of English letters, digits, symbols and spaces.',
    isPremium: false
  },
  {
    id: '4',
    title: 'Valid Anagram',
    difficulty: 'Easy',
    description: 'Given two strings s and t, return true if t is an anagram of s, and false otherwise.',
    example: 'Input: s = "anagram", t = "nagaram"\nOutput: true\nExplanation: Both strings contain the same characters with the same frequency.',
    constraints: '• 1 <= s.length, t.length <= 5 * 10^4\n• s and t consist of lowercase English letters.',
    isPremium: false
  },
  {
    id: '5',
    title: 'Reverse String',
    difficulty: 'Easy',
    description: 'Write a function that reverses a string. The input string is given as an array of characters s.',
    example: 'Input: s = ["h","e","l","l","o"]\nOutput: ["o","l","l","e","h"]',
    constraints: '• 1 <= s.length <= 10^5\n• s[i] is a printable ascii character\n• Do it in-place with O(1) extra memory.',
    isPremium: false
  },
  {
    id: '6',
    title: 'Valid Palindrome',
    difficulty: 'Easy',
    description: 'Given a string s, determine if it is a palindrome, considering only alphanumeric characters and ignoring cases.',
    example: 'Input: s = "A man, a plan, a canal: Panama"\nOutput: true\nExplanation: "amanaplanacanalpanama" is a palindrome.',
    constraints: '• 1 <= s.length <= 2 * 10^5\n• s consists only of printable ASCII characters\n• A palindrome reads the same backward as forward',
    isPremium: true
  },
  {
    id: '7',
    title: 'Palindrome Number',
    difficulty: 'Easy',
    description: 'Given an integer x, return true if x is a palindrome, and false otherwise.',
    example: 'Input: x = 121\nOutput: true\nExplanation: 121 reads as 121 from left to right and from right to left.',
    constraints: '• -2^31 <= x <= 2^31 - 1\n• Follow up: Could you solve it without converting the integer to a string?',
    isPremium: true
  },
  {
    id: '8',
    title: 'Permutations',
    difficulty: 'Medium',
    description: 'Given an array nums of distinct integers, return all the possible permutations. You can return the answer in any order.',
    example: 'Input: nums = [1,2,3]\nOutput: [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]',
    constraints: '• 1 <= nums.length <= 6\n• -10 <= nums[i] <= 10\n• All the integers of nums are unique.',
    isPremium: true
  }
];
