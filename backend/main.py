from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from analyzer import extract_text_from_pdf, analyze_resume, chat_with_copilot
import json

app = FastAPI(title="Scout by Scaler API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store resume text temporarily in memory per session
resume_store = {}

@app.get("/")
def root():
    return {"message": "Scout by Scaler API is running"}


@app.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    job_description: str = Form(""),
    role: str = Form("Software Engineer (SDE)"),
    experience_level: str = Form("Fresher / Intern")
):
    try:
        file_bytes = await file.read()
        resume_text = extract_text_from_pdf(file_bytes)
        
        if not resume_text:
            return JSONResponse(status_code=400, content={"error": "Could not extract text from PDF. Make sure it is not a scanned image."})
        
        # Store resume text for chat
        resume_store["current"] = {
            "text": resume_text,
            "role": role
        }
        
        result = analyze_resume(resume_text, job_description, role, experience_level)
        return JSONResponse(content=result)
    
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/chat")
async def chat(payload: dict):
    try:
        message = payload.get("message", "")
        conversation_history = payload.get("history", [])
        
        resume_data = resume_store.get("current", {})
        resume_text = resume_data.get("text", "No resume uploaded yet.")
        role = resume_data.get("role", "Software Engineer")
        
        reply = chat_with_copilot(resume_text, role, conversation_history)
        return JSONResponse(content={"reply": reply})
    
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})