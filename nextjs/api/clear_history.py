import os
import json

# Vercel serverless function for clearing history
def clear_history(request):
    directory = '../src/pages/convert_pages/'
    errors = []

    for filename in os.listdir(directory):
        file_path = os.path.join(directory, filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                # If you also want to remove subdirectories, uncomment the next line
                # shutil.rmtree(file_path)
                pass  # Currently does nothing, directories are skipped
        except Exception as e:
            errors.append(f'Failed to delete {file_path}. Reason: {e}')

    if not errors:
        return json.dumps({"success": True, "message": "History cleared successfully"}), 200
    else:
        return json.dumps({"success": False, "message": errors[0]}), 500
