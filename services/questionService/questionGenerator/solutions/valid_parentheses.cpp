#include <iostream>
#include <string>
#include <stack>
#include <unordered_map>

// This function checks if a given string of parentheses is valid.
bool isValid(const std::string& s) {
    std::stack<char> st;
    // Map closing brackets to their corresponding opening brackets.
    std::unordered_map<char, char> mappings = {
        {')', '('},
        {'}', '{'},
        {']', '['}
    };

    // Iterate through each character in the string.
    for (char c : s) {
        // If the character is a closing bracket...
        if (mappings.count(c)) {
            // If the stack is empty or the top element doesn't match, it's invalid.
            if (st.empty() || st.top() != mappings[c]) {
                return false;
            }
            // If it's a match, pop the opening bracket from the stack.
            st.pop();
        } else {
            // If it's an opening bracket, push it onto the stack.
            st.push(c);
        }
    }

    // If the stack is empty at the end, all brackets were correctly matched.
    return st.empty();
}

int main() {
    // Speed up C++ I/O.
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(NULL);

    std::string s;
    // Read the single line of input.
    std::cin >> s;

    if (isValid(s)) {
        std::cout << "YES" << std::endl;
    } else {
        std::cout << "NO" << std::endl;
    }

    return 0;
}
