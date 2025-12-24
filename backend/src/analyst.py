import pandas as pd
import numpy as np
import sys

def load_data(file):
    """
    Loads CSV data into a Pandas DataFrame.
    """
    encodings = ['utf-8', 'latin-1', 'cp1252', 'ISO-8859-1']
    
    for encoding in encodings:
        try:
            file.seek(0)
            return pd.read_csv(file, encoding=encoding)
        except UnicodeDecodeError:
            continue
            
    # If all fail, raise error
    file.seek(0)
    raise ValueError(f"Unable to decode file. Supported encodings: {encodings}")

def generate_summary_v2(df):
    """
    Calculates detailed statistical summary of the DataFrame.
    Returns a dictionary of stats optimized for LLM consumption.
    """
    print(f"DEBUG: Starting analysis on {len(df)} rows and {len(df.columns)} columns...", file=sys.stderr)
    
    try:
        summary = {
            "basic_info": {
                "rows": int(len(df)),
                "columns": list(df.columns),
                "missing_values": {k: int(v) for k, v in df.isnull().sum().to_dict().items()}
            },
            "numeric_stats": {},
            "correlation": {}
        }

        # Helper to clean values for JSON
        def clean_val(val):
            if pd.isna(val) or np.isinf(val):
                return None
            if isinstance(val, (np.integer, int)):
                return int(val)
            if isinstance(val, (np.floating, float)):
                return float(val)
            return val

        # Numeric Analysis
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        print(f"DEBUG: Found numeric cols: {list(numeric_cols)}", file=sys.stderr)
        
        for col in numeric_cols:
            try:
                summary["numeric_stats"][col] = {
                    "mean": clean_val(round(df[col].mean(), 2)),
                    "median": clean_val(round(df[col].median(), 2)),
                    "max": clean_val(df[col].max()),
                    "min": clean_val(df[col].min()),
                    "std_dev": clean_val(round(df[col].std(), 2))
                }
            except Exception as e:
                print(f"DEBUG: Error processing col {col}: {e}", file=sys.stderr)
                continue

        # Correlation Analysis
        if len(numeric_cols) > 1:
            try:
                corr_matrix = df[numeric_cols].corr().abs()
                sol = (corr_matrix.where(np.triu(np.ones(corr_matrix.shape), k=1).astype(bool))
                    .stack()
                    .sort_values(ascending=False))
                
                top_corr = sol.head(3).to_dict()
                summary["correlation"] = {f"{k[0]} vs {k[1]}": clean_val(round(v, 2)) for k, v in top_corr.items()}
            except Exception as e:
                print(f"DEBUG: Correlation failed: {e}", file=sys.stderr)

        print("DEBUG: Analysis complete. Returning summary.", file=sys.stderr)
        return summary
    
    except Exception as e:
        print(f"DEBUG: CRITICAL ERROR inside generate_summary_v2: {e}", file=sys.stderr)
        return {"error": str(e), "basic_info": {"rows": 0}} # Fallback
