
#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
using namespace std;
#include <iostream>
#include <string>
#include <unordered_map>
using namespace std;

class Solution {
public:
    bool isAnagram(string s, string t) {
        // If the lengths of the two strings are different, they can't be anagrams
        if (s.length() != t.length()) {
            return false;
        }

        unordered_map<char, int> charCount;

        // Count the frequency of characters in the first string
        for (char c : s) {
            charCount[c]++;
        }

        // Subtract the frequency of characters using the second string
        for (char c : t) {
            charCount[c]--;
            // If any character count becomes negative, the strings aren't anagrams
            if (charCount[c] < 0) {
                return false;
            }
        }

        // If all counts are zero, then they are anagrams
        return true;
    }
};

int main() {
    Solution solution;
    string s1 = "anagram";
    string s2 = "nagaram";
    cout << (solution.isAnagram(s1, s2) ? "True" : "False") << endl; // Output: True

    s1 = "rat";
    s2 = "car";
    cout << (solution.isAnagram(s1, s2) ? "True" : "False") << endl; // Output: False

    return 0;
}

int main() {
    string s = "anagram";
    string t = "nagaram";
    cout << (Solution().isAnagram(s, t) ? "true" : "false") << endl;
    return 0;
}
