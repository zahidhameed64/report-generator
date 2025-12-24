import google.generativeai as genai
import os

def generate_narrative(summary_stats, instruction=""):
    """
    Generates a narrative report based on summary statistics using Google Gemini.
    """
    # Check for API Key
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return "Error: Google API Key not found. Please set it in the sidebar or .env file."

    try:
        genai.configure(api_key=api_key)
        
        # Use a model that supports text generation (e.g., gemini-pro or gemini-1.5-flash)
        model = genai.GenerativeModel('gemini-1.5-flash')

        prompt = f"""
        You are a professional Data Analyst. 
        Here are the summary statistics of a dataset: {summary_stats}
        
        User Instruction: {instruction}
        
        Write a clear, professional executive summary and data breakdown based on these stats. 
        Do NOT invent numbers. Only use the provided statistics.
        """

        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error generating narrative: {e}"
