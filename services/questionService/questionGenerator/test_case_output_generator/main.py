import os
import subprocess

base_dir = os.path.dirname(os.path.realpath(__file__))
solutions_output_dir = os.path.join(base_dir, "..", "solutions", "output")

inputs_dir = os.path.join(base_dir, "..", "inputs")
outputs_dir = os.path.join(base_dir, "..", "outputs")


def generate_outputs():
    if not os.path.exists(outputs_dir):
        os.makedirs(outputs_dir, exist_ok=True)

    for title in os.listdir(solutions_output_dir):
        input_file_path = os.path.join(inputs_dir, f"{title}.in")
        input_file = open(input_file_path, "r")
        output_file_path = os.path.join(outputs_dir, f"{title}.out")
        output_file = open(output_file_path, "w")
        inputs = ""
        for input_line in input_file:
            if input_line != "\n":
                inputs += input_line
            else:
                solution_file_path = os.path.join(solutions_output_dir, title)
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


if __name__ == "__main__":
    generate_outputs()
