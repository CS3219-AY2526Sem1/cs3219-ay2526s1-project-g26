#include <iostream>
#include <vector>
#include <algorithm>

int main()
{
    // Speed up C++ I/O.
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(NULL);

    int n;      // number of coin denominations
    int amount; // the target amount
    std::cin >> n >> amount;

    std::vector<int> coins(n);
    for (int i = 0; i < n; ++i)
    {
        std::cin >> coins[i];
    }

    // This is a classic dynamic programming problem.
    // We create a DP table, `dp`, where `dp[i]` will store the minimum
    // number of coins needed to make an amount of `i`.

    // The size is `amount + 1` to handle amounts from 0 to `amount`.
    // We initialize all values to `amount + 1`, a value that is larger
    // than any possible valid answer, effectively representing infinity.
    std::vector<int> dp(amount + 1, amount + 1);

    // The base case: 0 coins are needed to make an amount of 0.
    dp[0] = 0;

    // Build the DP table from the bottom up.
    // Iterate through all amounts from 1 to the target amount.
    for (int i = 1; i <= amount; ++i)
    {
        // For each amount `i`, try every coin denomination.
        for (int coin : coins)
        {
            // If the current amount `i` is greater than or equal to the coin's value,
            // it's possible to use this coin.
            if (i - coin >= 0)
            {
                // The number of coins to make amount `i` would be 1 (the current coin)
                // plus the minimum coins needed for the remaining amount (`i - coin`).
                // We take the minimum of the current `dp[i]` and this new possibility.
                dp[i] = std::min(dp[i], dp[i - coin] + 1);
            }
        }
    }

    // After filling the table, `dp[amount]` holds our answer.
    // If `dp[amount]` is still `amount + 1`, it means we were never able to
    // find a combination of coins to make that amount.
    if (dp[amount] > amount)
    {
        std::cout << -1 << std::endl;
    }
    else
    {
        std::cout << dp[amount] << std::endl;
    }

    return 0;
}
