
#include <iostream>
#include <vector>
#include <string>
using namespace std;
// Reverse String
#include <iostream>
#include <string>
#include <vector>
using namespace std;

class Solution {
public:
    void reverseString(vector<char>& s) {
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
    Solution().reverseString(s);
    cout << "\"" << s << "\"" << endl;
    return 0;
}
