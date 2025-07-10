import React from 'react';
import TwoSum from "./problems/TwoSum";
import AddTwoNumbers from "./problems/AddTwoNumbers";
import LongestSubstring from "./problems/LongestSubstring";
import ValidAnagram from "./problems/ValidAnagram";
import ReverseString from "./problems/ReverseString";
import ValidPalindrome from "./problems/ValidPalindrome";
import PalindromeNumber from "./problems/PalindromeNumber";
import Permutations from "./problems/Permutations";

const ProblemComponent = ({ problem, code, setCode }) => {
  const ProblemComponents = {
    '1': TwoSum,
    '2': AddTwoNumbers,
    '3': LongestSubstring,
    '4': ValidAnagram,
    '5': ReverseString,
    '6': ValidPalindrome,
    '7': PalindromeNumber,
    '8': Permutations
  };

  const Component = ProblemComponents[problem.id];

  if (!Component) return null;

  return <Component problem={problem} code={code} setCode={setCode} />;
};

export default ProblemComponent;
