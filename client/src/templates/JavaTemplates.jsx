const JavaTemplates = {
    '1': `// Two Sum
  import java.util.*;
  
  class Solution {
      public int[] twoSum(int[] nums, int target) {
          // Write your code here
          return new int[0];
      }
  }`,
  
    '2': `// Add Two Numbers
  import java.util.*;
  
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
  
    default: (title, functionSignature = '') => `// ${title}
  import java.util.*;
  
  class Solution {
      // ${functionSignature}
  }`
  };
  
  export default JavaTemplates;
  