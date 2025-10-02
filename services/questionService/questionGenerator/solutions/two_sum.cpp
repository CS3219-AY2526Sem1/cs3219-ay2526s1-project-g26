#include <vector>
#include <iostream>
#include <unordered_map>

using namespace std;

int main()
{
    int n, target;
    cin >> n >> target;

    int *nums = new int[n];
    unordered_map<int, vector<int>> um;

    for (int i = 0; i < n; i++)
    {
        cin >> nums[i];
        um[nums[i]].push_back(i);
    }

    for (int i = 0; i < n; i++)
    {
        if (um.find(target - nums[i]) != um.cend())
        {
            vector<int> &v = um[target - nums[i]];
            if (v[0] == i)
            {
                if (v.size() > 1)
                {
                    cout << i << " " << v[1] << endl;
                    return 0;
                }
            }
            else
            {
                cout << i << " " << v[0] << endl;
                return 0;
            }
        }
    }

    cout << -1 << " " << -1 << endl;
    return 0;
}
