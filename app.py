from flask import Flask, request, jsonify
from flask_cors import CORS

import openai

from dotenv import load_dotenv
import os

from tools import gpt3_request_python, post_process_gpt3_text_python

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes, for all origins and methods.


@app.route('/api/convert', methods=['POST'])
def convert():
    print("Received request")
    data = request.json
    raw_code = data.get('code')
    input_value = float(data.get('input'))
    function_name = data.get('function_name')
    print(f"Received code: \n{raw_code}")

    exec_globals = {}
    exec(raw_code, exec_globals)
    # Retrieve the function using the extracted name
    generated_function = exec_globals.get(function_name)
    if not generated_function:
        print("\nError: The generated code does not define a valid function. Please check the generated code.")
        return jsonify({'output': f"Error: The generated code does not define a valid function. Please check the generated code."})

    result = generated_function(input_value)


    return jsonify({'output': result})


@app.route('/api/create_convert_page', methods=['POST'])
def create_convert_page():

    data = request.json
    prompt = data.get('prompt')
    print(f"Received prompt: {prompt}")


    # Create a prompt for GPT-3
    prompt = f"Please provide the exact Python code for a function that {prompt}. The function should take one parameter as input and return the converted value. No additional text is necessary; only provide the complete Python function."
    # Get the function code from GPT-3
    raw_code = gpt3_request_python(prompt)

    try:
        # Post-process the received code to extract the actual function code and name
        code, function_name = post_process_gpt3_text_python(raw_code)
    except ValueError as e:
        print(f"Error in processing GPT-3 response: {str(e)}")
        return jsonify({'output': f"Error in processing GPT-3 response: {str(e)}"})

    # Print out the function code
    print("\nGPT-3 generated the following code:\n")
    print(code)

    return jsonify({'output': code, 'function_name': function_name})


@app.route('/api/process-prompt', methods=['POST'])
def process_prompt():
    data = request.json
    prompt = data.get('prompt')
    print(f"Received prompt: {prompt}")
    # Here, you would handle the conversion based on the received prompt and input
    # For demonstration, let's just return the received input as output

    # Create a prompt for GPT-3
    prompt = f"Please provide the exact Python code for a function that {prompt}. The function should take one parameter as input and return the converted value. No additional text is necessary; only provide the complete Python function."
    # Get the function code from GPT-3
    raw_code = gpt3_request_python(prompt)

    try:
        # Post-process the received code to extract the actual function code and name
        code, function_name = post_process_gpt3_text_python(raw_code)
    except ValueError as e:
        print(f"Error in processing GPT-3 response: {str(e)}")
        return jsonify({'output': f"Error in processing GPT-3 response: {str(e)}"})

    # Print out the function code
    print("\nGPT-3 generated the following code:\n")
    print(code)

    return jsonify({'output': code, 'function_name': function_name})




if __name__ == '__main__':
    app.run(port=5000)
