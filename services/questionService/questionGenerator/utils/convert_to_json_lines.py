import json
from pathlib import Path


def convert_to_json_lines():
    input_file_path = Path(__file__).parent.parent.joinpath("questions.json")
    questions = json.load(open(input_file_path))
    output_file_path = Path(__file__).parent.parent.joinpath("questions.jsonl")
    with open(output_file_path, "w") as f:
        for question in questions:
            f.write(json.dumps(question) + "\n")


if __name__ == "__main__":
    convert_to_json_lines()
