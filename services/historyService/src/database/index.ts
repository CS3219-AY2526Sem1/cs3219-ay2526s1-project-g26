import { MongoClient, Db, ObjectId } from 'mongodb'
import { DATABASE_URL } from '../config'

// Unsure whether init/index.js is even running to begin with, so manually running it here
let db: Db

export const connectDB = async (): Promise<void> => {
  const client = new MongoClient(DATABASE_URL)
  await client.connect()
  db = client.db()
  
  console.log('Connected to MongoDB')

  setupDb(db) // manually setup the DB for now
}

export const getDb = (): Db => {
  if (!db) {
    throw new Error('Call connectDB before getDb')
  }
  return db
}

const setupDb = async (db: Db) => {
  db.dropCollection('submissions')
  db.dropCollection('user_submissions')
  db.createCollection('submissions')
  db.createCollection('user_submissions')
  db.collection('user_submissions').insertMany([
    { user_id: 'dc19156e-f669-448d-ae4b-b149fd8b627b', submission_id: '68f1ee58317cc52f4c0b6fe2' },
    { user_id: 'dc19156e-f669-448d-ae4b-b149fd8b627b', submission_id: '68f1eed1317cc52f4c0b6ff7' },
    { user_id: 'dc19156e-f669-448d-ae4b-b149fd8b627b', submission_id: '68f1eedb317cc52f4c0b6ffc' },
    { user_id: 'dc19156e-f669-448d-ae4b-b149fd8b627b', submission_id: '68f1eee6317cc52f4c0b6ffd' },
    { user_id: 'dc19156e-f669-448d-ae4b-b149fd8b627b', submission_id: '68f1eef0317cc52f4c0b6ffe' },
    { user_id: 'dc19156e-f669-448d-ae4b-b149fd8b627b', submission_id: '68f1ef0c317cc52f4c0b6fff' },
    { user_id: 'dc19156e-f669-448d-ae4b-b149fd8b627b', submission_id: '68f1ef18317cc52f4c0b7000' },
    { user_id: 'dc19156e-f669-448d-ae4b-b149fd8b627b', submission_id: '68f1ef20317cc52f4c0b7003' },
    { user_id: 'dc19156e-f669-448d-ae4b-b149fd8b627b', submission_id: '68f1ee58317cc52f4c0b6fe3' },
    { user_id: 'dc19156e-f669-448d-ae4b-b149fd8b627b', submission_id: '68f1eed1317cc52f4c0b6ff8' },
    { user_id: 'dc19156e-f669-448d-ae4b-b149fd8b627b', submission_id: '68f1eedb317cc52f4c0b6ffd' },
    { user_id: 'dc19156e-f669-448d-ae4b-b149fd8b627b', submission_id: '68f1eee6317cc52f4c0b6ffe' },
    { user_id: '1e284a66-4e22-4d97-8e49-375a357e48a2', submission_id: '68f1ee58317cc52f4c0b6fe2' },
    { user_id: '1e284a66-4e22-4d97-8e49-375a357e48a2', submission_id: '68f1eed1317cc52f4c0b6ff7' },
    { user_id: '1e284a66-4e22-4d97-8e49-375a357e48a2', submission_id: '68f1eedb317cc52f4c0b6ffc' },
    { user_id: '1e284a66-4e22-4d97-8e49-375a357e48a2', submission_id: '68f1eee6317cc52f4c0b6ffd' },
    { user_id: '1e284a66-4e22-4d97-8e49-375a357e48a2', submission_id: '68f1eef0317cc52f4c0b6ffe' },
    { user_id: '1e284a66-4e22-4d97-8e49-375a357e48a2', submission_id: '68f1ef0c317cc52f4c0b6fff' },
    { user_id: '1e284a66-4e22-4d97-8e49-375a357e48a2', submission_id: '68f1ef18317cc52f4c0b7000' },
    { user_id: '1e284a66-4e22-4d97-8e49-375a357e48a2', submission_id: '68f1ef20317cc52f4c0b7003' },
    { user_id: '1e284a66-4e22-4d97-8e49-375a357e48a2', submission_id: '68f1ee58317cc52f4c0b6fe3' },
    { user_id: '1e284a66-4e22-4d97-8e49-375a357e48a2', submission_id: '68f1eed1317cc52f4c0b6ff8' },
    { user_id: '1e284a66-4e22-4d97-8e49-375a357e48a2', submission_id: '68f1eedb317cc52f4c0b6ffd' },
    { user_id: '1e284a66-4e22-4d97-8e49-375a357e48a2', submission_id: '68f1eee6317cc52f4c0b6ffe' }
  ])
  db.collection('submissions').insertMany([
    {
      "_id": new ObjectId("68f1ee58317cc52f4c0b6fe2"),
      "question_title": "Two Sum",
      "code": "def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return [-1, -1]",
      "difficulty": "easy",
      "language": "python",
      "overall_result": {
        "result": "Accepted",
        "max_memory_used": 1024,
        "time_taken": 85
      },
      "test_case_results": [
        { "result": "Accepted", "max_memory_used": 512, "time_taken": 45 },
        { "result": "Accepted", "max_memory_used": 1024, "time_taken": 85 }
      ]
    },
    {
      "_id": new ObjectId("68f1eed1317cc52f4c0b6ff7"),
      "question_title": "Kth Largest Element in an Array",
      "code": "import heapq\n\ndef findKthLargest(nums, k):\n    # This approach is too slow for large inputs\n    for i in range(k):\n        max_idx = 0\n        for j in range(len(nums)):\n            if nums[j] > nums[max_idx]:\n                max_idx = j\n        if i == k - 1:\n            return nums[max_idx]\n        nums[max_idx] = float('-inf')\n    return -1",
      "difficulty": "medium",
      "language": "python",
      "overall_result": {
        "result": "Time Limit Exceeded",
        "max_memory_used": 2048,
        "time_taken": 3000
      },
      "test_case_results": [
        { "result": "Accepted", "max_memory_used": 1024, "time_taken": 200 },
        { "result": "Time Limit Exceeded", "max_memory_used": 2048, "time_taken": 3000 }
      ]
    },
    {
      "_id": new ObjectId("68f1eedb317cc52f4c0b6ffc"),
      "question_title": "Longest Palindrome Substring",
      "code": "class Solution {\npublic:\n    string longestPalindrome(string s) {\n        string result = \"\";\n        for (int i = 0; i < s.length(); i++) {\n            for (int j = i; j < s.length(); j++) {\n                string substr = s.substr(i, j - i + 1);\n                // Missing palindrome check implementation\n                if (substr.length() > result.length()) {\n                    result = substr;\n                }\n            }\n        }\n        return result;\n    }\n};",
      "difficulty": "medium",
      "language": "c++",
      "overall_result": {
        "result": "Wrong Answer",
        "max_memory_used": 1536,
        "time_taken": 450
      },
      "test_case_results": [
        { "result": "Accepted", "max_memory_used": 1024, "time_taken": 200 },
        { "result": "Wrong Answer", "max_memory_used": 1536, "time_taken": 450 }
      ]
    },
    {
      "_id": new ObjectId("68f1eee6317cc52f4c0b6ffd"),
      "question_title": "Search Insert Position",
      "code": "function searchInsert(nums, target) {\n    let left = 0;\n    let right = nums.length - 1;\n    \n    while (left <= right) {\n        let mid = Math.floor((left + right) / 2);\n        \n        if (nums[mid] === target) {\n            return mid;\n        } else if (nums[mid] < target) {\n            left = mid + 1;\n        } else {\n            right = mid - 1;\n        }\n    }\n    \n    return left;\n}",
      "difficulty": "easy",
      "language": "javascript",
      "overall_result": {
        "result": "Accepted",
        "max_memory_used": 512,
        "time_taken": 45
      },
      "test_case_results": [
        { "result": "Accepted", "max_memory_used": 256, "time_taken": 15 },
        { "result": "Accepted", "max_memory_used": 512, "time_taken": 45 }
      ]
    },
    {
      "_id": new ObjectId("68f1eef0317cc52f4c0b6ffe"),
      "question_title": "Jump Game",
      "code": "public boolean canJump(int[] nums) {\n    int maxReach = 0;\n    \n    for (int i = 0; i < nums.length; i++) {\n        if (i > maxReach) {\n            return false;\n        }\n        \n        maxReach = Math.max(maxReach, i + nums[i]);\n        \n        if (maxReach >= nums.length - 1) {\n            return true;\n        }\n    }\n    \n    return false;\n}",
      "difficulty": "medium",
      "language": "java",
      "overall_result": {
        "result": "Accepted",
        "max_memory_used": 1024,
        "time_taken": 125
      },
      "test_case_results": [
        { "result": "Accepted", "max_memory_used": 768, "time_taken": 80 },
        { "result": "Accepted", "max_memory_used": 1024, "time_taken": 125 }
      ]
    },
    {
      "_id": new ObjectId("68f1ef0c317cc52f4c0b6fff"),
      "question_title": "Number of islands",
      "code": "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        // Incomplete DFS implementation\n        int count = 0;\n        for (int i = 0; i < grid.size(); i++) {\n            for (int j = 0; j < grid[0].size(); j++) {\n                if (grid[i][j] == '1') {\n                    count++;\n                    // Missing DFS call to mark connected components\n                }\n            }\n        }\n        return count;\n    }\n};",
      "difficulty": "medium",
      "language": "c++",
      "overall_result": {
        "result": "Wrong Answer",
        "max_memory_used": 2048,
        "time_taken": 800
      },
      "test_case_results": [
        { "result": "Accepted", "max_memory_used": 1024, "time_taken": 300 },
        { "result": "Wrong Answer", "max_memory_used": 2048, "time_taken": 800 }
      ]
    },
    {
      "_id": new ObjectId("68f1ef18317cc52f4c0b7000"),
      "question_title": "Trapping Rain Water",
      "code": "def trap(height):\n    if not height:\n        return 0\n    \n    left, right = 0, len(height) - 1\n    left_max, right_max = 0, 0\n    water = 0\n    \n    while left < right:\n        if height[left] < height[right]:\n            if height[left] >= left_max:\n                left_max = height[left]\n            else:\n                water += left_max - height[left]\n            left += 1\n        else:\n            if height[right] >= right_max:\n                right_max = height[right]\n            else:\n                water += right_max - height[right]\n            right -= 1\n    \n    return water",
      "difficulty": "hard",
      "language": "python",
      "overall_result": {
        "result": "Accepted",
        "max_memory_used": 1536,
        "time_taken": 95
      },
      "test_case_results": [
        { "result": "Accepted", "max_memory_used": 1024, "time_taken": 65 },
        { "result": "Accepted", "max_memory_used": 1536, "time_taken": 95 }
      ]
    },
    {
      "_id": new ObjectId("68f1ef20317cc52f4c0b7003"),
      "question_title": "Exam Manipulation",
      "code": "function examManipulation(students) {\n    const n = students.length;\n    const k = students[0].length;\n    let maxMinScore = 0;\n    \n    // Try all possible answer keys (2^k possibilities)\n    for (let mask = 0; mask < (1 << k); mask++) {\n        let minScore = Infinity;\n        \n        for (let i = 0; i < n; i++) {\n            let score = 0;\n            for (let j = 0; j < k; j++) {\n                const studentAnswer = students[i][j] === 'T' ? 1 : 0;\n                const correctAnswer = (mask >> j) & 1;\n                if (studentAnswer === correctAnswer) {\n                    score++;\n                }\n            }\n            minScore = Math.min(minScore, score);\n        }\n        \n        maxMinScore = Math.max(maxMinScore, minScore);\n    }\n    \n    return maxMinScore;\n}",
      "difficulty": "medium",
      "language": "javascript",
      "overall_result": {
        "result": "Accepted",
        "max_memory_used": 768,
        "time_taken": 155
      },
      "test_case_results": [
        { "result": "Accepted", "max_memory_used": 512, "time_taken": 85 },
        { "result": "Accepted", "max_memory_used": 768, "time_taken": 155 }
      ]
    }
  ])
}