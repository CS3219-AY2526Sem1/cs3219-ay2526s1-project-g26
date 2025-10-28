#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(NULL);

    int n;
    std::cin >> n;

    std::vector<int> height(n);
    for (int i = 0; i < n; ++i) {
        std::cin >> height[i];
    }

    if (n < 2) {
        std::cout << 0 << std::endl;
        return 0;
    }

    int max_area = 0;
    int left = 0;
    int right = n - 1;

    while (left < right) {
        // The width of the container is the distance between the pointers
        int width = right - left;
        // The height of the container is limited by the shorter of the two lines
        int h = std::min(height[left], height[right]);
        
        // Calculate the area and update the maximum area if this one is larger
        max_area = std::max(max_area, width * h);

        // Move the pointer that points to the shorter line inward.
        // This is because moving the taller line's pointer inward can't possibly
        // increase the area, as the height would still be limited by the shorter line,
        // and the width would decrease.
        if (height[left] < height[right]) {
            left++;
        } else {
            right--;
        }
    }

    std::cout << max_area << std::endl;

    return 0;
}

