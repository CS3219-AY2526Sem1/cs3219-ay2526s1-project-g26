#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(NULL);

    int n;
    std::cin >> n;

    std::vector<int> nums(n);
    for (int i = 0; i < n; ++i) {
        std::cin >> nums[i];
    }

    if (n == 0) return 0;
    if (n == 1) {
        std::cout << nums[0] << std::endl;
        return 0;
    }

    int left = 0, right = n - 1;

    // If the array is not rotated at all
    if (nums[right] > nums[left]) {
        std::cout << nums[0] << std::endl;
        return 0;
    }

    // Binary search to find the inflection point
    while (left < right) {
        int mid = left + (right - left) / 2;

        // The inflection point is where nums[i] > nums[i+1]
        if (nums[mid] > nums[mid + 1]) {
            std::cout << nums[mid + 1] << std::endl;
            return 0;
        }
        
        if (nums[mid - 1] > nums[mid]) {
            std::cout << nums[mid] << std::endl;
            return 0;
        }

        if (nums[mid] > nums[left]) {
            // We are in the larger part of the array, so min is to the right
            left = mid + 1;
        } else {
            // We are in the smaller part, so min is to the left (or is mid)
            right = mid - 1;
        }
    }
    
    std::cout << nums[left] << std::endl;

    return 0;
}

