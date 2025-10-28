#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <algorithm>

int main() {
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(NULL);

    int n;
    std::cin >> n;

    std::unordered_map<std::string, std::vector<std::string>> anagram_groups;

    for (int i = 0; i < n; ++i) {
        std::string str;
        std::cin >> str;
        std::string key = str;
        std::sort(key.begin(), key.end());
        anagram_groups[key].push_back(str);
    }

    for (auto const& [key, val] : anagram_groups) {
        for (size_t i = 0; i < val.size(); ++i) {
            std::cout << val[i] << (i == val.size() - 1 ? "" : " ");
        }
        std::cout << std::endl;
    }

    return 0;
}

