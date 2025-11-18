# 🩺 CXR Quality Control (Prototype)

A full-stack prototype for **automatic chest X-ray quality control**, combining a FastAPI backend with a React + Vite frontend.

This system allows authenticated users to:
- Upload and manage scan records
- Run quality-control (QC) analysis
- Generate and download detailed PDF reports
- View analytics dashboards

---

## 🚀 Tech Stack

| Component   | Technology                        |
|-------------|-----------------------------------|
| **Frontend** | React + TypeScript + Vite + TailwindCSS |
| **Backend**  | FastAPI (Python 3.10+)           |
| **Database** | SQLite (default)                 |
| **Auth**     | JWT-based authentication         |
| **Reports**  | PDF generation via FastAPI       |

---

## ⚙️ Prerequisites

Before running this project, make sure you have:

- Node.js **v18+**
- Python **v3.10+**
- pip or pipenv/venv
- Git

---

## 💻 Frontend Setup (React + Vite)

1. Clone this repo:
   ```bash
   git clone https://github.com/KassenkazyAlima/cxr-qc-prototype.git
   cd cxr-qc-prototype

2. Install dependencies:npm install

3. Create a .env file in the root directory:VITE_API_BASE_URL=http://localhost:8000

4. Start the frontend:npm run dev

✅ App will run on http://localhost:5174

🧩 Backend Setup (FastAPI)
1. Navigate to your backend folder:cd /path/to/AutoQC-Chest-Xray-main

2. Create and activate a virtual environment:python -m venv .venv

3. source .venv/bin/activate   # Mac/Linux  '.venv\Scripts\activate'      # Windows

4. Install dependencies:pip install -r requirements.txt
 
5. (Optional) Seed initial admin data:python backend/seed.py
 
6. Start the backend:uvicorn backend.main:app --reload --port 8000
 
✅ API will be available at http://localhost:8000/docs (Swagger UI)

🔐 Default Login
After seeding the database, use:
Username: admin
Password: password

📄 Features
Feature	Description
Login	Secure JWT authentication
Dashboard	Displays patient QC records
QC Viewer	Visualizes X-ray image with metrics
Reports	Generates downloadable PDF report
Analytics	Summary charts of QC statistics
🧠 Common Issues
1. Cannot log in / 422 Unprocessable Content
➡ Check that backend /auth/login expects form data or query params.Frontend uses JSON POST (username, password).
2. CORS errors
➡ Ensure FastAPI includes:
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
3. .env not working in Vite
➡ Ensure you restart npm run dev after creating .env.

📦 Build for Production
npm run build
Then deploy the built files from dist/.

🧑‍💻 Contributors
* Alima Kassenkazy — Frontend Integration & UI
* Backend reference: AutoQC-Chest-Xray
