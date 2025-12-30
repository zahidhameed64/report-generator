from fpdf import FPDF
import os
import traceback

# Paths
MD_FILE_PATH = r"C:\Users\A C\.gemini\antigravity\brain\8ad1fbd2-cc5c-4f5f-8085-b9fa7ef521f3\project_report.md"
OUTPUT_PDF_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "Project_Report.pdf")

def sanitize_text(text):
    replacements = {
        '\u2013': '-', '\u2014': '--', '\u2018': "'", '\u2019': "'",
        '\u201c': '"', '\u201d': '"', '\u2022': '*', '…': '...',
    }
    for k, v in replacements.items():
        text = text.replace(k, v)
    return text.encode('latin-1', 'replace').decode('latin-1')

def generate():
    try:
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Helvetica", size=12)
        
        with open(MD_FILE_PATH, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        pdf.cell(0, 10, "Project Report", ln=True, align='C')
        pdf.ln(10)
        
        for line in lines:
            safe_line = sanitize_text(line).strip()
            if not safe_line:
                pdf.ln(5)
                continue
            
            if safe_line.startswith("#"):
                pdf.set_font("Helvetica", 'B', 14)
                pdf.multi_cell(0, 10, safe_line.replace("#", "").strip())
                pdf.set_font("Helvetica", '', 12)
            else:
                pdf.multi_cell(0, 6, safe_line)
                
        pdf.output(OUTPUT_PDF_PATH)
        print(f"Success: {OUTPUT_PDF_PATH}")
        
    except Exception as e:
        print("ERROR DETAILS:")
        traceback.print_exc()

if __name__ == "__main__":
    generate()
