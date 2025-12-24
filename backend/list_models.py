import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load env variables
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
load_dotenv(dotenv_path)

api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("Error: No API Key found.")
    exit(1)

genai.configure(api_key=api_key)

print("Listing available models...")
try:
    with open('models_output.txt', 'w', encoding='utf-8') as f:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                f.write(f"{m.name}\n")
                print(f"- {m.name}")
    print("Models written to models_output.txt")
except Exception as e:
    print(f"Error listing models: {e}")
