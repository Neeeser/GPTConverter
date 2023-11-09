import os
import json
import hashlib
from tools import create_page as cp  # This assumes you have refactored the create_page function



# Vercel serverless function for creating convert page
def create_convert_page(request):
    body = request.get_json()
    prompt = body.get('prompt')

    # Call your refactored create_page function and return the result
    return cp(prompt)
