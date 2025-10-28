#include <iostream>
#include <string>
#include <vector>
#include <queue>
#include <sstream>
#include <algorithm>

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

TreeNode* invertTree(TreeNode* root) {
    if (!root) return NULL;
    std::swap(root->left, root->right);
    invertTree(root->left);
    invertTree(root->right);
    return root;
}

void printTreeLevelOrder(TreeNode* root) {
    if (!root) return;
    std::queue<TreeNode*> q;
    q.push(root);
    std::vector<std::string> result;
    while (!q.empty()) {
        TreeNode* node = q.front();
        q.pop();
        if (node) {
            result.push_back(std::to_string(node->val));
            q.push(node->left);
            q.push(node->right);
        } else {
            // This part is tricky for perfect level order with "nulls"
            // For simplicity, we'll just print non-null nodes
        }
    }
    
    // A better print that respects nulls for structure
    if (!root) return;
    std::vector<std::string> output;
    std::queue<TreeNode*> q_print;
    q_print.push(root);
    while(!q_print.empty()){
        TreeNode* curr = q_print.front();
        q_print.pop();
        if(curr){
            output.push_back(std::to_string(curr->val));
            q_print.push(curr->left);
            q_print.push(curr->right);
        } else {
            // To avoid infinite nulls, we only add null if there are more levels
            // For this problem, let's just print the values.
        }
    }

    for (size_t i = 0; i < output.size(); ++i) {
        std::cout << output[i] << (i == output.size() - 1 ? "" : " ");
    }
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
    TreeNode* invertedRoot = invertTree(root);
    printTreeLevelOrder(invertedRoot);
    std::cout << std::endl;
    
    return 0;
}

