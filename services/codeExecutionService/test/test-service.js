/**
 * Simple test script to verify the code execution service
 * Run with: node test/test-service.js
 */

const testCases = [
  {
    name: 'Python - Simple Addition',
    request: {
      questionId: 'test-python',
      language: 'python',
      codeText: `
n, target = map(int, input().split())
nums = list(map(int, input().split()))
for i in range(n):
    for j in range(i+1, n):
        if nums[i] + nums[j] == target:
            print(i, j)
            break
    else:
        continue
    break
`,
      isFullSubmission: false
    },
    expectedOutput: '0 1'
  },
  {
    name: 'JavaScript - Simple Addition',
    request: {
      questionId: 'test-js',
      language: 'javascript',
      codeText: `
const lines = [];
require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
}).on('line', (line) => {
  lines.push(line);
}).on('close', () => {
  const [n, target] = lines[0].split(' ').map(Number);
  const nums = lines[1].split(' ').map(Number);
  
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (nums[i] + nums[j] === target) {
        console.log(i, j);
        return;
      }
    }
  }
});
`,
      isFullSubmission: false
    },
    expectedOutput: '0 1'
  },
  {
    name: 'C++ - Simple Addition',
    request: {
      questionId: 'test-cpp',
      language: 'cpp',
      codeText: `
#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n, target;
    cin >> n >> target;
    
    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }
    
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (nums[i] + nums[j] == target) {
                cout << i << " " << j << endl;
                return 0;
            }
        }
    }
    
    return 0;
}
`,
      isFullSubmission: false
    },
    expectedOutput: '0 1'
  }
];

// Mock test cases that would come from question service
const mockTestCases = [
  {
    input: '4 9\\n2 7 11 15',
    output: '0 1',
    is_hidden: false
  },
  {
    input: '3 6\\n3 2 4',
    output: '1 2',
    is_hidden: false
  }
];

async function testService() {
  console.log('Testing Code Execution Service...');
  console.log('=====================================');
  
  const baseUrl = 'http://localhost:3004';
  
  try {
    // Test health endpoint
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthResponse.json();
    console.log('Health Check:', healthData.status);
    
    // Test languages endpoint
    const langResponse = await fetch(`${baseUrl}/api/languages`);
    const langData = await langResponse.json();
    console.log('Supported Languages:', langData.supported_languages);
    
    console.log('\\n--- Code Execution Tests ---');
    
    // Note: Since we don't have the question service integration yet,
    // these tests will return results based on empty test cases
    for (const testCase of testCases) {
      console.log(`\\nTesting: ${testCase.name}`);
      
      const response = await fetch(`${baseUrl}/api/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.request)
      });
      
      const result = await response.json();
      console.log('Result:', result);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
    console.log('\\nMake sure the service is running with: npm run dev');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testService();
}

module.exports = { testService, testCases, mockTestCases };