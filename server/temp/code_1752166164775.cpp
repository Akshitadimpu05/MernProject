
#include <iostream>
#include <vector>
#include <string>
using namespace std;

// Add this helper to match our expected output format
string formatStringForOutput(const string& s) {
    return "["" + s + ""]";
}

// Reverse String
#include <iostream>
#include <string>
#include <vector>
using namespace std;

class Solution {
public:
    string reverseString(string s) {
        int left = 0, right = s.size() - 1;
        while (left < right) {
            swap(s[left], s[right]);
            left++;
            right--;
        }
    }
};


int main() {
    string s = "hello";
    string result = Solution().reverseString(s);
    cout << formatStringForOutput(result) << endl;
    return 0;
}
