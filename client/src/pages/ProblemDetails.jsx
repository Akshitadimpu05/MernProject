import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUser } from '../redux/slices/userSlice';
import { auth } from "../auth/auth.js";
import { problems } from '../data/problems';
import TwoSum from "../components/problems/TwoSum";
import AddTwoNumbers from "../components/problems/AddTwoNumbers";

function ProblemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get user data from Redux store
  const { user, isAuthenticated, loading: userLoading } = useSelector(state => state.user);
  
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Fetch user data if authenticated but no user data
  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(getCurrentUser());
    }
  }, [isAuthenticated, user, dispatch]);
  
  useEffect(() => {
    const currentProblem = problems.find(p => p.id === id);
    if (currentProblem) {
      setProblem(currentProblem);
      // Set initial code template based on problem
      const initialCode = {
        '1': `// Two Sum
#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your code here
        unordered_map<int, int> map;
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (map.find(complement) != map.end()) {
                return {map[complement], i};
            }
            map[nums[i]] = i;
        }
        return {}; // No solution found
    }
};

int main() {
    Solution sol;
    vector<int> nums = {2, 7, 11, 15};
    int target = 9;
    vector<int> result = sol.twoSum(nums, target);
    for (int num : result) {
        cout << num << " ";
    }
    return 0;
}`,
        '2': `// Add Two Numbers
#include <iostream>
using namespace std;

struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(NULL) {}
};

class Solution {
public:
    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
        // Write your code here
        ListNode* dummyHead = new ListNode(0);
        ListNode* curr = dummyHead;
        int carry = 0;
        
        while (l1 != NULL || l2 != NULL) {
            int x = (l1 != NULL) ? l1->val : 0;
            int y = (l2 != NULL) ? l2->val : 0;
            int sum = carry + x + y;
            carry = sum / 10;
            
            curr->next = new ListNode(sum % 10);
            curr = curr->next;
            
            if (l1 != NULL) l1 = l1->next;
            if (l2 != NULL) l2 = l2->next;
        }
        
        if (carry > 0) {
            curr->next = new ListNode(carry);
        }
        
        return dummyHead->next;
    }
};

int main() {
    Solution sol;
    // Test case
    ListNode* l1 = new ListNode(2);
    l1->next = new ListNode(4);
    l1->next->next = new ListNode(3);
    
    ListNode* l2 = new ListNode(5);
    l2->next = new ListNode(6);
    l2->next->next = new ListNode(4);
    
    ListNode* result = sol.addTwoNumbers(l1, l2);
    while (result) {
        cout << result->val << " ";
        result = result->next;
    }
    return 0;
}`
      };
      
      setCode(initialCode[id] || `// ${currentProblem.title}
#include <iostream>
#include <vector>
using namespace std;
// Function signature:
// ${currentProblem.functionSignature || ''}
int main() {
    // Test code here
    return 0;
}`);
    } else {
      navigate('/problems');
    }
  }, [id, navigate]);

  const handleLogout = () => {
    auth.logout(() => navigate("/login"));
  };

  const handleRun = async () => {
    try {
      setLoading(true);
      setOutput("Running code...");
      
      const token = auth.getToken();
      
      const response = await fetch('http://localhost:5000/api/code/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code,
          language: 'cpp'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setOutput(data.output || 'No output');
      } else {
        setOutput(`Error: ${data.error || 'Something went wrong'}`);
      }
    } catch (error) {
      console.error('Error running code:', error);
      setOutput(`Error running code: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setOutput("Submitting solution...");
      
      const token = auth.getToken();
      
      console.log("Submitting solution for problem:", id);
      console.log("User:", user);
      
      const response = await fetch('http://localhost:5000/api/code/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          problemId: id,
          code,
          language: 'cpp'
        })
      });
      
      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);
      
      if (response.ok) {
        setOutput(data.output || 'Solution submitted successfully!');
      } else {
        setOutput(`Error: ${data.error || 'Submission failed'}`);
      }
    } catch (error) {
      console.error('Error submitting solution:', error);
      setOutput(`Error submitting solution: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!problem) return <div>Loading...</div>;
  
  // Map problem ID to its component
  const ProblemComponent = {
    '1': TwoSum,
    '2': AddTwoNumbers
  }[id];

  // If we don't have a specific component for this problem ID, return null or a default component
  if (!ProblemComponent) {
    return <div>Problem component not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{problem.title}</h1>
        <div className="flex items-center space-x-4">
          {user && (
            <span className="text-gray-700">
              Welcome, {user.username || user.name || 'User'}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Problem Description</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p>{problem.description}</p>
            <h3 className="mt-4 font-semibold">Example:</h3>
            <pre className="mt-2 bg-gray-200 p-4 rounded">{problem.example}</pre>
          </div>
        </div>
        <div>
          <ProblemComponent
            problem={problem} 
            code={code} 
            setCode={setCode} 
            output={output} 
            setOutput={setOutput}
            handleRun={handleRun}
            handleSubmit={handleSubmit}
          />
          {loading && <div className="mt-4 text-blue-600">Processing...</div>}
        </div>
      </div>
    </div>
  );
}

export default ProblemDetails;