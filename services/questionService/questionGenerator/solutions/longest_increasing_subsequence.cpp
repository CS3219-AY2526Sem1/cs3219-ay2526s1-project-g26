#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    // Speed up C++ I/O.
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(NULL);

    int n;
    std::cin >> n;

    if (n == 0) {
        std::cout << 0 << std::endl;
        return 0;
    }

    std::vector<int> nums(n);
    for (int i = 0; i < n; ++i) {
        std::cin >> nums[i];
    }

    // This is the O(n log n) solution for LIS.
    // It maintains a sorted vector `tails` where `tails[i]` is the smallest
    // tail of all increasing subsequences of length `i+1`.
    std::vector<int> tails;
    
    for (int num : nums) {
        // Find the first element in `tails` that is not less than `num`.
        // This is the position where `num` can replace an existing tail to form
        // a potentially shorter but still valid increasing subsequence of the same length.
        auto it = std::lower_bound(tails.begin(), tails.end(), num);
        
        // If `it` is at the end, it means `num` is greater than all elements
        // in `tails`, so we can extend the longest subsequence found so far.
        if (it == tails.end()) {
            tails.push_back(num);
        } else {
            // Otherwise, `num` can replace the element at `it` to form an
            // increasing subsequence of the same length but with a smaller tail,
            // which might allow for longer subsequences later on.
            *it = num;
        }
    }

    std::cout << tails.size() << std::endl;

    return 0;
}

