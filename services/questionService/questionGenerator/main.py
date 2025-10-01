import json
import os
import shutil
import subprocess

from pydantic import BaseModel

from test_case_output_generator import generate_outputs
from utils import convert_to_json_lines


class TestCase(BaseModel):
    input: str
    output: str


class Question(BaseModel):
    title: str
    input: str
    output: str
    description: str
    difficulty_id: int
    categories: list[int]
    examples: list[TestCase]
    constraints: list[str]
    hints: list[str]


base_dir = os.path.dirname(os.path.realpath(__file__))


def _insert_question_categories_sql(question: Question, index: int):
    output_insert_question_categories_sql_path = os.path.join(
        base_dir, "sql", "4_insert_question_categories.sql"
    )
    s = []
    for category_id in question.categories:
        s.append(f"({index},{category_id})")
    with open(output_insert_question_categories_sql_path, "a") as f:
        f.write(
            f"""INSERT INTO question_categories(question_id, category_id) VALUES {','.join(s)};\n"""
        )


def _insert_question_sql(question: Question, index: int):
    output_insert_questions_sql_path = os.path.join(
        base_dir, "sql", "3_insert_questions.sql"
    )
    with open(output_insert_questions_sql_path, "a") as f:
        f.write(
            f"""INSERT INTO questions(id, title, description, difficulty_id, input, output, constraints, examples, hints) VALUES ({index}, '{question.title}', '{question.description}', {question.difficulty_id}, '{question.input}', '{question.output}', ARRAY {question.constraints}::TEXT[], '{json.dumps([{"input": ex.input, "output": ex.output} for ex in question.examples])}', ARRAY {question.hints}::TEXT[]);\n"""
        )


def _insert_test_cases_sql(question: Question, index: int):
    inputs_dir = os.path.join(base_dir, "inputs")
    outputs_dir = os.path.join(base_dir, "outputs")

    formatted_title = question.title.lower().replace(" ", "_")
    inputs_file_path = os.path.join(inputs_dir, f"{formatted_title}.in")
    outputs_file_path = os.path.join(outputs_dir, f"{formatted_title}.out")

    inputs_file = open(inputs_file_path, "r")
    outputs_file = open(outputs_file_path, "r")

    input = ""
    private_test_cases = []
    for input_line in inputs_file:
        if input_line == "\n":
            output = outputs_file.readline().strip().replace("\n", "\\n")
            input = input.strip().replace("\n", "\\n")
            private_test_cases.append(f"({index},E'{input}','{output}')")
            input = ""
        input += input_line

    inputs_file.close()
    outputs_file.close()

    public_test_cases = []
    for public_test_case in question.examples:
        output = public_test_case.output.strip().replace("\n", "\\n")
        input = public_test_case.input.strip().replace("\n", "\\n")
        public_test_cases.append(f"({index},E'{input}','{output}', FALSE)")

    output_insert_sql_path = os.path.join(base_dir, "sql", "5_insert_test_cases.sql")
    with open(output_insert_sql_path, "a") as f:
        f.write(
            f"INSERT INTO test_cases(question_id, input, expected_output) VALUES {','.join(private_test_cases)};\n"
        )
        f.write(
            f"INSERT INTO test_cases(question_id, input, expected_output, is_hidden) VALUES {','.join(public_test_cases)};\n"
        )


def clean_up():
    def _clear_folder(folder_path):
        if os.path.exists(folder_path) and os.path.isdir(folder_path):
            for item in os.listdir(folder_path):
                item_path = os.path.join(folder_path, item)
                try:
                    if os.path.isfile(item_path) or os.path.islink(item_path):
                        os.remove(item_path)
                    elif os.path.isdir(item_path):
                        shutil.rmtree(item_path)
                except Exception as e:
                    print(e)

    sql_dir_path = os.path.join(base_dir, "sql")
    outputs_dir_path = os.path.join(base_dir, "outputs")
    solutions_outputs_dir_path = os.path.join(base_dir, "solutions", "output")
    dir_to_be_cleaned = [sql_dir_path, outputs_dir_path, solutions_outputs_dir_path]

    for dir in dir_to_be_cleaned:
        _clear_folder(dir)


if __name__ == "__main__":
    clean_up()
    subprocess.run(
        [os.path.join(base_dir, "solutions", "compile_all.sh")],
        cwd=os.path.join(base_dir, "solutions"),
    )
    convert_to_json_lines()
    generate_outputs()

    questions_json_file_path = os.path.join(base_dir, "questions.jsonl")

    if not os.path.exists(os.path.join(base_dir, "sql")):
        os.makedirs(os.path.join(base_dir, "sql"))

    questions_json_file = open(questions_json_file_path)
    index = 1
    for question_json_string in questions_json_file:
        question = Question.model_validate_json(question_json_string)
        _insert_question_sql(question, index)
        _insert_test_cases_sql(question, index)
        _insert_question_categories_sql(question, index)
        index += 1
    questions_json_file.close()
