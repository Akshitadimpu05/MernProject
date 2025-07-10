const JavaTemplates = {
    '1': `// Two Sum
  class Solution {
      public int[] twoSum(int[] nums, int target) {
          // Write your code here
          return new int[0];
      }
  }`,
  
    '2': `// Add Two Numbers
  class ListNode {
      int val;
      ListNode next;
      ListNode(int x) { val = x; }
  }
  class Solution {
      public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
          // Write your code here
          return null;
      }
  }`,
    '3': `// Longest Substring Without Repeating Characters
  class Solution {
      public int lengthOfLongestSubstring(String s) {
          // Write your code here
          return 0;
      }
  }`,
    '4': `// Valid Anagram
  class Solution {
      public boolean isAnagram(String s, String t) {
          // Write your code here
          return false;
      }
  }`,
    '5': `// Reverse String
  class Solution {
      public void reverseString(char[] s){
          // Write your code here
          return;
      }
  }`,
    '6': `// Valid Palindrome
  class Solution {
      public boolean isPalindrome(String s) {
          // Write your code here
          return false;
      }
  }`,
    '7': `// Palindrome Number
  class Solution {
      public boolean isPalindrome(int x) {
          // Write your code here
          return false;
      }
  }`,
    '8': `// Permutations
  class Solution {
      public List<List<Integer>> permute(int[] nums) {
          // Write your code here
          return new ArrayList<>();
      }
  }`,
    default: (title, functionSignature = '') => `// ${title}
  class Solution {
      ${functionSignature}
  }`
};
export default JavaTemplates;