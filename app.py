import streamlit as st
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Page config
st.set_page_config(
    page_title="DataNarrator",
    page_icon="📊",
    layout="wide"
)

def main():
    st.title("📊 DataNarrator")
    st.markdown("""
    Upload your CSV data and let the AI generate a comprehensive narrative report.
    """)

    # Sidebar for API Key (optional override)
    with st.sidebar:
        st.header("Settings")
        api_key = st.text_input("Google API Key", type="password", help="Leave empty if set in .env")
        if api_key:
            os.environ["GOOGLE_API_KEY"] = api_key

    # File Uploader
    uploaded_file = st.file_uploader("Upload CSV File", type=["csv"])

    if uploaded_file is not None:
        # 1. Validation (The Brain)
        from src import brain, analyst, writer
        
        is_valid, message = brain.validate_file(uploaded_file)
        
        if not is_valid:
            st.error(message)
        else:
            st.success("File validated successfully!")
            
            # 2. Ingestion (Analyst)
            df = analyst.load_data(uploaded_file)
            
            # Brain: Determine Context
            report_type = brain.determine_report_type(df)
            st.info(f"💡 AI Suggestion: This looks like a **{report_type}**.")

            st.dataframe(df.head(), use_container_width=True)
            
            # 3. Analysis (Analyst)
            with st.spinner("Crunching numbers..."):
                stats = analyst.generate_summary(df)
            
            with st.expander("View Calculated Statistics (The Analyst)"):
                st.json(stats)
            
            # 4. Narrative Generation (The Writer)
            st.divider()
            st.subheader("Generate Narrative Report")
            user_instruction = st.text_input("Optional Instructions (e.g., 'Focus on sales trends' or 'Write for an executive')")
            
            if st.button("Generate Report"):
                with st.spinner("AI is determining the story..."):
                    report = writer.generate_narrative(stats, user_instruction)
                    st.markdown("### Executive Report")
                    st.markdown(report)


if __name__ == "__main__":
    main()
