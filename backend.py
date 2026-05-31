
# from fastapi import FastAPI
# from pydantic import BaseModel
# import requests
# import os


# app = FastAPI()

# # 🔐 Store API key safely 
# from dotenv import load_dotenv
# load_dotenv()

# GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# class Query(BaseModel):
#     symptom: str
#     duration: str

# @app.post("/analyze")
# def analyze(data: Query):
#     prompt = f"""
#     Patient symptoms: {data.symptom}
#     Duration: {data.duration}

#     Provide a medical explanation, possible causes, and advice.
#     """

#     response = requests.post(
#         "https://api.groq.com/openai/v1/chat/completions",
#         headers={
#             "Authorization": f"Bearer {GROQ_API_KEY}",
#             "Content-Type": "application/json"
#         },
#         json={
#             "model": "llama3-70b-8192",
#             "messages": [
#                 {"role": "user", "content": prompt}
#             ]
#         }
#     )

#     result = response.json()

#     return {
#         "response": result["choices"][0]["message"]["content"]
#     }

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# ✅ CORS FIX
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

class Query(BaseModel):
    symptom: str
    duration: str

@app.post("/analyze")
def analyze(data: Query):
    prompt = f"""
    Patient symptoms: {data.symptom}
    Duration: {data.duration}
    Give medical advice with precautions.
    """

    response = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": "llama-3.3-70b-versatile",
            "messages": [{"role": "user", "content": prompt}]
        }
    )

    result = response.json()

    return {
        "response": result["choices"][0]["message"]["content"]
    }