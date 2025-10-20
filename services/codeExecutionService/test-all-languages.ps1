# Multi-Language Code Execution Test Script
Write-Host "Testing Code Execution Service - All Languages" -ForegroundColor Green

# Using real Two Sum problem ID
$questionId = "68ecad71f7fd251842ce5f54"

# Fetch question information from questionService
try {
    $questionInfo = Invoke-RestMethod -Uri "http://localhost:4010/$questionId/execute" -Method Get
    
    Write-Host "`nProblem Information:"
    Write-Host "  ID: $questionId"
    Write-Host "  Title: $($questionInfo.question.title)"
} catch {
    Write-Host "Warning: Could not fetch question info"
    Write-Host "  ID: $questionId"
    Write-Host "  Title: Two Sum (fallback)"
}

# Function to test code execution
function Test-CodeExecution {
    param(
        [string]$Language,
        [string]$Code
    )
    
    Write-Host "`nTesting $Language..."
    
    $jsonBody = @{
        questionId = $questionId
        language = $Language.ToLower()
        codeText = $Code
        isFullSubmission = $false  # Run only public test cases
    } | ConvertTo-Json -Depth 3
    
    try {
        $result = Invoke-RestMethod -Uri "http://localhost:4040/api/execute" -Method Post -Body $jsonBody -ContentType "application/json"
        
        Write-Host "  Language: $Language"
        Write-Host "  Status: $($result.type)"
        
        # Try to get output from various sources
        $output = "No output"
        if ($result.testCaseResults -and $result.testCaseResults.Count -gt 0) {
            $firstTest = $result.testCaseResults[0]
            if ($firstTest.actualOutput) {
                $output = $firstTest.actualOutput
            } elseif ($firstTest.expectedOutput) {
                $output = "Expected: $($firstTest.expectedOutput)"
            }
        }
        
        if ($result.additionalInfo -and $output -eq "No output") {
            $output = $result.additionalInfo
        }
        
        Write-Host "  Output: $output"
        
        # Debug: show test case count
        if ($result.testCaseResults) {
            Write-Host "  Test Cases: $($result.testCaseResults.Count) cases, Passed: $(($result.testCaseResults | Where-Object { $_.passed }).Count)"
        }
        
    } catch {
        Write-Host "  Language: $Language"
        Write-Host "  Status: ERROR"
        if ($_.ErrorDetails) {
            try {
                $errorData = $_.ErrorDetails.Message | ConvertFrom-Json
                Write-Host "  Output: $($errorData.additionalInfo)"
            } catch {
                Write-Host "  Output: $($_.ErrorDetails.Message)"
            }
        } else {
            Write-Host "  Output: $($_.Exception.Message)"
        }
    }
}

# Python solution
$pythonCode = @'
# Read input
# n, target = map(int, input().split())
# nums = list(map(int, input().split()))

# # Find two numbers that sum to target
# found = False
# for i in range(n):
#     for j in range(i+1, n):
#         if nums[i] + nums[j] == target:
#             print(i, j)
#             found = True
#             break
#     if found:
#         break

# if not found:
print(-1, -1)
'@

# JavaScript/Node.js solution
$jsCode = @'
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let lines = [];
rl.on('line', (line) => {
    lines.push(line);
    if (lines.length === 2) {
        rl.close();
    }
});

rl.on('close', () => {
    const [n, target] = lines[0].split(' ').map(Number);
    const nums = lines[1].split(' ').map(Number);
    
    // Find two numbers that sum to target
    let found = false;
    for (let i = 0; i < n && !found; i++) {
        for (let j = i + 1; j < n; j++) {
            if (nums[i] + nums[j] === target) {
                console.log(i, j);
                found = true;
                break;
            }
        }
    }
    
    if (!found) {
        console.log(-1, -1);
    }
});
'@

# C++ solution
$cppCode = @'
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
    
    // Find two numbers that sum to target
    bool found = false;
    for (int i = 0; i < n && !found; i++) {
        for (int j = i + 1; j < n; j++) {
            if (nums[i] + nums[j] == target) {
                cout << i << " " << j << endl;
                found = true;
                break;
            }
        }
    }
    
    if (!found) {
        cout << -1 << " " << -1 << endl;
    }
    
    return 0;
}
'@

# Java solution
$javaCode = @'
import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        int n = scanner.nextInt();
        int target = scanner.nextInt();
        
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) {
            nums[i] = scanner.nextInt();
        }
        
        // Find two numbers that sum to target
        boolean found = false;
        for (int i = 0; i < n && !found; i++) {
            for (int j = i + 1; j < n; j++) {
                if (nums[i] + nums[j] == target) {
                    System.out.println(i + " " + j);
                    found = true;
                    break;
                }
            }
        }
        
        if (!found) {
            System.out.println(-1 + " " + -1);
        }
        
        scanner.close();
    }
}
'@

# Test all languages
Test-CodeExecution "Python" $pythonCode
Test-CodeExecution "JavaScript" $jsCode
Test-CodeExecution "C++" $cppCode
Test-CodeExecution "Java" $javaCode

Write-Host "`nAll Language Tests Completed!"