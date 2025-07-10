
#include <iostream>
#include <vector>
#include <string>
using namespace std;
// Reverse String
  #include <iostream>
  #include <string>
  using namespace std;
  class Solution {
  public:
      void reverseString(vector<char>& s) {
        char[] chars = s.toCharArray();
        int left = 0, right = chars.length - 1;

        while (left < right) {
            char temp = chars[left];
            chars[left] = chars[right];
            chars[right] = temp;
            left++;
            right--;
        }

        return new String(chars);
      }
  };
int main() {
    string input = "hello";
    vector<char> s(input.begin(), input.end());
    Solution().reverseString(s);
    cout << "[\"";
    for (char c : s) {
        cout << c;
    }
    cout << "\"]" << endl;
    return 0;
}
