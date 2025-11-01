#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <queue>
#include <limits>

// Definition for a binary tree node.
struct TreeNode
{
    long long val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(long long x) : val(x), left(nullptr), right(nullptr) {}
};

// Helper function to build a tree from level-order traversal string.
// "null" is used for empty nodes.
TreeNode *buildTree(const std::vector<std::string> &nodes)
{
    if (nodes.empty() || nodes[0] == "null")
    {
        return nullptr;
    }

    TreeNode *root = new TreeNode(std::stoll(nodes[0]));
    std::queue<TreeNode *> q;
    q.push(root);

    int i = 1;
    while (!q.empty() && i < nodes.size())
    {
        TreeNode *current = q.front();
        q.pop();

        // Process left child
        if (i < nodes.size() && nodes[i] != "null")
        {
            current->left = new TreeNode(std::stoll(nodes[i]));
            q.push(current->left);
        }
        i++;

        // Process right child
        if (i < nodes.size() && nodes[i] != "null")
        {
            current->right = new TreeNode(std::stoll(nodes[i]));
            q.push(current->right);
        }
        i++;
    }

    return root;
}

// Recursive function to validate the BST property.
// It checks if the node's value is within the valid range (min_val, max_val).
bool isValidBSTHelper(TreeNode *node, long long min_val, long long max_val)
{
    // An empty tree or leaf's child is a valid BST.
    if (!node)
    {
        return true;
    }

    // The current node's value must be strictly greater than min_val
    // and strictly less than max_val.
    if (node->val <= min_val || node->val >= max_val)
    {
        return false;
    }

    // Recursively check the left and right subtrees.
    // For the left subtree, the new maximum is the current node's value.
    // For the right subtree, the new minimum is the current node's value.
    return isValidBSTHelper(node->left, min_val, node->val) &&
           isValidBSTHelper(node->right, node->val, max_val);
}

// Main function to start the validation process.
bool isValidBST(TreeNode *root)
{
    // The initial range for the root is the entire range of long long.
    return isValidBSTHelper(root, std::numeric_limits<long long>::min(), std::numeric_limits<long long>::max());
}

int main()
{
    // Speed up C++ I/O.
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(NULL);

    int n;
    std::cin >> n;

    // Handle empty tree case
    if (n == 0)
    {
        std::cout << "YES" << std::endl;
        return 0;
    }

    // Read the entire line of tree nodes
    std::string line;
    std::getline(std::cin >> std::ws, line);
    std::stringstream ss(line);
    std::string node_str;
    std::vector<std::string> nodes;
    while (ss >> node_str)
    {
        nodes.push_back(node_str);
    }

    // Build the tree from the input
    TreeNode *root = buildTree(nodes);

    // Validate the tree and print the result
    if (isValidBST(root))
    {
        std::cout << "YES" << std::endl;
    }
    else
    {
        std::cout << "NO" << std::endl;
    }

    // Note: Memory for the tree is not deallocated, which is common in
    // competitive programming but would be required in a production environment.

    return 0;
}
