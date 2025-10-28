#include <iostream>
#include <vector>

int main() {
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(NULL);

    int n;
    std::cin >> n;

    if (n <= 2) {
        std::cout << n << std::endl;
        return 0;
    }

    // This problem is a Fibonacci sequence.
    // We can solve it with O(1) space complexity iteratively.
    int one_step_before = 2; // ways to reach step n-1
    int two_steps_before = 1; // ways to reach step n-2
    int all_ways = 0;

    for (int i = 3; i <= n; ++i) {
        all_ways = one_step_before + two_steps_before;
        two_steps_before = one_step_before;
        one_step_before = all_ways;
    }

    std::cout << all_ways << std::endl;

    return 0;
}

