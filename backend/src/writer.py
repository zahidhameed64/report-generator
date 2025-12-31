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
        You are a Top-Tier Data Analyst & Business Consultant.
        
        DATA SUMMARY:
        {summary_stats}
        
        USER INSTRUCTION: 
        {instruction}
        
        OBJECTIVE:
        Write a professional, comprehensive data intelligence report. 
        Your goal is to uncover "hidden gems", identify strategic opportunities, and provide a 360-degree view of the data.
        
        STRUCTURED OUTPUT:
        
        # Report
        
        ## 1. Executive Briefing
        - High-level summary of the dataset's core purpose and scope.
        - The "Big Picture" take-away.
        
        ## 2. Deep Dive: Metrics & Distributions
        - Analyze numeric trends (Mean, Median, Std Dev, Outliers).
        - Analyze categorical patterns (Top Categories, Dominant Countries/Groups).
        - Highlight the "Superstars" vs "Long Tail" (skewness).
        
        ## 3. Correlation & Logic Analysis
        - Interpret the correlations (e.g., "Earnings generally track with Views").
        - Identify any surprising or counter-intuitive relationships.
        
        ## 4. Strategic Implications & Opportunities
        - **Crucial Section**: What does this mean for a business or creator?
        - Suggest actionable next steps (e.g., "Focus on X category", "Expand to Y region").
        
        STRICT RULES:
        - Do NOT use conversational fillers ("Here is the report..."). Start with headers.
        - Do NOT invent numbers. Use the provided Stats only.
        - Be insightful, not just descriptive. asking "Why?" implies looking for reasons in the data logic.
        """
        last_error = None
        for model_name in models_to_try:
            try:
                print(f"DEBUG: Trying generation with model: {model_name}")
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)
                return response.text
                return response.text
            except Exception as e:
                print(f"DEBUG: Model {model_name} failed: {e}")
                last_error = e
                continue
        
        return f"Error: All available Gemini models failed. Last error: {str(last_error)}. Please check your API key and quotas."
    except Exception as e:
        return f"Error generating narrative: {e}"

def chat_with_data(history, stats):
    """
    Handles follow-up chat turns.
    """
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return "Error: API Key missing."

    # List of models to try in order of preference/cost/speed
    # Removed gemini-pro (404 deprecated)
    models_to_try = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-pro-latest']
    
    last_error = None
    import time
    
    for model_name in models_to_try:
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel(model_name)
            
            system_context = f"""
            You are a helpful Data Analyst Assistant.
            You have already analyzed the following dataset summary:
            {stats}
            
            The user is asking follow-up questions about this data.
            Answer strictly based on the provided stats. If you don't know, say so.
            Keep answers concise and conversational.
            """
            
            # Construct stateless prompt for robustness
            conversation = [f"System: {system_context}"]
            for msg in history:
                role_label = "User" if msg['role'] == 'user' else "Assistant"
                conversation.append(f"{role_label}: {msg['content']}")
                
            full_prompt = "\n\n".join(conversation) + "\nAssistant:"
            
            response = model.generate_content(full_prompt)
            return response.text
            
        except Exception as e:
            print(f"DEBUG: Chat model {model_name} failed: {str(e)}")
            last_error = e
            time.sleep(1) # Wait a bit before trying next model
            continue

    return f"Sorry, I am currently overloaded (Rate Limit). Please try again in 5-10 seconds. (Error: {str(last_error)})"
