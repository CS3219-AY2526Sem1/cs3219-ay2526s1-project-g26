#include <iostream>
#include <vector>

using namespace std;

bool canJump(vector<int> &nums)
{
    if (nums.size() == 1)
        return true;
    vector<bool> can(nums.size());
    can[0] = true;

    for (int i = 0; i < nums.size(); i++)
    {
        if (!can[i])
        {
            continue;
        }
        if (nums[i] + i + 1 >= nums.size())
        {
            return true;
        }
        for (int j = i + 1; j < i + 1 + nums[i]; j++)
        {
            can[j] = true;
        }
    }

    return false;
}

int main()
{
    int n;
    cin >> n;
    vector<int> nums(n);

    for (int i = 0; i < n; i++)
    {
        cin >> nums[i];
    }

    if (canJump(nums))
    {
        cout << "YES" << endl;
    }
    else
    {
        cout << "NO" << endl;
    }

    return 0;
}
