#include <iostream>
#include <vector>
#include <string>
#include <unordered_set>
#include <queue>

using namespace std;

/**
 * Source: https://leetcode.com/problems/number-of-islands/solutions/6744132/video-check-4-directions-bonus-solutions/
 */
class Solution
{
public:
    int numIslands(vector<vector<char>> &grid)
    {
        int islands = 0;
        int rows = grid.size();
        int cols = grid[0].size();
        unordered_set<string> visited;

        vector<pair<int, int>> directions = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

        for (int r = 0; r < rows; r++)
        {
            for (int c = 0; c < cols; c++)
            {
                if (grid[r][c] == '1' && visited.find(to_string(r) + "," + to_string(c)) == visited.end())
                {
                    islands++;
                    bfs(grid, r, c, visited, directions, rows, cols);
                }
            }
        }

        return islands;
    }

private:
    void bfs(vector<vector<char>> &grid, int r, int c, unordered_set<string> &visited, vector<pair<int, int>> &directions, int rows, int cols)
    {
        queue<pair<int, int>> q;
        visited.insert(to_string(r) + "," + to_string(c));
        q.push({r, c});

        while (!q.empty())
        {
            auto [row, col] = q.front();
            q.pop();

            for (auto [dr, dc] : directions)
            {
                int nr = row + dr;
                int nc = col + dc;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == '1' && visited.find(to_string(nr) + "," + to_string(nc)) == visited.end())
                {
                    q.push({nr, nc});
                    visited.insert(to_string(nr) + "," + to_string(nc));
                }
            }
        }
    }
};

int main()
{
    int m, n;
    cin >> m >> n;
    vector<vector<char>> grid(m, vector<char>(n));

    for (int i = 0; i < m; i++)
    {
        for (int j = 0; j < n; j++)
        {
            int e;
            cin >> e;
            if (e == 1)
            {
                grid[i][j] = '1';
            }
            else
            {
                grid[i][j] = '0';
            }
        }
    }

    Solution sol;
    int result = sol.numIslands(grid);
    cout << result << endl;
    return 0;
}