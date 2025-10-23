#include <iostream>
#include <vector>

int main()
{
    // Speed up C++ I/O.
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(NULL);

    int n;
    std::cin >> n;

    if (n == 0)
    {
        return 0;
    }

    std::vector<int> nums(n);
    for (int i = 0; i < n; ++i)
    {
        std::cin >> nums[i];
    }

    // Use long long to avoid overflow issues with large products.
    std::vector<long long> answer(n);

    // --- First Pass: Calculate Prefix Products ---
    // The prefix product for an element at index `i` is the product of all elements before it.
    long long prefix_product = 1;
    for (int i = 0; i < n; ++i)
    {
        // answer[i] is first set to the product of all elements to its left.
        answer[i] = prefix_product;
        // Then, update the prefix product for the next element.
        prefix_product *= nums[i];
    }

    // --- Second Pass: Calculate Suffix Products and Final Result ---
    // The suffix product for an element at index `i` is the product of all elements after it.
    // We multiply the existing prefix product in `answer[i]` by the suffix product.
    long long suffix_product = 1;
    for (int i = n - 1; i >= 0; --i)
    {
        // Multiply the current answer (which holds the prefix product) by the suffix product.
        answer[i] *= suffix_product;
        // Then, update the suffix product for the next element (to the left).
        suffix_product *= nums[i];
    }

    // Print the final result array.
    for (int i = 0; i < n; ++i)
    {
        std::cout << answer[i] << (i == n - 1 ? "" : " ");
    }
    std::cout << std::endl;

    return 0;
}
