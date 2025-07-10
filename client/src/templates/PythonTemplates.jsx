const PythonTemplates = {
  '1': `# Two Sum
class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Write your code here
        return []

if __name__ == '__main__':
    solution = Solution()
    print(solution.twoSum([2, 7, 11, 15], 9))`,
  '2': `# Add Two Numbers
class ListNode:
    def __init__(self, x):
        self.val = x
        self.next = None

class Solution:
    def addTwoNumbers(self, l1: ListNode, l2: ListNode) -> ListNode:
        # Write your code here
        return None

if __name__ == '__main__':
    solution = Solution()
    l1 = ListNode(2)
    l1.next = ListNode(4)
    l1.next.next = ListNode(3)
    l2 = ListNode(5)
    l2.next = ListNode(6)
    l2.next.next = ListNode(4)
    result = solution.addTwoNumbers(l1, l2)
    while result:
        print(result.val, end=" ")
        result = result.next`,
  '3': `# Longest Substring Without Repeating Characters
class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        # Write your code here
        return 0

if __name__ == '__main__':
    solution = Solution()
    print(solution.lengthOfLongestSubstring("abcabcbb"))`,
  '4': `# Valid Anagram
class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        # Write your code here
        return False

if __name__ == '__main__':
    solution = Solution()
    print(solution.isAnagram("anagram", "nagaram"))`,
  '5': `# Reverse String
class Solution:
    def reverseString(self, s: List[str]) -> None:
        # Write your code here
        s.reverse()

if __name__ == '__main__':
    solution = Solution()
    s = list("hello")
    solution.reverseString(s)
    print([ "".join(s) ])`,  // correct output format

  '6': `# Valid Palindrome
class Solution:
    def isPalindrome(self, s: str) -> bool:
        # Write your code here
        return False

if __name__ == '__main__':
    solution = Solution()
    print(solution.isPalindrome("A man, a plan, a canal: Panama"))`,
  '7': `# Palindrome Number
class Solution:
    def isPalindrome(self, x: int) -> bool:
        # Write your code here
        return False

if __name__ == '__main__':
    solution = Solution()
    print(solution.isPalindrome(121))`,
  '8': `# Permutations
class Solution:
    def permute(self, nums: List[int]) -> List[List[int]]:
        # Write your code here
        return []

if __name__ == '__main__':
    solution = Solution()
    print(solution.permute([1, 2, 3]))`,
  default: (title, functionSignature = '') => `# ${title}
class Solution:
    ${functionSignature}

if __name__ == '__main__':
    solution = Solution()`
};
export default PythonTemplates;