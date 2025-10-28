#include <iostream>
#include <vector>
#include <stack>
#include <algorithm>

int main() {
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(NULL);

    int n;
    std::cin >> n;

    std::vector<int> heights(n);
    for (int i = 0; i < n; ++i) {
        std::cin >> heights[i];
    }
    
    // Add a sentinel bar of height 0 to handle remaining bars in the stack.
    heights.push_back(0); 

    std::stack<int> s;
    int max_area = 0;

    for (int i = 0; i < heights.size(); ++i) {
        // Maintain a monotonic stack (increasing heights).
        // If the current bar is shorter than the bar at the top of the stack,
        // we can calculate the area for the bars in the stack.
        while (!s.empty() && heights[s.top()] >= heights[i]) {
            int h = heights[s.top()];
            s.pop();

            // The width is the distance from the current bar `i` to the
            // previous bar in the stack (or the beginning of the array).
            int w = s.empty() ? i : i - s.top() - 1;
            max_area = std::max(max_area, h * w);
        }
        // Push the current bar's index onto the stack.
        s.push(i);
    }

    std::cout << max_area << std::endl;

    return 0;
}

