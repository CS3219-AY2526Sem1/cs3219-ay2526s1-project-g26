#include <algorithm>
#include <string>
#include <iostream>
#include <regex>

/**
 * Source: https://leetcode.com/problems/longest-palindromic-substring/solutions/4212564/beats-96-49-5-different-approaches-brute-force-eac-dp-ma-recursion/
 */
std::string longestPalindrome(std::string s)
{
    if (s.length() <= 1)
    {
        return s;
    }

    int maxLen = 1;
    std::string maxStr = s.substr(0, 1);
    s = "#" + std::regex_replace(s, std::regex(""), "#") + "#";
    std::vector<int> dp(s.length(), 0);
    int center = 0;
    int right = 0;

    for (int i = 0; i < s.length(); ++i)
    {
        if (i < right)
        {
            dp[i] = std::min(right - i, dp[2 * center - i]);
        }

        while (i - dp[i] - 1 >= 0 && i + dp[i] + 1 < s.length() && s[i - dp[i] - 1] == s[i + dp[i] + 1])
        {
            dp[i]++;
        }

        if (i + dp[i] > right)
        {
            center = i;
            right = i + dp[i];
        }

        if (dp[i] > maxLen)
        {
            maxLen = dp[i];
            maxStr = s.substr(i - dp[i], 2 * dp[i] + 1);
            maxStr.erase(std::remove(maxStr.begin(), maxStr.end(), '#'), maxStr.end());
        }
    }

    return maxStr;
}

int main()
{
    std::string s;
    std::cin >> s;
    std::string output = longestPalindrome(s);
    std::cout << output << std::endl;
    return 0;
}
