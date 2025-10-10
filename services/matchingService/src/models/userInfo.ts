type Difficulty = 'easy' | 'medium' | 'hard'

export interface UserInfo {
  id: string
  topics: string[]
  difficulty: Difficulty[]
}

// Returns UserInfo if given json data has the correct user fields
export function getUserInfo(data: unknown): UserInfo {
  // unknown forces you to check types
  if (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'topics' in data &&
    'difficulty' in data &&
    typeof (data as any).id === 'string' &&
    Array.isArray((data as any).topics) &&
    Array.isArray((data as any).difficulty)
  ) {
    return {
      id: (data as any).id,
      topics: (data as any).topics,
      difficulty: (data as any).difficulty,
    }
  }
  throw new Error('Invalid user data')
}
