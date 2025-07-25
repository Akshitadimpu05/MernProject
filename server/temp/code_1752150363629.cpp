
#include <iostream>
#include <vector>
#include <string>
using namespace std;
// Longest Substring Without Repeating Characters
class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        int n = s.length();
        int maxLength = 0;
        unordered_set<char> charSet;
        int left = 0;
        
        for (int right = 0; right < n; right++) {
            if (charSet.count(s[right]) == 0) {
                charSet.insert(s[right]);
                maxLength = max(maxLength, right - left + 1);
            } else {
                while (charSet.count(s[right])) {
                    charSet.erase(s[left]);
                    left++;
                }
                charSet.insert(s[right]);
            }
        }
        
        return maxLength;
    }
};
int main() {
    vector<string> v = {"\"abcabcbb\""};
    string s = v[0];
    cout << Solution().lengthOfLongestSubstring(s) << endl;
    return 0;
}
