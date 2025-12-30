import matplotlib
matplotlib.use('Agg') # Non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
import os
import uuid
import pandas as pd
import numpy as np

def generate_plots(df, output_dir):
    """
    Generates static plots from the DataFrame and saves them to output_dir.
    Returns a list of filenames.
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    plot_paths = []
    
    # Set style
    sns.set_theme(style="whitegrid")
    
    # 1. Correlation Heatmap (Numeric)
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    if len(numeric_cols) > 1:
        plt.figure(figsize=(10, 8))
        corr = df[numeric_cols].corr()
        sns.heatmap(corr, annot=True, cmap='coolwarm', fmt=".2f", linewidths=0.5)
        plt.title('Correlation Matrix')
        plt.tight_layout()
        
        filename = f"heatmap_{uuid.uuid4().hex[:8]}.png"
        path = os.path.join(output_dir, filename)
        plt.savefig(path)
        plt.close()
        plot_paths.append({"file": filename, "type": "correlation", "title": "Correlation Matrix"})

    # 2. Distribution Plots (Top 3 Numeric)
    # Filter out ID-like columns (too many unique values matches count) or low variance
    for col in numeric_cols[:3]: # Limit to first 3 for now
        plt.figure(figsize=(8, 6))
        sns.histplot(df[col].dropna(), kde=True, color='skyblue')
        plt.title(f'Distribution of {col}')
        plt.xlabel(col)
        plt.ylabel('Frequency')
        plt.tight_layout()
        
        filename = f"dist_{col}_{uuid.uuid4().hex[:8]}.png".replace(' ', '_').replace('/', '_')
        path = os.path.join(output_dir, filename)
        plt.savefig(path)
        plt.close()
        plot_paths.append({"file": filename, "type": "distribution", "title": f"Distribution of {col}"})

    # 3. Categorical Bar Charts (Top 3 Object)
    cat_cols = df.select_dtypes(include=['object', 'category']).columns
    for col in cat_cols[:3]:
        # Top 10 values
        top_counts = df[col].value_counts().head(10)
        
        plt.figure(figsize=(10, 6))
        sns.barplot(x=top_counts.values, y=top_counts.index, palette='viridis')
        plt.title(f'Top 10 {col}')
        plt.xlabel('Count')
        plt.tight_layout()
        
        filename = f"cat_{col}_{uuid.uuid4().hex[:8]}.png".replace(' ', '_').replace('/', '_')
        path = os.path.join(output_dir, filename)
        plt.savefig(path)
        plt.close()
        plot_paths.append({"file": filename, "type": "category", "title": f"Top 10 Values: {col}"})

    return plot_paths
