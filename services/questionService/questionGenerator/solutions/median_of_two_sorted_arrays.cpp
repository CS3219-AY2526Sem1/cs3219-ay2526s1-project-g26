#include <iostream>
#include <vector>
#include <algorithm>
#include <iomanip>

int main() {
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(NULL);

    int m, n;

    std::cin >> m;
    std::vector<int> nums1(m);
    for (int i = 0; i < m; ++i) std::cin >> nums1[i];

    std::cin >> n;
    std::vector<int> nums2(n);
    for (int i = 0; i < n; ++i) std::cin >> nums2[i];

    if (m > n) {
        std::swap(nums1, nums2);
        std::swap(m, n);
    }

    int iMin = 0, iMax = m, halfLen = (m + n + 1) / 2;
    while (iMin <= iMax) {
        int i = (iMin + iMax) / 2;
        int j = halfLen - i;
        if (i < iMax && nums2[j-1] > nums1[i]){
            iMin = i + 1;
        }
        else if (i > iMin && nums1[i-1] > nums2[j]) {
            iMax = i - 1;
        }
        else {
            int maxLeft = 0;
            if (i == 0) { maxLeft = nums2[j-1]; }
            else if (j == 0) { maxLeft = nums1[i-1]; }
            else { maxLeft = std::max(nums1[i-1], nums2[j-1]); }
            if ((m + n) % 2 == 1) {
                std::cout << std::fixed << std::setprecision(1) << (double)maxLeft << std::endl;
                return 0;
            }

            int minRight = 0;
            if (i == m) { minRight = nums2[j]; }
            else if (j == n) { minRight = nums1[i]; }
            else { minRight = std::min(nums2[j], nums1[i]); }

            std::cout << std::fixed << std::setprecision(1) << (maxLeft + minRight) / 2.0 << std::endl;
            return 0;
        }
    }

    return 0;
}

