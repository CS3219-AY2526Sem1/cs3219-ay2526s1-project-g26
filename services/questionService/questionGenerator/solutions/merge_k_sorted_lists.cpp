#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>

int main() {
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(NULL);

    int k;
    std::cin >> k;

    std::priority_queue<std::pair<int, std::pair<int, int>>, std::vector<std::pair<int, std::pair<int, int>>>, std::greater<std::pair<int, std::pair<int, int>>>> pq;
    std::vector<std::vector<int>> lists(k);

    for (int i = 0; i < k; ++i) {
        int n;
        std::cin >> n;
        lists[i].resize(n);
        for (int j = 0; j < n; ++j) {
            std::cin >> lists[i][j];
        }
        if (n > 0) {
            pq.push({lists[i][0], {i, 0}});
        }
    }

    std::vector<int> result;
    while (!pq.empty()) {
        auto top = pq.top();
        pq.pop();
        
        int val = top.first;
        int list_idx = top.second.first;
        int element_idx = top.second.second;

        result.push_back(val);

        if (element_idx + 1 < lists[list_idx].size()) {
            pq.push({lists[list_idx][element_idx + 1], {list_idx, element_idx + 1}});
        }
    }

    for (size_t i = 0; i < result.size(); ++i) {
        std::cout << result[i] << (i == result.size() - 1 ? "" : " ");
    }
    std::cout << std::endl;

    return 0;
}

