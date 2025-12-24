from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from src import brain, analyst, writer
import os
from dotenv import load_dotenv

# Load env variables
load_dotenv()

app = Flask(__name__)
# Allow CORS for React app (usually runs on localhost:5173)
CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "Backend is running"})

@app.route('/', methods=['GET'])
def index():
    return "<h1>Backend is active! 🚀</h1><p>This is the API server. Please open the Frontend at <a href='http://localhost:5173'>http://localhost:5173</a> to use the app.</p>"


@app.route('/', methods=['GET'])
def index():
    return "<h1>Backend is active! 🚀</h1><p>This is the API server. Please open the Frontend at <a href='http://localhost:5173'>http://localhost:5173</a> to use the app.</p>"


@app.route('/', methods=['GET'])
def index():
    return "<h1>Backend is active! 🚀</h1><p>This is the API server. Please open the Frontend at <a href='http://localhost:5173'>http://localhost:5173</a> to use the app.</p>"


@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # 1. Validation (Brain)
    is_valid, message = brain.validate_file(file)
    if not is_valid:
        return jsonify({"error": message}), 400

    # 2. Ingestion & Analysis (Analyst)
    try:
        df = analyst.load_data(file)
        stats = analyst.generate_summary(df)
        report_type = brain.determine_report_type(df)
        
        # Determine preview (first 5 rows)
        preview = df.head().to_dict(orient='records')
        
        return jsonify({
            "message": "File analyzed successfully",
            "stats": stats,
            "report_type": report_type,
            "preview": preview
        })
    except Exception as e:
        return jsonify({"error": f"Error processing file: {str(e)}"}), 500

@app.route('/api/generate', methods=['POST'])
def generate_report():
    data = request.json
    stats = data.get('stats')
    instruction = data.get('instruction', '')
    
    if not stats:
        return jsonify({"error": "No statistics provided"}), 400

    # 3. Narrative Generation (Writer)
    try:
        report = writer.generate_narrative(stats, instruction)
        return jsonify({"report": report})
    except Exception as e:
        return jsonify({"error": f"Error generating report: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
