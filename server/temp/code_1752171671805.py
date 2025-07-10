# Reverse String
class Solution:
    def reverseString(self, s: str) -> str:
        reversed_str = ""
        for char in s:
            reversed_str = char + reversed_str
        return reversed_str

if __name__ == '__main__':
    solution = Solution()
    result = solution.reverseString(s)

if __name__ == "__main__":
    sol = Solution()
    s = ["h", "e", "l", "l", "o"]
    sol.reverseString(s)
    print(["" + "".join(s) + ""])