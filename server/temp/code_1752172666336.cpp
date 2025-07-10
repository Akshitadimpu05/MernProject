
#include <iostream>
#include <vector>
#include <string>
using namespace std;
# Reverse String
from typing import List

class Solution:
    def reverseString(self, s: List[str]) -> None:
        # Write your code here
        s.reverse()

if __name__ == '__main__':
    solution = Solution()
    s = list("hello")  # Converts string to list of characters
    solution.reverseString(s)
    print(["".join(s)])  # Output should be ["olleh"]

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
