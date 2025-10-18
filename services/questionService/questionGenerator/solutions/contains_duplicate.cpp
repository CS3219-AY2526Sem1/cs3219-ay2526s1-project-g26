#include <iostream>
#include <unordered_set>
#include <vector>

int main()
{
    // Speed up C++ I/O operations.
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(NULL);

    int n;
    std::cin >> n;

    // A hash set to store numbers we have already seen.
    // The average time complexity for insert and search is O(1).
    std::unordered_set<int> seen;
    int current_num;

    // Iterate through all the numbers in the input.
    for (int i = 0; i < n; ++i)
    {
        std::cin >> current_num;

        // Check if the current number is already in our set of seen numbers.
        // The .count() method is an efficient way to check for existence.
        if (seen.count(current_num))
        {
            // If it exists, we have found a duplicate.
            // Print "YES" and terminate the program.
            std::cout << "YES" << std::endl;
            return 0;
        }

        // If the number is not a duplicate, add it to our set of seen numbers.
        seen.insert(current_num);
    }

    // If the loop completes without finding any duplicates,
    // then all elements are distinct. Print "NO".
    std::cout << "NO" << std::endl;

    return 0;
}
