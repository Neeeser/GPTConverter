import re

import openai
import sys
import json
from dotenv import load_dotenv
import os
load_dotenv()

def post_process_gpt3_text_python(gpt3_text):
    """
    Post-process the text from GPT-3: extract Python code, clean it up, and identify the function name.

    Args:
    gpt3_text (str): The raw text received from GPT-3.

    Returns:
    tuple: A tuple containing two elements: the cleaned Python code as a string, and the function name.
    """
    # 1. Check if the text is in a code block and extract it
    code_match = re.search(r'```python(.*?)```', gpt3_text, re.DOTALL)
    if code_match:
        code_block = code_match.group(1).strip()  # Extract the code and trim whitespace
    else:
        code_block = gpt3_text.strip()  # If not in a code block, consider the whole text as code

    # 2. Clean up the code: remove any extraneous text outside of the main function definition
    # This regex pattern matches 'def' followed by anything (non-greedy), then a set of parentheses (with anything inside), and a colon
    # It captures the function name and the rest of the code block
    function_match = re.search(r'(def\s+(\w+)\s*\(.*?\)\s*:.*?)$', code_block, re.DOTALL)
    if not function_match:
        raise ValueError("No valid Python function definition found.")

    clean_code = function_match.group(1).strip()  # The full match is the code block
    function_name = function_match.group(2)  # The second captured group is the function name

    return clean_code, function_name

def post_process_gpt3_text_tsx(gpt3_text):
    """
    Post-process the text from GPT-3: extract Python code, clean it up, and identify the function name.

    Args:
    gpt3_text (str): The raw text received from GPT-3.

    Returns:
    tuple: A tuple containing two elements: the cleaned Python code as a string, and the function name.
    """
    # 1. Check if the text is in a code block and extract it
    code_match = re.search(r'```(?:typescript|tsx|ts)\s*(.*?)```', gpt3_text, re.DOTALL | re.IGNORECASE)

    if code_match:
        code_block = code_match.group(1).strip()  # Extract the code and trim whitespace
    else:
        #code_block = gpt3_text.strip()  # If not in a code block, consider the whole text as code
        raise ValueError("No valid TypeScript code block found.")
    # 2. Clean up the code: remove any extraneous text outside of the main function definition
    # This regex pattern matches 'def' followed by anything (non-greedy), then a set of parentheses (with anything inside), and a colon
    # It captures the function name and the rest of the code block

    return code_block

def gpt3_request_python(prompt):
    """
    Make a request to the GPT-3.5-turbo API with a specific prompt.

    Args:
    prompt (str): The prompt describing the function.

    Returns:
    str: The GPT-3.5-turbo-generated code.
    """
    # Craft the messages for the chat


    messages = [
        {"role": "system", "content": "You are a skilled Python programmer generating unit conversion functions. Generate the exact Python code necessary based on user requirements. Include no extra formatting for markup. Plain text is necessary."},
        {"role": "user", "content": prompt}
    ]

    # Make the API request
    response = openai.ChatCompletion.create(
      # GPT 4
      model="gpt-3.5-turbo-1106",
      messages=messages,
      #temperature=0.5  # Lower temperature might help in getting more deterministic output
    )

    # Extract the code from the response
    code = response['choices'][0]['message']['content']

    return code.strip()  # strip() is used to remove leading/trailing white spaces

def make_request(prompt, model="gpt-3.5-turbo-1106"):
    if model == "GPT-3.5":
        return gpt3_request_tsx(prompt)
    elif model == "GPT-4":
        return gpt4_request_tsx(prompt)

    return gpt3_request_tsx(prompt)

def gpt3_request_tsx(prompt):
    """
    Make a request to the GPT-3.5-turbo API with a specific prompt.

    Args:
    prompt (str): The prompt describing the function.

    Returns:
    str: The GPT-3.5-turbo-generated code.
    """
    # Craft the messages for the chat
    j = json.load(open("prompt.json"))
    sysprompt = j["RefinedSystemPrompt3.5"]
    print(sysprompt)
    messages = [
        {"role": "system", "content": sysprompt},
        {"role": "user", "content": prompt}
    ]

    # Make the API request
    response = openai.ChatCompletion.create(
      model="gpt-3.5-turbo-1106",
      messages=messages,
      temperature=0.5  # Lower temperature might help in getting more deterministic output
    )

    # Print full message
    print(response)
    # Extract the code from the response
    code = response['choices'][0]['message']['content']

    return code.strip()  # strip() is used to remove leading/trailing white spaces


def gpt4_request_tsx(prompt):
    """
    Make a request to the GPT-4-turbo API with a specific prompt.

    Args:
    prompt (str): The prompt describing the function.

    Returns:
    str: The GPT-4-turbo-generated code.
    """
    # Craft the messages for the chat
    j = json.load(open("prompt.json"))
    sysprompt = j["RefinedSystemPrompt"]
    print(sysprompt)
    messages = [
        {"role": "system", "content": sysprompt},
        {"role": "user", "content": prompt}
    ]

    # Make the API request
    response = openai.ChatCompletion.create(
      model="gpt-4-1106-preview",
      messages=messages,
      temperature=0.5  # Lower temperature might help in getting more deterministic output
    )

    # Print full message
    print(response)
    # Extract the code from the response
    code = response['choices'][0]['message']['content']

    return code.strip()  # strip() is used to remove leading/trailing white spaces


def cli():
    # Authenticate with the OpenAI API
    openai.api_key = os.getenv("OPENAI_API_KEY")

    # Get the function description from the user
    print("Describe the function you'd like to create (e.g., 'a function that converts kilometers to miles'):")
    description = input("> ")

    # Create a prompt for GPT-3
    prompt = f"Please provide the exact Python code for a function that {description}. The function should take one parameter as input and return the converted value. No additional text is necessary; only provide the complete Python function."
    # Get the function code from GPT-3
    raw_code = gpt3_request_python(prompt)

    try:
        # Post-process the received code to extract the actual function code and name
        code, function_name = post_process_gpt3_text_python(raw_code)
    except ValueError as e:
        print(f"Error in processing GPT-3 response: {str(e)}")
        sys.exit(1)

    # Print out the function code
    print("\nGPT-3 generated the following code:\n")
    print(code)

    # Dynamically define the function in the current script
    exec_globals = {}
    exec(code, exec_globals)

    # Retrieve the function using the extracted name
    generated_function = exec_globals.get(function_name)
    if not generated_function:
        print("\nError: The generated code does not define a valid function. Please check the generated code.")
        sys.exit(1)

    # Get the value to convert from the user
    print("\nEnter the value to convert:")
    value = float(input("> "))

    # Call the generated function and print the result
    result = generated_function(value)
    print(f"\nResult: {result}")

if __name__ == "__main__":
    # while True:
    #     cli()
    j = json.load(open("prompt.json"))
    sysprompt = j["GeneralInputPrompt"]

    user_input = "Create a compound interest calculator"  # Example user input
    formatted_json = sysprompt.format(user_input=user_input)
    print(formatted_json)

