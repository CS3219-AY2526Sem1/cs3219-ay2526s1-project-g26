#include <iostream>
#include <string>
#include <vector>
#include <unordered_set>

int main() {
    // Speed up C++ I/O.
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(NULL);

    std::string s;
    std::cin >> s;

    int n;
    std::cin >> n;

    std::unordered_set<std::string> wordDict;
    for (int i = 0; i < n; ++i) {
        std::string word;
        std::cin >> word;
        wordDict.insert(word);
    }

    int len = s.length();
    // dp[i] is true if s[0...i-1] can be segmented.
    std::vector<bool> dp(len + 1, false);
    dp[0] = true; // Base case: an empty string can always be segmented.

    for (int i = 1; i <= len; ++i) {
        for (int j = 0; j < i; ++j) {
            // Check if the prefix s[0...j-1] can be segmented (dp[j])
            // AND if the remaining substring s[j...i-1] is in the dictionary.
            if (dp[j] && wordDict.count(s.substr(j, i - j))) {
                dp[i] = true;
                break; // Found a valid segmentation for s[0...i-1], move to next i.
            }
        }
    }

    if (dp[len]) {
        std::cout << "YES" << std::endl;
    } else {
        std::cout << "NO" << std::endl;
    }

    return 0;
}

