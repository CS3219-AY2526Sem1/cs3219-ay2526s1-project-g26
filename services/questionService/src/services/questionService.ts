import pool from '../database/index.js'
import { AppError } from '../utils/errors.js'
import { Question, CreateQuestionInput } from '../models/questionModel.js'
import { ensureArray } from '../utils'

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

export const getAllQuestions = async (
  limit: number,
  offset: number
): Promise<{ questions: Question[]; total: number }> => {
  const query = `
      SELECT q.id,
             q.title,
             q.description,
             d.level           AS difficulty,
             q.is_active,
             q.created_at,
             q.updated_at,
             ARRAY_AGG(c.name) AS categories
      FROM questions q
               JOIN difficulties d ON q.difficulty_id = d.id
               LEFT JOIN question_categories qc ON q.id = qc.question_id
               LEFT JOIN categories c ON qc.category_id = c.id
      GROUP BY q.id, d.level
      ORDER BY q.created_at DESC
      LIMIT $1 OFFSET $2
  `

  const countQuery = `SELECT COUNT(*)
                      FROM questions`

  const [result, countResult] = await Promise.all([
    pool.query(query, [limit, offset]),
    pool.query(countQuery),
  ])

  return {
    questions: result.rows,
    total: parseInt(countResult.rows[0].count, 10),
  }
}

export const updateQuestion = async (
  id: number,
  data: Partial<CreateQuestionInput>
): Promise<Question> => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const fields = []
    const values = []
    let idx = 1

    if (data.title) {
      fields.push(`title = $${idx++}`)
      values.push(data.title)
    }
    if (data.description) {
      fields.push(`description = $${idx++}`)
      values.push(data.description)
    }
    if (data.constraints) {
      fields.push(`constraints = $${idx++}`)
      values.push(ensureArray(data.constraints))
    }
    if (data.examples) {
      fields.push(`examples = $${idx++}`)
      values.push(JSON.stringify(ensureArray(data.examples)))
    }
    if (data.hints) {
      fields.push(`hints = $${idx++}`)
      values.push(ensureArray(data.hints))
    }
    if (data.input) {
      fields.push(`input = $${idx++}`)
      values.push(data.input)
    }
    if (data.output) {
      fields.push(`output = $${idx++}`)
      values.push(data.output)
    }
    if (data.is_active !== undefined) {
      fields.push(`is_active = $${idx++}`)
      values.push(data.is_active)
    }

    if (data.difficulty) {
      const diffRes = await client.query(
        'SELECT id FROM difficulties WHERE level = $1',
        [data.difficulty]
      )
      if (diffRes.rows.length === 0)
        throw new AppError(`Difficulty '${data.difficulty}' not found`, 400)
      const difficultyId = diffRes.rows[0].id
      fields.push(`difficulty_id = $${idx++}`)
      values.push(difficultyId)
    }

    if (fields.length === 0) throw new AppError('No fields to update', 400)

    values.push(id)
    const updateQuery = `
        UPDATE questions
        SET ${fields.join(', ')},
            updated_at = NOW()
        WHERE id = $${idx}
      RETURNING id, title, description, (SELECT level FROM difficulties WHERE id = difficulty_id) AS difficulty,
                constraints, examples, hints, is_active
    `
    const res = await client.query(updateQuery, values)
    if (res.rows.length === 0) throw new AppError('Question not found', 404)

    if (data.categories) {
      await client.query(
        'DELETE FROM question_categories WHERE question_id = $1',
        [id]
      )

      for (const categoryName of data.categories) {
        const catRes = await client.query(
          'SELECT id FROM categories WHERE name = $1',
          [categoryName]
        )
        if (catRes.rows.length === 0) continue
        const categoryId = catRes.rows[0].id

        await client.query(
          'INSERT INTO question_categories (question_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [id, categoryId]
        )
      }
    }

    await client.query('COMMIT')
    return res.rows[0]
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export const createQuestion = async (
  data: CreateQuestionInput
): Promise<Question> => {
  console.log(data)
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    data.categories = ensureArray(data.categories)
    data.examples = ensureArray(data.examples)
    data.hints = ensureArray(data.hints)
    data.constraints = ensureArray(data.constraints)

    const diffRes = await client.query(
      'SELECT id FROM difficulties WHERE level = $1;',
      [data.difficulty]
    )
    if (diffRes.rows.length === 0) {
      throw new AppError(`Difficulty '${data.difficulty}' not found`, 400)
    }
    const difficultyId = diffRes.rows[0].id

    const insertQuery = `
        INSERT INTO questions (title, description, difficulty_id, constraints, examples, hints, input, output,
                               is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, title, description, $10 AS difficulty, constraints, examples, hints, input, output, is_active
    `
    const values = [
      data.title,
      data.description,
      difficultyId,
      data.constraints ?? [],
      JSON.stringify(data.examples ?? []),
      data.hints ?? [],
      data.input,
      data.output,
      data.is_active ?? true,
      data.difficulty,
    ]
    const res = await client.query(insertQuery, values)
    const question = res.rows[0]

    if (data.categories?.length) {
      for (const categoryName of data.categories) {
        const catRes = await client.query(
          'SELECT id FROM categories WHERE name = $1',
          [categoryName]
        )
        if (catRes.rows.length === 0) continue
        const categoryId = catRes.rows[0].id
        await client.query(
          'INSERT INTO question_categories (question_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [question.id, categoryId]
        )
      }
    }

    await client.query('COMMIT')
    return question
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export const deleteQuestion = async (id: number): Promise<void> => {
  const res = await pool.query('DELETE FROM questions WHERE id = $1', [id])
  if (res.rowCount === 0) {
    throw new AppError('Question not found', 404)
  }
}
