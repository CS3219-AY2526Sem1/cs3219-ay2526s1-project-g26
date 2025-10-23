/* eslint-disable */

db = db.getSiblingDB('questions_db')

db.difficulties.drop()
db.categories.drop()
db.questions.drop()

db.createCollection('difficulties')
db.createCollection('categories')
db.createCollection('questions')

db.difficulties.insertMany([
  { level: 'Easy' },
  { level: 'Medium' },
  { level: 'Hard' },
])

db.categories.insertMany([
  {
    name: 'array',
    description: 'Problems involving array manipulation and operations',
  },
  {
    name: 'string',
    description: 'Problems related to string processing and manipulation',
  },
  {
    name: 'linked-list',
    description: 'Problems involving linked list data structures',
  },
  {
    name: 'tree',
    description: 'Tree data structure problems including BST and traversal',
  },
  {
    name: 'graph',
    description: 'Graph theory problems including traversal and algorithms',
  },
  { name: 'sorting', description: 'Problems focused on sorting algorithms' },
  {
    name: 'dynamic-programming',
    description: 'Dynamic programming and memoization problems',
  },
  {
    name: 'binary-search',
    description: 'Problems solved using binary search technique',
  },
  {
    name: 'hash-table',
    description: 'Problems utilizing hash tables and dictionaries',
  },
  { name: 'greedy', description: 'Greedy algorithm problems' },
])

const questions = JSON.parse(
  fs.readFileSync('/docker-entrypoint-initdb.d/questions_output.json', 'utf8')
)

if (questions && questions.length > 0) {
  db.questions.insertMany(questions)
  print(questions.length + ' questions have been successfully inserted.')
} else {
  print('No questions found in output.json or the file is empty.')
}

print('MongoDB initialization complete.')
