import json
import os
import shutil
import subprocess
from typing import List

from pydantic import BaseModel


class TestCase(BaseModel):
    input: str
    output: str
    is_hidden: bool = False


class Question(BaseModel):
    title: str
    input: str
    output: str
    description: str
    difficulty: str
    categories: List[str]
    examples: List[TestCase]
    constraints: List[str]
    hints: List[str]
    test_cases: List[TestCase]


class InsertJSONGenerator:
    base_dir = os.path.dirname(os.path.realpath(__file__))
    solutions_output_dir = os.path.join(base_dir, "solutions", "output")
    inputs_dir = os.path.join(base_dir, "inputs")
    outputs_dir = os.path.join(base_dir, "outputs")
    questions_json_file_path = os.path.join(base_dir, "questions.json")
    output_json_file_path = os.path.join(base_dir, "questions_output.json")

    def _get_formatted_filename(self, title: str):
        return title.strip().lower().replace(" ", "_")

    def generate_outputs(self):
        if not os.path.exists(self.outputs_dir):
            os.makedirs(self.outputs_dir, exist_ok=True)

        for title in os.listdir(self.solutions_output_dir):
            input_file_path = os.path.join(self.inputs_dir, f"{title}.in")
            output_file_path = os.path.join(self.outputs_dir, f"{title}.out")

            with open(input_file_path, "r") as input_file, open(
                output_file_path, "w"
            ) as output_file:
                inputs = ""
                for input_line in input_file:
                    if input_line.strip() != "":
                        inputs += input_line
                    else:
                        solution_file_path = os.path.join(
                            self.solutions_output_dir, title
                        )
                        result = subprocess.run(
                            [solution_file_path],
                            input=inputs,
                            text=True,
                            capture_output=True,
                        )
                        output = result.stdout
                        if result.stderr:
                            print(title)
                            print(result.stderr)
                        output_file.write(output)
                        inputs = ""

                if inputs:
                    solution_file_path = os.path.join(self.solutions_output_dir, title)
                    result = subprocess.run(
                        [solution_file_path],
                        input=inputs,
                        text=True,
                        capture_output=True,
                    )
                    output = result.stdout
                    if result.stderr:
                        print(result.stderr)
                    output_file.write(output)

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

        dir_to_be_cleaned = [self.outputs_dir, self.solutions_output_dir]
        for dir in dir_to_be_cleaned:
            _clear_folder(dir)

    def compile_all_solution_files(self):
        solutions_dir = os.path.join(self.base_dir, "solutions")
        subprocess.run(
            [os.path.join(solutions_dir, "compile_all.sh")],
            cwd=solutions_dir,
        )

    def generate_json(self):
        with open(self.questions_json_file_path, "r") as f:
            questions_data = json.load(f)

        questions = []
        for q_data in questions_data:
            formatted_title = self._get_formatted_filename(q_data["title"])
            inputs_file_path = os.path.join(self.inputs_dir, f"{formatted_title}.in")
            outputs_file_path = os.path.join(self.outputs_dir, f"{formatted_title}.out")

            with open(inputs_file_path, "r") as f:
                inputs = f.read().strip().split("\n\n")
            with open(outputs_file_path, "r") as f:
                outputs = f.read().strip().split("\n")

            example_inputs = {ex["input"] for ex in q_data["examples"]}

            test_cases = []
            for i, input_str in enumerate(inputs):
                output_str = outputs[i] if i < len(outputs) else ""
                is_hidden = input_str not in example_inputs
                test_cases.append(
                    TestCase(input=input_str, output=output_str, is_hidden=is_hidden)
                )

            question = Question(
                title=q_data["title"],
                input=q_data["input"],
                output=q_data["output"],
                description=q_data["description"],
                difficulty=q_data["difficulty"],
                categories=q_data["categories"],
                examples=[TestCase(**ex) for ex in q_data["examples"]],
                constraints=q_data["constraints"],
                hints=q_data["hints"],
                test_cases=test_cases,
            )
            questions.append(question.model_dump())

        with open(self.output_json_file_path, "w") as f:
            json.dump(questions, f, indent=2)

    def run(self):
        self.clean_existing_outputs()
        self.compile_all_solution_files()
        self.generate_outputs()
        self.generate_json()


if __name__ == "__main__":
    generator = InsertJSONGenerator()
    generator.run()
