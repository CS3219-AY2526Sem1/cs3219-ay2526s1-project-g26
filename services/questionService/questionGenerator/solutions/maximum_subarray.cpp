#include <iostream>
#include <vector>
#include <algorithm>

int main()
{
    // Speed up C++ I/O.
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(NULL);

    int n;
    std::cin >> n;

    if (n == 0)
    {
        return 0;
    }

    std::vector<int> nums(n);
    for (int i = 0; i < n; ++i)
    {
        std::cin >> nums[i];
    }

    // This is the standard implementation of Kadane's Algorithm.
    // It correctly handles cases with all negative numbers.

    // max_so_far stores the maximum sum found anywhere in the array.
    // current_max stores the maximum sum of a subarray ending at the current position.
    int max_so_far = nums[0];
    int current_max = nums[0];

    // We start from the second element since the first is used for initialization.
    for (int i = 1; i < n; ++i)
    {
        // The maximum sum for a subarray ending at index `i` is either:
        // 1. The element at `i` itself (starting a new subarray).
        // 2. The element at `i` added to the previous best subarray (extending it).
        current_max = std::max(nums[i], current_max + nums[i]);

        // Check if the best subarray ending here is better than the overall best we've ever seen.
        max_so_far = std::max(max_so_far, current_max);
    }

    std::cout << max_so_far << std::endl;

    return 0;
}
