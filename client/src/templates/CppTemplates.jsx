const CppTemplates = {
    '1': `// Two Sum
  #include <iostream>
  #include <vector>
  #include <unordered_map>
  using namespace std;
  
  class Solution {
  public:
      vector<int> twoSum(vector<int>& nums, int target) {
          // Write your code here
          return vector<int>();
      }
  };`,
  
    '2': `// Add Two Numbers
  #include <iostream>
  using namespace std;
  
  struct ListNode {
      int val;
      ListNode *next;
      ListNode(int x) : val(x), next(NULL) {}
  };
  
  class Solution {
  public:
      ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
          // Write your code here
          return NULL;
      }
  };`,
  
    default: (title, functionSignature = '') => `// ${title}
  #include <iostream>
  #include <vector>
  using namespace std;
  
  // ${functionSignature}
  `
  };
  
  export default CppTemplates;
  