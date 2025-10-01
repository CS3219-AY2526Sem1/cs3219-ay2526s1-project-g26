#include <vector>
#include <iostream>

using namespace std;

/**
 * Source: https://leetcode.com/problems/kth-largest-element-in-an-array/solutions/6750670/video-4-solutions-with-sorting-heap-counting-sort-and-quick-select/
 */

int quickSelect(vector<int> &nums, int left, int right, int targetIdx)
{
    if (left == right)
    {
        return nums[left];
    }

    int pivot = nums[left];
    int low = left;
    int high = right;

    while (low <= high)
    {
        while (low <= high && nums[low] < pivot)
        {
            low++;
        }
        while (low <= high && nums[high] > pivot)
        {
            high--;
        }
        if (low <= high)
        {
            swap(nums[low], nums[high]);
            low++;
            high--;
        }
    }

    if (targetIdx <= high)
    {
        return quickSelect(nums, left, high, targetIdx);
    }
    else if (targetIdx >= low)
    {
        return quickSelect(nums, low, right, targetIdx);
    }
    else
    {
        return nums[targetIdx];
    }
}

int findKthLargest(vector<int> &nums, int k)
{
    int targetIdx = nums.size() - k;
    return quickSelect(nums, 0, nums.size() - 1, targetIdx);
}

int main()
{
    int n, k;
    cin >> n >> k;
    vector<int> nums(n);

    for (int i = 0; i < n; i++)
    {
        cin >> nums[i];
    }

    int result = findKthLargest(nums, k);
    cout << result << endl;

    return 0;
}