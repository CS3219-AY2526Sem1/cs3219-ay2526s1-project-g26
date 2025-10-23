#include <iostream>
#include <vector>
#include <queue>

int main() {
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(NULL);

    int numCourses, p;
    std::cin >> numCourses >> p;

    std::vector<std::vector<int>> adj(numCourses);
    std::vector<int> in_degree(numCourses, 0);

    for (int i = 0; i < p; ++i) {
        int course, prereq;
        std::cin >> course >> prereq;
        adj[prereq].push_back(course);
        in_degree[course]++;
    }

    std::queue<int> q;
    for (int i = 0; i < numCourses; ++i) {
        if (in_degree[i] == 0) {
            q.push(i);
        }
    }

    int count = 0;
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        count++;

        for (int v : adj[u]) {
            in_degree[v]--;
            if (in_degree[v] == 0) {
                q.push(v);
            }
        }
    }

    if (count == numCourses) {
        std::cout << "YES" << std::endl;
    } else {
        std::cout << "NO" << std::endl;
    }

    return 0;
}

