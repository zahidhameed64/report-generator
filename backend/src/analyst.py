import pandas as pd
import numpy as np

def load_data(file):
    """
    Loads CSV data into a Pandas DataFrame.
    """
    file.seek(0) # Reset file pointer
    return pd.read_csv(file)

def generate_summary(df):
    """
    Calculates statistical summary of the DataFrame.
    Returns a dictionary of stats.
    """
def generate_summary(df):
    """
    Calculates detailed statistical summary of the DataFrame.
    Returns a dictionary of stats optimized for LLM consumption.
    """
    summary = {
        "basic_info": {
            "rows": len(df),
            "columns": list(df.columns),
            "missing_values": df.isnull().sum().to_dict()
        },
        "numeric_stats": {},
        "correlation": {}
    }

    # Numeric Analysis
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        summary["numeric_stats"][col] = {
            "mean": round(df[col].mean(), 2),
            "median": round(df[col].median(), 2),
            "max": float(df[col].max()), # standard python float for json serialization
            "min": float(df[col].min()),
            "std_dev": round(df[col].std(), 2)
        }
        
        # Find peak value row (e.g., "Month with highest Sales")
        # This is simple; for more complex logic we might need time-series detection
        max_idx = df[col].idxmax()
        # If there's a date/string column that identifies rows, use it? 
        # For now just store the value.

    # Correlation Analysis (Top correlated pairs)
    if len(numeric_cols) > 1:
        corr_matrix = df[numeric_cols].corr().abs()
        # Unstack and sort
        sol = (corr_matrix.where(np.triu(np.ones(corr_matrix.shape), k=1).astype(bool))
               .stack()
               .sort_values(ascending=False))
        
        # Top 3 correlations
        top_corr = sol.head(3).to_dict()
        summary["correlation"] = {f"{k[0]} vs {k[1]}": round(v, 2) for k, v in top_corr.items()}

    return summary
