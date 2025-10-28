#include <iostream>
#include <vector>
#include <algorithm>
#include <limits>

int main() {
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(NULL);

    int n;
    std::cin >> n;

    if (n < 2) {
        std::cout << 0 << std::endl;
        return 0;
    }

    int min_price = std::numeric_limits<int>::max();
    int max_profit = 0;
    int price;

    for (int i = 0; i < n; ++i) {
        std::cin >> price;
        // Update the minimum price seen so far
        min_price = std::min(min_price, price);
        // Calculate potential profit if we sell today and update max_profit
        max_profit = std::max(max_profit, price - min_price);
    }

    std::cout << max_profit << std::endl;

    return 0;
}

