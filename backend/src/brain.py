import pandas as pd

def validate_file(file):
    """
    Checks if the uploaded file is a valid CSV and not empty.
    Returns (bool, message).
    """
    # Placeholder validation logic
    encodings = ['utf-8', 'latin-1', 'cp1252', 'ISO-8859-1']
    
    for encoding in encodings:
        try:
            file.seek(0)
            df = pd.read_csv(file, encoding=encoding)
            
            if df.empty:
                return False, "File is empty."
            
            # Reset pointer for next operations
            file.seek(0)
            return True, "File is valid."
            
        except UnicodeDecodeError:
            continue
        except Exception as e:
            return False, f"Error reading file: {e}"
            
    return False, f"Unable to decode file. Supported encodings: {encodings}"

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
                # Attempt to convert to datetime, ignoring errors
                valid_dates = pd.to_datetime(df[col], errors='coerce')
                # If more than 80% are valid dates, consider it a time series
                if valid_dates.notna().mean() > 0.8:
                    return "Time Series Analysis"
            except:
                continue

    return "General Performance Analysis"
