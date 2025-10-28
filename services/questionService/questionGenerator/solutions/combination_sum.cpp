#include <iostream>
#include <vector>
#include <algorithm>

void findCombinations(const std::vector<int>& candidates, int target, std::vector<std::vector<int>>& result, std::vector<int>& combination, int begin) {
    if (target == 0) {
        result.push_back(combination);
        return;
    }

    for (int i = begin; i < candidates.size() && target >= candidates[i]; ++i) {
        combination.push_back(candidates[i]);
        // not i + 1 because we can reuse same elements
        findCombinations(candidates, target - candidates[i], result, combination, i);
        combination.pop_back();
    }
}

int main() {
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(NULL);

    int n, target;
    std::cin >> n >> target;

    std::vector<int> candidates(n);
    for (int i = 0; i < n; ++i) {
        std::cin >> candidates[i];
    }

    // Sorting helps to prune the search early
    std::sort(candidates.begin(), candidates.end());
    // Remove duplicates to handle them implicitly by the algorithm structure
    candidates.erase(std::unique(candidates.begin(), candidates.end()), candidates.end());


    std::vector<std::vector<int>> result;
    std::vector<int> combination;
    findCombinations(candidates, target, result, combination, 0);

    for (const auto& comb : result) {
        for (size_t i = 0; i < comb.size(); ++i) {
            std::cout << comb[i] << (i == comb.size() - 1 ? "" : " ");
        }
        std::cout << std::endl;
    }

    return 0;
}

