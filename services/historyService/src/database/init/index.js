/* eslint-disable */

db = db.getSiblingDB('history_db')

db.user_submissions.drop()
db.submissions.drop()

db.createCollection('user_submissions')
db.createCollection('submissions')

db.user_submissions.insertMany([
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


const submissions = JSON.parse(
  fs.readFileSync('/docker-entrypoint-initdb.d/submissions_output.json', 'utf8')
)

if (submissions && submissions.length > 0) {
  db.submissions.insertMany(submissions)
  print(submissions.length + ' submissions have been successfully inserted.')
} else {
  print('No submissions found in submissions_output.json or the file is empty.')
}

print('MongoDB initialization complete.')
