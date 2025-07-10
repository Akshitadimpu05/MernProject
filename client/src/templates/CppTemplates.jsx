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
    '3': `// Longest Substring Without Repeating Characters
  #include <iostream>
  #include <string>
  #include <unordered_set>
  using namespace std;
  class Solution {
  public:
      int lengthOfLongestSubstring(string s) {
          // Write your code here
          return 0;
      }
  };`,
    '4': `// Valid Anagram
  #include <iostream>
  #include <string>
  #include <unordered_map>
  using namespace std;
  class Solution {
  public:
      bool isAnagram(string s, string t) {
          // Write your code here
          return false;
      }
  };`,
    '5': `// Reverse String
  #include <iostream>
  #include <string>
  using namespace std;
  class Solution {
  public:
      void reverseString(vector<char>& s) {
          // Write your code here
      }
  };`,
    '6': `// Valid Palindrome
  #include <iostream>
  #include <string>
  using namespace std;
  class Solution {
  public:
      bool isPalindrome(string s) {
          // Write your code here
          return false;
      }
  };`,
    '7': `// Palindrome Number
  #include <iostream>
  using namespace std;
  class Solution {
  public:
      bool isPalindrome(int x) {
          // Write your code here
          return false;
      }
  };`,
    '8': `// Permutations
  #include <iostream>
  #include <vector>
  using namespace std;
  class Solution {
  public:
      vector<vector<int>> permute(vector<int>& nums) {
          // Write your code here
          return vector<vector<int>>();
      }
  };`,
    default: (title, functionSignature = '') => `// ${title}
  #include <iostream>
  #include <vector>
  using namespace std;
  class Solution {
  public:
      ${functionSignature}
  };`
};
export default CppTemplates;