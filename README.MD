 Scout by Scaler 🎯

> AI-powered resume review platform that helps students and early professionals land better opportunities.

Live Demo → [scout-by-scaler.vercel.app](https://scout-by-scaler.vercel.app)

---

## What is Scout?

Scout is an intelligent resume analysis platform built for students applying to internships and early-career roles. It analyzes your resume against real job market requirements, identifies gaps, and recommends Scaler courses to make you job-ready in weeks — not months.

---

## Features

- **ATS Score** — Instant resume score out of 100 based on role and job description
- **Keyword Gap Analysis** — See exactly which keywords you have and which you're missing
- **Issues Detection** — Grammar mistakes, weak verbs, irrelevant content flagged automatically
- **Quick Wins** — Top 3 changes you can make today to improve your resume
- **Scaler Recommendations** — Courses matched directly to your skill gaps with estimated completion time
- **Scaler Talent Copilot** — AI chat with full resume context for career advice and interview prep
- **Role-Based Analysis** — Tailored analysis for SDE, Data Analyst, PM, DevOps, ML Engineer, and more

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI (Python) |
| AI Model | Groq LLaMA 3.3 70B |
| PDF Parsing | PyMuPDF |
| Frontend | HTML + CSS + Vanilla JS |
| Deployment | Render (backend) + Vercel (frontend) |
| Version Control | GitHub |

---

## Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/ChaiandCode/scout-by-scaler.git
cd scout-by-scaler
```

### 2. Install backend dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Add your Groq API key

Create a `.env` file inside the `backend/` folder:
GROQ_API_KEY=your_groq_api_key_here

Get your free Groq API key at [console.groq.com](https://console.groq.com)

### 4. Run the backend

```bash
uvicorn main:app --reload
```

### 5. Open the frontend

Open `frontend/index.html` with Live Server in VS Code.

---

## Project Structure
scout-by-scaler/
├── backend/
│   ├── main.py          # FastAPI routes
│   ├── analyzer.py      # Resume analysis + Groq integration
│   ├── prompts.py       # AI prompt templates
│   └── requirements.txt
├── frontend/
│   ├── index.html       # Main UI
│   ├── styles.css       # Styling
│   └── app.js           # Frontend logic
└── README.md

---

## How It Works

1. User selects target role and experience level
2. Uploads resume PDF + optional job description
3. Backend extracts text using PyMuPDF
4. Groq LLaMA 3.3 70B analyzes resume against role requirements
5. Returns ATS score, keyword gaps, issues, and Scaler course recommendations
6. User can chat with Scaler Talent Copilot for personalized career advice

---

## Built By

**Satyam Anand** — [GitHub](https://github.com/ChaiandCode) · [LinkedIn](https://linkedin.com/in/satyam-anand)

· KIIT University · Building things that matter.

---

> Built with FastAPI + Groq LLaMA · Deployed on Render + Vercel