const PythonTemplates = {
    '1': `# Two Sum
  from typing import List
  
  class Solution:
      def twoSum(self, nums: List[int], target: int) -> List[int]:
          # Write your code here
          return []`,
  
    '2': `# Add Two Numbers
  from typing import Optional
  
  class ListNode:
      def __init__(self, val=0, next=None):
          self.val = val
          self.next = next
  
  class Solution:
      def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
          # Write your code here
          return None`,
  
    default: (title, functionSignature = '') => `# ${title}
  from typing import List
  
  class Solution:
      # ${functionSignature}`
  };
  
  export default PythonTemplates;
  