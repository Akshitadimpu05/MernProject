# Reverse String
class Solution:
    def reverseString(self, s: str) -> str:
        return s[::-1]  # Using slicing to reverse the string

if __name__ == '__main__':
    solution = Solution()
    //s = "hello"
    result = solution.reverseString(s)
    print(result)  # Output: "olleh"


if __name__ == "__main__":
    sol = Solution()
    s = ["h", "e", "l", "l", "o"]
    sol.reverseString(s)
    print(["" + "".join(s) + ""])