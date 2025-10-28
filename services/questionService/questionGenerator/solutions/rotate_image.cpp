#include <iostream>
#include <vector>
#include <algorithm>

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

    // Read the n x n matrix from input.
    std::vector<std::vector<int>> matrix(n, std::vector<int>(n));
    for (int i = 0; i < n; ++i)
    {
        for (int j = 0; j < n; ++j)
        {
            std::cin >> matrix[i][j];
        }
    }

    // To rotate the image 90 degrees clockwise in-place, we perform two steps:
    // 1. Transpose the matrix.
    // 2. Reverse each row of the transposed matrix.

    // Step 1: Transpose the matrix.
    // Swapping element at (i, j) with the element at (j, i).
    // We only need to iterate through the upper triangle of the matrix.
    for (int i = 0; i < n; ++i)
    {
        for (int j = i + 1; j < n; ++j)
        {
            std::swap(matrix[i][j], matrix[j][i]);
        }
    }

    // Step 2: Reverse each row.
    // We iterate through each row and use std::reverse to reverse its elements.
    for (int i = 0; i < n; ++i)
    {
        std::reverse(matrix[i].begin(), matrix[i].end());
    }

    // Print the final rotated matrix.
    for (int i = 0; i < n; ++i)
    {
        for (int j = 0; j < n; ++j)
        {
            std::cout << matrix[i][j] << (j == n - 1 ? "" : " ");
        }
        std::cout << std::endl;
    }

    return 0;
}
