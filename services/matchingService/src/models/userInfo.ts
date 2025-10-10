type Difficulty = 'easy' | 'medium' | 'hard'

export interface UserInfo {
  id: string
  topics: string[]
  difficulty: Difficulty[]
}

// Returns UserInfo if given json data has the correct user fields
export function getUserInfo(data: any): UserInfo {
  if (
    typeof data.id === 'string' &&
    Array.isArray(data.topics) &&
    Array.isArray(data.difficulty)
  ) {
    const user: UserInfo = {
      id: data.id,
      topics: data.topics,
      difficulty: data.difficulty,
    }
    return user
  } else {
    throw new Error('Invalid user data')
  }
}
