// Two Sum
  #include <iostream>
  #include <vector>
  #include <unordered_map>
  using namespace std;
  
  class Solution {
  public:
      vector<int> twoSum(vector<int>& nums, int target) {
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
    vector<int> nums = {[2,4,7,11]};
    int target = 9;
    vector<int> result = sol.twoSum(nums, target);
    for (int num : result) {
        cout << num << " ";
    }
    return 0;
}