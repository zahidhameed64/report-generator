import google.generativeai as genai
import os
from dotenv import load_dotenv

# 1. Load .env
print("1. Loading environment variables...")
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
load_dotenv(dotenv_path)

api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
print(f"2. Check API Key: {'Found' if api_key else 'Missing'}")

if not api_key:
    print("❌ ERROR: API Key not found in .env")
    exit(1)

# 2. Configure Gemini
print(f"3. Configuring Gemini (Lib version: {genai.__version__})...")
try:
    genai.configure(api_key=api_key)
    
    print("4. Listing available models...")
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f" - Found model: {m.name}")
    except Exception as list_err:
        print(f"⚠️ Warning: list_models failed ({list_err}). Trying direct generation...")

    # Just list models to find the right name
    print("4. Listing available models:")
    available_models = []
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f" - {m.name}")
            available_models.append(m.name)
            
    print(f"Total generateContent models: {len(available_models)}")

except Exception as e:
    print(f"❌ CRITICAL ERROR: {e}")
