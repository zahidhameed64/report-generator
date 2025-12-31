import pandas as pd

def validate_file(file):
    """
    Checks if the uploaded file is valid and not empty.
    Supports CSV, Excel, and JSON.
    Returns (bool, message).
    """
    filename = file.filename.lower()
    
    try:
        if filename.endswith('.csv'):
            encodings = ['utf-8', 'latin-1', 'cp1252', 'ISO-8859-1']
            for encoding in encodings:
                try:
                    file.seek(0)
                    df = pd.read_csv(file, encoding=encoding)
                    if df.empty:
                        return False, "File is empty."
                    file.seek(0)
                    return True, "File is valid."
                except UnicodeDecodeError:
                    continue
                except Exception:
                    continue
            return False, "Unable to decode CSV file."

        elif filename.endswith(('.xls', '.xlsx')):
            try:
                file.seek(0)
                df = pd.read_excel(file)
                if df.empty:
                    return False, "File is empty."
                file.seek(0)
                return True, "File is valid."
            except Exception as e:
                return False, f"Invalid Excel file: {str(e)}"

        elif filename.endswith('.json'):
            try:
                file.seek(0)
                df = pd.read_json(file)
                if df.empty:
                    return False, "File is empty."
                file.seek(0)
                return True, "File is valid."
            except Exception as e:
                return False, f"Invalid JSON file: {str(e)}"
        
        else:
            return False, "Unsupported file type. Please upload CSV, Excel, or JSON."

    except Exception as e:
        return False, f"Validation error: {str(e)}"
    finally:
        # Always reset pointer
        file.seek(0)

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
