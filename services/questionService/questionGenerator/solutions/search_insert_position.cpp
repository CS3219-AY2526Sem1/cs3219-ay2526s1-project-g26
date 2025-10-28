#include <iostream>
#include <vector>

using namespace std;

int main()
{
    int n, target;
    cin >> n >> target;

    vector<int> nums(n);

    for (int i = 0; i < n; i++)
    {
        cin >> nums[i];
    }

    int left = 0;
    int right = nums.size() - 1;

    while (left <= right)
    {
        int mid = left + (right - left) / 2;

        if (nums[mid] == target)
        {
            cout << mid << endl;
            return 0;
        }
        else if (nums[mid] > target)
        {
            right = mid - 1;
        }
        else
        {
            left = mid + 1;
        }
    }

    cout << left << endl;
    return 0;
}
