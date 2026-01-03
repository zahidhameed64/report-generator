# DataNarrator

A web application that generates narrative reports from **CSV, Excel, and JSON** data using Google Gemini AI.

## Architecture

The system implements a modular, "agentic" workflow pattern:

*   **The Brain**: The orchestration and validation agent. Validates file integrity and determines the analysis context (e.g., Time Series vs. General Performance).
*   **The Analyst**: The data science agent. Handles "hard skills" like statistical computation, correlation analysis, and data cleaning using Pandas.
*   **The Writer**: The creative agent. Synthesizes the statistical insights into a human-readable narrative using Google Gemini.

## Prerequisites

- [Node.js](https://nodejs.org/) (for the frontend)
- [Python 3.8+](https://www.python.org/) (for the backend)
- A Google Gemini API Key

## Setup & Installation

### 1. Backend Setup
Navigate to the backend folder and install Python dependencies:
```bash
cd backend
pip install -r requirements.txt
```
*Note: Make sure you have a `.env` file in the `backend` folder with your `GEMINI_API_KEY`.*

### 2. Frontend Setup
Navigate to the frontend folder and install Node dependencies:
```bash
cd frontend
npm install
```

## Running the Application

You need to run **both** the backend and frontend terminals simultaneously.

### Terminal 1: Start Backend
```bash
cd backend
python server.py
# Server will run on http://127.0.0.1:5000
```

### Terminal 2: Start Frontend
```bash
cd frontend
npm run dev
# App will run on http://localhost:5173
```

## Usage
1. Open the frontend URL (http://localhost:5173).
2. Upload a data file (**CSV, Excel .xlsx, or JSON**).
3. View the analysis stats.
4. Click "Generate Narrative Report".
