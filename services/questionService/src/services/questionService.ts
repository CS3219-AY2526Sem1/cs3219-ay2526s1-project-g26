import pool from '../database/index.js'
import { AppError } from '../utils/errors.js'
import { Question } from '../models/questionModel.js'

export const getMatchingQuestion = async (
  difficulty: string,
  categories: string
): Promise<Question> => {
  const categoriesArray = categories
    ? (categories as string).split(',').map((c) => c.trim())
    : []

  const query = `
      SELECT q.id, q.title, d.level AS difficulty, q.constraints, q.examples, q.hints
      FROM questions q
               JOIN difficulties d ON q.difficulty_id = d.id
               LEFT JOIN (SELECT qc.question_id, COUNT(*) AS match_count
                          FROM question_categories qc
                                   JOIN categories c ON qc.category_id = c.id
                          WHERE c.name = ANY ($2)
                          GROUP BY qc.question_id) matches ON q.id = matches.question_id
      WHERE d.level = $1
        AND q.is_active = true
      ORDER BY COALESCE(matches.match_count, 0) DESC, RANDOM()
      LIMIT 1
  `
  const values =
    categoriesArray.length > 0 ? [difficulty, categoriesArray] : [difficulty]
  const result = await pool.query(query, values)

  if (result.rows.length === 0) {
    throw new AppError('No matching question found', 404)
  }
  return result.rows[0]
}

export const getQuestionById = async (id: number): Promise<Question> => {
  const query = `
    SELECT 
      q.id, 
      q.title, 
      q.description, 
      d.level AS difficulty, 
      q.constraints, 
      q.examples, 
      q.hints, 
      q.input, 
      q.output,
      ARRAY_AGG(c.name) FILTER (WHERE c.name IS NOT NULL) AS categories
    FROM questions q
    JOIN difficulties d ON q.difficulty_id = d.id
    LEFT JOIN question_categories qc ON q.id = qc.question_id
    LEFT JOIN categories c ON qc.category_id = c.id
    WHERE q.id = $1 AND q.is_active = true
    GROUP BY q.id, q.title, q.description, d.level, q.constraints, q.examples, q.hints, q.input, q.output
  `
  const result = await pool.query(query, [id])
  
  if (result.rows.length === 0) {
    throw new AppError('Question not found', 404)
  }
  
  return result.rows[0]
}