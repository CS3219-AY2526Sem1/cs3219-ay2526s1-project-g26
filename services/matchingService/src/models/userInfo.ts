export type Difficulty = 'easy' | 'medium' | 'hard'

export interface UserInfo {
  id: string
  topics: string[]
  difficulty: Difficulty[]
}

// Returns UserInfo if given json data has the correct user fields
export function getUserInfo(data: unknown): UserInfo {
  if (
    typeof data === 'object' &&
    data !== null &&
    typeof (data as Record<string, unknown>).id === 'string' &&
    Array.isArray((data as Record<string, unknown>).topics) &&
    Array.isArray((data as Record<string, unknown>).difficulty)
  ) {
    const obj = data as Record<string, unknown>
    return {
      id: obj.id as string,
      topics: obj.topics as string[],
      difficulty: obj.difficulty as Difficulty[],
    }
  }
  throw new Error('Invalid user data')
}
