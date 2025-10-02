import json
import os
import shutil
import subprocess

from pydantic import BaseModel


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


class InsertSQLGenerator:
    base_dir = os.path.dirname(os.path.realpath(__file__))
    solutions_output_dir = os.path.join(base_dir, "solutions", "output")
    inputs_dir = os.path.join(base_dir, "inputs")
    outputs_dir = os.path.join(base_dir, "outputs")
    sql_dir = os.path.join(base_dir, "sql")
    questions_jsonl_file_path = os.path.join(base_dir, "questions.jsonl")

    def _get_formatted_filename(self, title: str):
        return title.strip().lower().replace(' ', '_')

    def generate_outputs(self):
        if not os.path.exists(self.outputs_dir):
            os.makedirs(self.outputs_dir, exist_ok=True)

        for title in os.listdir(self.solutions_output_dir):
            input_file_path = os.path.join(self.inputs_dir, f"{title}.in")
            input_file = open(input_file_path, "r")
            output_file_path = os.path.join(self.outputs_dir, f"{title}.out")
            output_file = open(output_file_path, "w")
            inputs = ""
            for input_line in input_file:
                if input_line != "\n":
                    inputs += input_line
                else:
                    solution_file_path = os.path.join(self.solutions_output_dir, title)
                    result = subprocess.run(
                        [solution_file_path], input=inputs, text=True, capture_output=True
                    )
                    output = result.stdout
                    if result.stderr:
                        print(result.stderr)
                    output_file.write(output)
                    inputs = ""
            input_file.close()
            output_file.close()

    def clean_existing_outputs(self):
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

        dir_to_be_cleaned = [self.sql_dir, self.outputs_dir, self.solutions_output_dir]
        for dir in dir_to_be_cleaned:
            _clear_folder(dir)

    def compile_all_solution_files(self):
        solutions_dir = os.path.join(self.base_dir, "solutions")
        subprocess.run(
            [os.path.join(solutions_dir, "compile_all.sh")],
            cwd=solutions_dir,
        )

    def convert_question_json_to_jsonl(self):
        input_file_path = os.path.join(self.base_dir, "questions.json")
        input_file = open(input_file_path, "r")
        questions = json.load(input_file)
        input_file.close()
        with open(self.questions_jsonl_file_path, "w") as f:
            for question in questions:
                f.write(json.dumps(question) + "\n")

    def _insert_question_sql(self, question: Question, index: int):
        output_insert_questions_sql_path = os.path.join(
            self.sql_dir, "3_insert_questions.sql"
        )
        with open(output_insert_questions_sql_path, "a") as f:
            f.write(
                f"""INSERT INTO questions(id, title, description, difficulty_id, input, output, constraints, examples, hints) VALUES ({index}, '{question.title}', '{question.description}', {question.difficulty_id}, '{question.input}', '{question.output}', ARRAY {question.constraints}::TEXT[], '{json.dumps([{"input": ex.input, "output": ex.output} for ex in question.examples])}', ARRAY {question.hints}::TEXT[]);\n"""
            )

    def _insert_test_cases_sql(self, question: Question, index: int):
        """
        To make sure that the output SQL statement is one-liner.

        see:
            https://github.com/CS3219-AY2526Sem1/cs3219-ay2526s1-project-g26/pull/23#discussion_r2396827203
        """
        def _format_sql_output_line(line):
            return line.strip().replace("\n", "\\n")

        formatted_title = self._get_formatted_filename(question.title)
        inputs_file_path = os.path.join(self.inputs_dir, f"{formatted_title}.in")
        outputs_file_path = os.path.join(self.outputs_dir, f"{formatted_title}.out")

        private_test_cases = []
        input = ""
        inputs_file = open(inputs_file_path, "r")
        outputs_file = open(outputs_file_path, "r")
        for input_line in inputs_file:
            if input_line == "\n":
                output = _format_sql_output_line(outputs_file.readline())
                input = _format_sql_output_line(input)
                private_test_cases.append(f"({index},E'{input}','{output}')")
                input = ""
            input += input_line

        inputs_file.close()
        outputs_file.close()

        public_test_cases = []
        for public_test_case in question.examples:
            output = _format_sql_output_line(public_test_case.output)
            input = _format_sql_output_line(public_test_case.input)
            public_test_cases.append(f"({index},E'{input}','{output}', FALSE)")

        output_insert_sql_path = os.path.join(self.sql_dir, "5_insert_test_cases.sql")
        with open(output_insert_sql_path, "a") as f:
            f.write(
                f"INSERT INTO test_cases(question_id, input, expected_output) VALUES {','.join(private_test_cases)};\n"
            )
            f.write(
                f"INSERT INTO test_cases(question_id, input, expected_output, is_hidden) VALUES {','.join(public_test_cases)};\n"
            )

    def _insert_question_categories_sql(self, question: Question, index: int):
        output_insert_question_categories_sql_path = os.path.join(self.sql_dir, "4_insert_question_categories.sql"
                                                                  )
        s = []
        for category_id in question.categories:
            s.append(f"({index},{category_id})")
        with open(output_insert_question_categories_sql_path, "a") as f:
            f.write(
                f"""INSERT INTO question_categories(question_id, category_id) VALUES {','.join(s)};\n"""
            )

    def generate_sql_scripts(self):
        if not os.path.exists(self.sql_dir):
            os.makedirs(self.sql_dir, exist_ok=True)
        questions_json_file = open(self.questions_jsonl_file_path, "r")
        index = 1
        for question_json_string in questions_json_file:
            question = Question.model_validate_json(question_json_string)
            self._insert_question_sql(question, index)
            self._insert_test_cases_sql(question, index)
            self._insert_question_categories_sql(question, index)
            index += 1
        questions_json_file.close()

    def run(self):
        self.clean_existing_outputs()
        self.compile_all_solution_files()
        self.convert_question_json_to_jsonl()
        self.generate_outputs()
        self.generate_sql_scripts()


if __name__ == "__main__":
    generator = InsertSQLGenerator()
    generator.run()
