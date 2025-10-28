#include <iostream>
#include <vector>

using namespace std;

/**
 * Source: https://leetcode.com/problems/trapping-rain-water/solutions/5126477/video-keep-max-height-on-the-both-side/
 */

int trap(vector<int> &height)
{
    int left = 0;
    int right = height.size() - 1;
    int leftMax = height[left];
    int rightMax = height[right];
    int water = 0;

    while (left < right)
    {
        if (leftMax < rightMax)
        {
            left++;
            leftMax = max(leftMax, height[left]);
            water += leftMax - height[left];
        }
        else
        {
            right--;
            rightMax = max(rightMax, height[right]);
            water += rightMax - height[right];
        }
    }

    return water;
}

int main()
{
    int n;
    cin >> n;
    vector<int> height(n);
    for (int i = 0; i < n; i++)
    {
        cin >> height[i];
    }
    int result = trap(height);
    cout << result << endl;
    return 0;
}