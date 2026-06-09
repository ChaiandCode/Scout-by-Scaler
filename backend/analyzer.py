import fitz
import json
from groq import Groq
from prompts import get_analysis_prompt, get_chat_prompt
from dotenv import load_dotenv
import os

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def extract_text_from_pdf(file_bytes: bytes) -> str:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text.strip()

def analyze_resume(resume_text: str, job_description: str, role: str, experience_level: str) -> dict:
    prompt = get_analysis_prompt(resume_text, job_description, role, experience_level)
    
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
        max_tokens=2000
    )
    
    raw = response.choices[0].message.content.strip()
    
    # Clean markdown if present
    raw = raw.replace("```json", "").replace("```", "").strip()
    
    try:
        result = json.loads(raw)
    except json.JSONDecodeError:
        result = {
            "ats_score": 50,
            "score_reasoning": "Could not fully parse resume. Please try again.",
            "matched_keywords": [],
            "missing_keywords": [],
            "keyword_match_percentage": 0,
            "issues": [],
            "strengths": [],
            "scaler_recommendations": [],
            "quick_wins": []
        }
    
    return result


def chat_with_copilot(resume_text: str, role: str, conversation_history: list) -> str:
    system_prompt = get_chat_prompt(resume_text, role)
    
    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(conversation_history)
    
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        temperature=0.7,
        max_tokens=1000
    )
    
    return response.choices[0].message.content.strip()