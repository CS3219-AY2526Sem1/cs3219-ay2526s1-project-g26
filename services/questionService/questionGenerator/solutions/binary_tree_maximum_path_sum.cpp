#include <iostream>
#include <string>
#include <vector>
#include <queue>
#include <sstream>
#include <algorithm>
#include <limits>

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(NULL), right(NULL) {}
};

TreeNode* buildTree(const std::vector<std::string>& nodes) {
    if (nodes.empty() || nodes[0] == "null") return NULL;
    TreeNode* root = new TreeNode(std::stoi(nodes[0]));
    std::queue<TreeNode*> q;
    q.push(root);
    int i = 1;
    while (!q.empty() && i < nodes.size()) {
        TreeNode* curr = q.front();
        q.pop();
        if (i < nodes.size() && nodes[i] != "null") {
            curr->left = new TreeNode(std::stoi(nodes[i]));
            q.push(curr->left);
        }
        i++;
        if (i < nodes.size() && nodes[i] != "null") {
            curr->right = new TreeNode(std::stoi(nodes[i]));
            q.push(curr->right);
        }
        i++;
    }
    return root;
}

int maxPathDown(TreeNode* node, int& maxSum) {
    if (!node) return 0;
    int left = std::max(0, maxPathDown(node->left, maxSum));
    int right = std::max(0, maxPathDown(node->right, maxSum));
    maxSum = std::max(maxSum, left + right + node->val);
    return std::max(left, right) + node->val;
}

int main() {
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(NULL);

    int n;
    std::cin >> n;
    std::cin.ignore();
    
    std::string line;
    std::getline(std::cin, line);
    std::stringstream ss(line);
    std::vector<std::string> nodes;
    std::string node;
    while (ss >> node) {
        nodes.push_back(node);
    }
    
    TreeNode* root = buildTree(nodes);
    
    int maxSum = std::numeric_limits<int>::min();
    maxPathDown(root, maxSum);
    
    std::cout << maxSum << std::endl;
    
    return 0;
}

