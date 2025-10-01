#include <iostream>
#include <bits/stdc++.h>

#define ll long long

using namespace std;

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int N, K;
    cin >> N >> K;

    vector<int> v;
    for (int i = 0; i < N; i++)
    {
        int num = 0;
        string s;
        cin >> s;
        for (int j = 0; j < K; j++)
        {
            num += s[j] == 'F' ? 0 : (1 << j);
        }
        v.push_back(num);
    }

    int highestLowScore = 0;
    for (int mask = 0; mask < (1 << K) + 1; mask++)
    {
        int currentLowest = INT_MAX;
        for (const int &num : v)
        {
            int count = 0;
            for (int i = 0; i < K; i++)
            {
                if (((1 << i) & num) == ((1 << i) & mask))
                {
                    count++;
                }
            }
            currentLowest = min(currentLowest, count);
        }
        highestLowScore = max(highestLowScore, currentLowest);
    }

    cout << highestLowScore << endl;

    return 0;
}
