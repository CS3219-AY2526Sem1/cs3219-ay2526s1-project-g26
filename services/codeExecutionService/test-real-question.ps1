# Test Code Execution Microservice - Using Real Question ID  
Write-Host "Testing Code Execution Service (Two Sum Problem) - Port 4040" -ForegroundColor Green

# Using real Two Sum problem ID
$questionId = "68ecad71f7fd251842ce5f54"

# Fetch question information from questionService
Write-Host "`nFetching problem information..." -ForegroundColor Cyan
try {
    $questionInfo = Invoke-RestMethod -Uri "http://localhost:4010/$questionId/execute" -Method Get
    
    Write-Host "`nProblem Information:" -ForegroundColor Cyan
    Write-Host "  ID: $questionId" -ForegroundColor Gray
    Write-Host "  Title: $($questionInfo.question.title)" -ForegroundColor Gray
    Write-Host "  Difficulty: $($questionInfo.question.difficulty)" -ForegroundColor Gray
    Write-Host "  Description: $($questionInfo.question.description.substring(0, 100))..." -ForegroundColor Gray
} catch {
    Write-Host "Warning: Could not fetch question info from questionService" -ForegroundColor Yellow
    Write-Host "  ID: $questionId" -ForegroundColor Gray
    Write-Host "  Using fallback info..." -ForegroundColor Gray
}

Write-Host "`nTesting Python Code Execution..." -ForegroundColor Yellow

# Python solution (Two Sum implementation)
$pythonCode = @'
# Read input
n, target = map(int, input().split())
nums = list(map(int, input().split()))

# Find two numbers that sum to target
found = False
for i in range(n):
    for j in range(i+1, n):
        if nums[i] + nums[j] == target:
            print(i, j)
            found = True
            break
    if found:
        break

if not found:
    print(-1, -1)
'@

# Create JSON request body
$jsonBody = @{
    questionId = $questionId
    language = "python"  
    codeText = $pythonCode
    isFullSubmission = $true  # Run only public test cases
} | ConvertTo-Json -Depth 3

Write-Host "Sending execution request..." -ForegroundColor Cyan

try {
    $result = Invoke-RestMethod -Uri "http://localhost:4040/api/execute" -Method Post -Body $jsonBody -ContentType "application/json"
    
    Write-Host "Code execution completed!" -ForegroundColor Green
    Write-Host "Execution Results:" -ForegroundColor Cyan
    Write-Host "Status: $($result.type)" -ForegroundColor $(if ($result.type -eq "PASSED") { "Green" } else { "Yellow" })
    
    if ($result.timeTaken) {
        Write-Host "  Execution Time: $($result.timeTaken) ms" -ForegroundColor Gray
    }
    
    if ($result.memoryUsage) {
        Write-Host "  Memory Usage: $($result.memoryUsage) MB" -ForegroundColor Gray
    }
    
    if ($result.testCaseResults) {
        Write-Host "Test Case Results:" -ForegroundColor Cyan
        for ($i = 0; $i -lt $result.testCaseResults.Count; $i++) {
            $testCase = $result.testCaseResults[$i]
            $status = if ($testCase.passed) { " PASSED" } else { " FAILED" }
            Write-Host "  Test Case $($i+1): $status" -ForegroundColor $(if ($testCase.passed) { "Green" } else { "Red" })
            
            if (-not $testCase.passed) {
                Write-Host "    Expected Output: $($testCase.expectedOutput)" -ForegroundColor Gray
                Write-Host "    Actual Output: $($testCase.actualOutput)" -ForegroundColor Gray
            }
        }
    }
    
    if ($result.additionalInfo) {
        Write-Host "Additional Information:" -ForegroundColor Yellow
        Write-Host "  $($result.additionalInfo)" -ForegroundColor White
    }
    
} catch {
    Write-Host "Request Failed:" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
    
    # Show detailed error information
    if ($_.ErrorDetails) {
        Write-Host "Detailed Error:" -ForegroundColor Yellow
        Write-Host "  $($_.ErrorDetails.Message)" -ForegroundColor White
    }
}
