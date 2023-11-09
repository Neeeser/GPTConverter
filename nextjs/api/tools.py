import hashlib
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
    code_match = re.search(r'```typescript(.*?)```', gpt3_text, re.DOTALL)
    if code_match:
        code_block = code_match.group(1).strip()  # Extract the code and trim whitespace
    else:
        code_block = gpt3_text.strip()  # If not in a code block, consider the whole text as code

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
      model="gpt-3.5-turbo",
      messages=messages,
      temperature=0.5  # Lower temperature might help in getting more deterministic output
    )

    # Extract the code from the response
    code = response['choices'][0]['message']['content']

    return code.strip()  # strip() is used to remove leading/trailing white spaces

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
    sysprompt = j["SystemPromptExample"]
    print(sysprompt)
    messages = [
        {"role": "system", "content": sysprompt},
        {"role": "user", "content": prompt}
    ]

    # Make the API request
    response = openai.ChatCompletion.create(
      model="gpt-3.5-turbo",
      messages=messages,
      temperature=0.5  # Lower temperature might help in getting more deterministic output
    )

    # Extract the code from the response
    code = response['choices'][0]['message']['content']

    return code.strip()  # strip() is used to remove leading/trailing white spaces
def create_page(prompt):


    prompt = f"Please provide the exact TypeScript code for a basic webpage using Material UI that creates a nicely formatted page that converts {prompt} both ways. Only allow the correct unit type to be entered in the input boxes."

    # Get the function code from GPT-3
    raw_code = gpt3_request_tsx(prompt)

    try:
        # Post-process the received code to extract the actual function code and name
        code = post_process_gpt3_text_tsx(raw_code)
    except ValueError as e:
        print(f"Error in processing GPT-3 response: {str(e)}")
        return {'output': f"Error in processing GPT-3 response: {str(e)}"}

    # Print out the function code
    print("\nGPT-3 generated the following code:\n")
    print(code)

    # Save the code to a file
    file_name = 'convert.tsx'


    prompt_hash = hashlib.md5(prompt.encode()).hexdigest()
    file_name = f"convert_{prompt_hash}.tsx"

    with open('nextjs/src/pages/convert_pages/' + file_name, 'w+') as f:
        f.write(code)

    # remove the .tsx from file_name
    file_name = file_name[:-4]


    return {'file_name': "convert_pages/"+file_name}