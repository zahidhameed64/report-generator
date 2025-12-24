import google.generativeai as genai
import os

def generate_narrative(summary_stats, instruction=""):
    """
    Generates a narrative report based on summary statistics using Google Gemini.
    """
    # Check for API Key
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return "Error: Google API Key not found. Please set 'GEMINI_API_KEY' in your .env file."

    try:
        genai.configure(api_key=api_key)
        
        # Use a model that supports text generation (priority: 2.5 flash -> 2.0 flash -> pro latest)
        # Based on available models: gemini-2.5-flash, gemini-2.0-flash, gemini-pro-latest
        models_to_try = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-pro-latest']
        
        prompt = f"""
        You are a professional Data Analyst. 
        Here are the summary statistics of a dataset: {summary_stats}
        
        User Instruction: {instruction}
        
        Write a clear, professional executive summary and data breakdown based on these stats. 
        Do NOT invent numbers. Only use the provided statistics.
        """

        last_error = None
        for model_name in models_to_try:
            try:
                print(f"DEBUG: Trying generation with model: {model_name}")
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)
                return response.text
            except Exception as e:
                print(f"DEBUG: Model {model_name} failed: {e}")
                last_error = e
                continue
        
        return f"Error: All available Gemini models failed. Last error: {str(last_error)}. Please check your API key and quotas."
    except Exception as e:
        return f"Error generating narrative: {e}"
