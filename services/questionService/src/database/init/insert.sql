INSERT INTO difficulties (level)
VALUES ('easy'),
       ('medium'),
       ('hard');

INSERT INTO categories (name, description)
VALUES ('array', 'Problems involving array manipulation and operations'),
       ('string', 'Problems related to string processing and manipulation'),
       ('linked-list', 'Problems involving linked list data structures'),
       ('tree', 'Tree data structure problems including BST and traversal'),
       ('graph', 'Graph theory problems including traversal and algorithms'),
       ('sorting', 'Problems focused on sorting algorithms'),
       ('dynamic-programming', 'Dynamic programming and memoization problems'),
       ('binary-search', 'Problems solved using binary search technique'),
       ('hash-table', 'Problems utilizing hash tables and dictionaries'),
       ('greedy', 'Greedy algorithm problems');

INSERT INTO questions (title, description, difficulty_id, constraints, examples, hints)
VALUES ('Two Sum',
        '## Problem Description\nGiven an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\n## Examples\n### Example 1:\n```\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].\n```\n\n### Example 2:\n```\nInput: nums = [3,2,4], target = 6\nOutput: [1,2]\n```\n\n## Constraints\n- 2 <= nums.length <= 10^4\n- -10^9 <= nums[i] <= 10^9\n- -10^9 <= target <= 10^9\n- Only one valid answer exists.',
        1, -- easy
        'You must implement a solution with better than O(n^2) time complexity.',
        '[
            {"input": {"nums": [2,7,11,15], "target": 9}, "output": [0,1]},
            {"input": {"nums": [3,2,4], "target": 6}, "output": [1,2]},
            {"input": {"nums": [3,3], "target": 6}, "output": [0,1]}
        ]',
        '{"Consider using a hash map to store numbers and their indices", "Think about what information you need to quickly find the complement"}'),
       ('Reverse Linked List',
        '## Problem Description\nGiven the head of a singly linked list, reverse the list and return the reversed head.\n\n## Examples\n### Example 1:\n```\nInput: head = [1,2,3,4,5]\nOutput: [5,4,3,2,1]\n```\n\n### Example 2:\n```\nInput: head = [1,2]\nOutput: [2,1]\n```\n\n### Example 3:\n```\nInput: head = []\nOutput: []\n```\n\n## Constraints\n- The number of nodes in the list is in the range [0, 5000].\n- -5000 <= Node.val <= 5000',
        1, -- easy
        'You must reverse the linked list in-place without using extra space.',
        '[
            {"input": {"head": [1,2,3,4,5]}, "output": [5,4,3,2,1]},
            {"input": {"head": [1,2]}, "output": [2,1]},
            {"input": {"head": []}, "output": []}
        ]',
        '{"Use three pointers: previous, current, and next", "Draw the reversal process step by step"}'),
       ('Binary Tree Level Order Traversal',
        '## Problem Description\nGiven the root of a binary tree, return the level order traversal of its nodes'' values. (i.e., from left to right, level by level).\n\n## Examples\n### Example 1:\n```\nInput: root = [3,9,20,null,null,15,7]\nOutput: [[3],[9,20],[15,7]]\n```\n\n### Example 2:\n```\nInput: root = [1]\nOutput: [[1]]\n```\n\n### Example 3:\n```\nInput: root = []\nOutput: []\n```\n\n## Constraints\n- The number of nodes in the tree is in the range [0, 2000].\n- -1000 <= Node.val <= 1000',
        2, -- medium
        'You must implement both iterative and recursive solutions.',
        '[
            {"input": {"root": [3,9,20,null,null,15,7]}, "output": [[3],[9,20],[15,7]]},
            {"input": {"root": [1]}, "output": [[1]]},
            {"input": {"root": []}, "output": []}
        ]',
        '{"Consider using a queue for BFS traversal", "Think about how to track level boundaries"}'),
       ('Longest Palindromic Substring',
        '## Problem Description\nGiven a string `s`, return the longest palindromic substring in `s`.\n\nA palindrome is a string that reads the same forward and backward.\n\n## Examples\n### Example 1:\n```\nInput: s = "babad"\nOutput: "bab"\nExplanation: "aba" is also a valid answer.\n```\n\n### Example 2:\n```\nInput: s = "cbbd"\nOutput: "bb"\n```\n\n## Constraints\n- 1 <= s.length <= 1000\n- `s` consist of only digits and English letters.',
        2, -- medium
        'Your solution should have O(n^2) time complexity or better.',
        '[
            {"input": {"s": "babad"}, "output": "bab"},
            {"input": {"s": "cbbd"}, "output": "bb"},
            {"input": {"s": "a"}, "output": "a"},
            {"input": {"s": "ac"}, "output": "a"}
        ]',
        '{"Consider expanding around center for each character", "Handle both odd and even length palindromes"}'),
       ('Merge Intervals',
        '## Problem Description\nGiven an array of intervals where `intervals[i] = [starti, endi]`, merge all overlapping intervals and return an array of the non-overlapping intervals that cover all the intervals in the input.\n\n## Examples\n### Example 1:\n```\nInput: intervals = [[1,3],[2,6],[8,10],[15,18]]\nOutput: [[1,6],[8,10],[15,18]]\nExplanation: Since intervals [1,3] and [2,6] overlap, merge them into [1,6].\n```\n\n### Example 2:\n```\nInput: intervals = [[1,4],[4,5]]\nOutput: [[1,5]]\nExplanation: Intervals [1,4] and [4,5] are considered overlapping.\n```\n\n## Constraints\n- 1 <= intervals.length <= 10^4\n- intervals[i].length == 2\n- 0 <= starti <= endi <= 10^4',
        2, -- medium
        'You must implement an efficient solution that handles large inputs.',
        '[
            {"input": {"intervals": [[1,3],[2,6],[8,10],[15,18]]}, "output": [[1,6],[8,10],[15,18]]},
            {"input": {"intervals": [[1,4],[4,5]]}, "output": [[1,5]]},
            {"input": {"intervals": [[1,4],[0,4]]}, "output": [[0,4]]}
        ]',
        '{"Sort the intervals by start time first", "Use a result list and merge as you iterate"}'),
       ('Regular Expression Matching',
        '## Problem Description\nGiven an input string `s` and a pattern `p`, implement regular expression matching with support for `''.''` and `''*''` where:\n\n- `''.''` Matches any single character.\n- `''*''` Matches zero or more of the preceding element.\n\nThe matching should cover the entire input string (not partial).\n\n## Examples\n### Example 1:\n```\nInput: s = "aa", p = "a"\nOutput: false\nExplanation: "a" does not match the entire string "aa".\n```\n\n### Example 2:\n```\nInput: s = "aa", p = "a*"\nOutput: true\nExplanation: ''*'' means zero or more of the preceding element, ''a''. Therefore, by repeating ''a'' once, it becomes "aa".\n```\n\n### Example 3:\n```\nInput: s = "ab", p = ".*"\nOutput: true\nExplanation: ".*" means "zero or more (*) of any character (.)".\n```\n\n## Constraints\n- 1 <= s.length <= 20\n- 1 <= p.length <= 30\n- `s` contains only lowercase English letters.\n- `p` contains only lowercase English letters, `''.''`, and `''*''`.\n- It is guaranteed for each appearance of the character `''*''`, there will be a previous valid character to match.',
        3, -- hard
        'You must implement a dynamic programming solution.',
        '[
            {"input": {"s": "aa", "p": "a"}, "output": false},
            {"input": {"s": "aa", "p": "a*"}, "output": true},
            {"input": {"s": "ab", "p": ".*"}, "output": true},
            {"input": {"s": "aab", "p": "c*a*b"}, "output": true}
        ]',
        '{"Use dynamic programming with a 2D table", "Consider different cases for * operator: zero occurrence or more occurrences"}');

INSERT INTO question_categories (question_id, category_id)
VALUES (1, 1),  -- Two Sum -> array
       (1, 10), -- Two Sum -> hash-table
       (2, 4),  -- Reverse Linked List -> linked-list
       (3, 5),  -- Binary Tree Level Order -> tree
       (4, 2),  -- Longest Palindromic -> string
       (4, 7),  -- Longest Palindromic -> dynamic-programming
       (5, 1),  -- Merge Intervals -> array
       (5, 9),  -- Merge Intervals -> sorting
       (6, 2),  -- Regular Expression -> string
       (6, 7);

INSERT INTO test_cases (question_id, input, expected_output, is_hidden, explanation)
VALUES
-- Two Sum test cases
(1, '{"nums": [2,7,11,15], "target": 9}', '[0,1]', false, 'Basic case with obvious solution'),
(1, '{"nums": [3,2,4], "target": 6}', '[1,2]', false, 'Solution not at beginning'),
(1, '{"nums": [3,3], "target": 6}', '[0,1]', false, 'Duplicate numbers'),
(1, '{"nums": [1,2,3,4,5,6,7,8,9,10], "target": 19}', '[8,9]', true, 'Large array test'),

-- Reverse Linked List test cases
(2, '{"head": [1,2,3,4,5]}', '[5,4,3,2,1]', false, 'Standard 5-node list'),
(2, '{"head": [1,2]}', '[2,1]', false, 'Two-node list'),
(2, '{"head": []}', '[]', false, 'Empty list'),
(2, '{"head": [1]}', '[1]', true, 'Single node list'),

-- Binary Tree Level Order test cases
(3, '{"root": [3,9,20,null,null,15,7]}', '[[3],[9,20],[15,7]]', false, 'Balanced tree'),
(3, '{"root": [1]}', '[[1]]', false, 'Single node'),
(3, '{"root": []}', '[]', false, 'Empty tree'),
(3, '{"root": [1,2,null,3,null,4,null]}', '[[1],[2],[3],[4]]', true, 'Unbalanced tree'),

-- Longest Palindromic test cases
(4, '{"s": "babad"}', '"bab"', false, 'Odd length palindrome'),
(4, '{"s": "cbbd"}', '"bb"', false, 'Even length palindrome'),
(4, '{"s": "a"}', '"a"', false, 'Single character'),
(4, '{"s": "abcde"}', '"a"', true, 'No palindrome longer than 1'),

-- Merge Intervals test cases
(5, '{"intervals": [[1,3],[2,6],[8,10],[15,18]]}', '[[1,6],[8,10],[15,18]]', false, 'Basic merging'),
(5, '{"intervals": [[1,4],[4,5]]}', '[[1,5]]', false, 'Adjacent intervals'),
(5, '{"intervals": [[1,4],[0,4]]}', '[[0,4]]', false, 'Overlapping intervals'),
(5, '{"intervals": [[1,4],[2,3]]}', '[[1,4]]', true, 'Complete overlap'),

-- Regular Expression test cases
(6, '{"s": "aa", "p": "a"}', 'false', false, 'Simple mismatch'),
(6, '{"s": "aa", "p": "a*"}', 'true', false, 'Star operator basic'),
(6, '{"s": "ab", "p": ".*"}', 'true', false, 'Dot star combination'),
(6, '{"s": "aab", "p": "c*a*b"}', 'true', true, 'Complex pattern with optional characters');