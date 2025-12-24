import pandas as pd

def validate_file(file):
    """
    Checks if the uploaded file is a valid CSV and not empty.
    Returns (bool, message).
    """
    # Placeholder validation logic
    try:
        df = pd.read_csv(file)
        if df.empty:
            return False, "File is empty."
        return True, "File is valid."
    except Exception as e:
        return False, f"Error reading file: {e}"

def determine_report_type(df):
    """
    Analyzes columns to suggest a report type.
    """
    # Check for datetime columns
    for col in df.columns:
        if pd.api.types.is_datetime64_any_dtype(df[col]):
            return "Time Series Analysis"
        
        # Try converting object cols to datetime to check
        if df[col].dtype == 'object':
            try:
                pd.to_datetime(df[col], errors='raise')
                # If we get here without error for the whole column (or significant part), it's likely a date
                return "Time Series Analysis"
            except:
                continue

    return "General Performance Analysis"
