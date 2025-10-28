#include <iostream>
#include <vector>
#include <algorithm>

int main()
{
    // Speed up C++ I/O.
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(NULL);

    int n, m;

    // Read the first list
    std::cin >> n;
    std::vector<int> list1(n);
    for (int i = 0; i < n; ++i)
    {
        std::cin >> list1[i];
    }

    // Read the second list
    std::cin >> m;
    std::vector<int> list2(m);
    for (int i = 0; i < m; ++i)
    {
        std::cin >> list2[i];
    }

    // Prepare the merged list and pointers for iteration
    std::vector<int> merged;
    int i = 0, j = 0;

    // Merge the two lists using the two-pointer technique
    while (i < n && j < m)
    {
        if (list1[i] <= list2[j])
        {
            merged.push_back(list1[i]);
            i++;
        }
        else
        {
            merged.push_back(list2[j]);
            j++;
        }
    }

    // Add any remaining elements from list1
    while (i < n)
    {
        merged.push_back(list1[i]);
        i++;
    }

    // Add any remaining elements from list2
    while (j < m)
    {
        merged.push_back(list2[j]);
        j++;
    }

    // Print the final merged list
    for (size_t k = 0; k < merged.size(); ++k)
    {
        std::cout << merged[k] << (k == merged.size() - 1 ? "" : " ");
    }
    std::cout << std::endl;

    return 0;
}
