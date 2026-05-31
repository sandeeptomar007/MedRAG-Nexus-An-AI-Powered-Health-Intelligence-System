# MedRAG — AI-Powered Medical Health Assistant

A privacy-first health assistant that combines a **Retrieval-Augmented Generation (RAG)** pipeline with a clean, modern web interface. All data stays on your machine.

```
medrag/
├── frontend/
│   ├── index.html      ← Open this in your browser
│   ├── style.css
│   └── script.js
│
├── backend/
│   ├── main.py         ← FastAPI server (RAG pipeline)
│   ├── requirements.txt
│   └── data/           ← ⚠️ PUT YOUR MEDICAL PDFs HERE
│
└── README.md
```

---

## 🚀 Quick Start

### Step 1 — Add Your Medical PDFs

Place your medical reference PDFs inside `backend/data/`.  
Example sources:
- Gale Encyclopedia of Medicine (what the notebook used)
- MSD Manual PDFs
- Any verified clinical reference PDFs

### Step 2 — Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

> **Note:** First run will download ~500MB of model weights (MiniLM embeddings + Flan-T5).  
> Subsequent runs are fast as weights are cached.

### Step 3 — Start the Backend

```bash
cd backend
python main.py
```

You should see:
```
INFO:     Loading 1 PDF(s) from ./data…
INFO:     Split into 842 chunks.
INFO:     Vector store ready.
INFO:     LLM ready.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 4 — Open the Frontend

Simply open `frontend/index.html` in your browser.  
No build step required — it's pure HTML/CSS/JS.

---

## 🔌 API Reference

The backend exposes two endpoints:

### `GET /health`
Returns pipeline status.
```json
{ "status": "ok", "pipeline_ready": true }
```

### `POST /analyze`
```json
{
  "symptom": "I have a headache and mild fever for 2 days",
  "duration": "1-3_days"
}
```
Returns:
```json
{
  "response": "Based on your symptoms...\n\n⚠️ Disclaimer: ...",
  "sources_used": 3
}
```

---

## ⚙️ Architecture

```
User  →  frontend/index.html
            │  POST /analyze
            ▼
         FastAPI (main.py)
            │
            ├── FAISS VectorStore  ←  Chunked medical PDFs
            │        │ top-3 semantic matches
            ▼
         Flan-T5 (local LLM)
            │  generates answer from context
            ▼
         JSON response  →  Browser
```

**Models used:**
| Component   | Model                                    | Size   |
|-------------|------------------------------------------|--------|
| Embeddings  | `sentence-transformers/all-MiniLM-L6-v2` | ~90MB  |
| LLM         | `google/flan-t5-base`                    | ~250MB |
| Vector DB   | FAISS (in-memory)                        | local  |

---

## 🔒 Privacy

- All processing happens on `localhost`
- No data is sent to external servers
- No API keys required
- Symptoms are never logged or stored

---

## 🩺 Disclaimer

MedRAG is for **educational purposes only**.  
It is **not** a substitute for professional medical advice, diagnosis, or treatment.  
Always consult a qualified healthcare provider.
