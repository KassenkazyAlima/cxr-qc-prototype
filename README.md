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

## Frontend Setup (React + Vite)

1. Clone this repo:
   ```bash
   git clone https://github.com/KassenkazyAlima/cxr-qc-prototype.git
   cd cxr-qc-prototype

2. Install dependencies:npm install

3. Create a .env file in the root directory:VITE_API_BASE_URL=http://localhost:8000

4. Start the frontend:npm run dev

✅ App will run on http://localhost:5174

## Backend Link (FastAPI) : https://github.com/KaminurOrynbek/AutoQC-Chest-Xray/tree/main/backend
 
✅ API will be available at http://localhost:8000/docs (Swagger UI)

🔐 Default Login
After seeding the database, use:
Username: admin
Password: password


🧠 Common Issues
1. Cannot log in / 422 Unprocessable Content

➡ Check that backend /auth/login expects form data or query params.Frontend uses JSON POST (username, password).


2. CORS errors
➡ Ensure FastAPI includes:
from fastapi.middleware.cors import CORSMiddleware

    ```bash 
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
    ```bash 
    npm run build
Then deploy the built files from dist/.
