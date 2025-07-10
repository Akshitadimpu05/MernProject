
#include <iostream>
#include <vector>
#include <string>
using namespace std;
// Valid Palindrome
#include <iostream>
#include <string>
#include <cctype>
using namespace std;

class Solution {
public:
    bool isPalindrome(string s) {
        int left = 0, right = s.length() - 1;

        while (left < right) {
            while (left < right && !isalnum(s[left])) left++;
            while (left < right && !isalnum(s[right])) right--;

            if (tolower(s[left]) != tolower(s[right])) {
                return false;
            }

            left++;
            right--;
        }

        return true;
    }
};

int main() {
    string s1 = "anagram";
    string s2 = "nagaram";
    cout << (Solution().isAnagram(s1, s2) ? "true" : "false") << endl;
    return 0;
}
