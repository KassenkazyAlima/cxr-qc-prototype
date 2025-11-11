  
---

```markdown
# CXR Quality Control (Prototype)

A prototype for **automatic chest X-ray quality control**, combining a FastAPI backend with a React + Vite frontend.

This system allows authenticated users to:
- Upload and manage scan records
- Run quality-control (QC) analysis
- Generate and download detailed PDF reports
- View analytics dashboards

## Prerequisites

Before running this project, make sure you have:

- Node.js **v18+**
- Python **v3.10+**
- pip or pipenv/venv
- Git

## Frontend Setup (React + Vite)

1. Clone this repo:

```
git clone https://github.com/KassenkazyAlima/cxr-qc-prototype.git
cd cxr-qc-prototype
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

4. Start the frontend:

```bash
npm run dev
```

App will run on
[http://localhost:5174](http://localhost:5174)



## Backend Setup (FastAPI)

1. Navigate to your backend folder:

```bash
cd /path/to/AutoQC-Chest-Xray-main
````

2. Create and activate a virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate   # Mac/Linux
.venv\Scripts\activate      # Windows
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. (Optional) Seed initial admin data:

```bash
python backend/seed.py
```

5. Start the backend:

```bash
uvicorn backend.main:app --reload --port 8000
```

API will be available at:
[http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI)

---

## 🔐 Default Login

After seeding the database, use:

```
Username: admin
Password: password
```

---

## 📄 Features

| Feature       | Description                         |
| ------------- | ----------------------------------- |
| **Login**     | Secure JWT authentication           |
| **Dashboard** | Displays patient QC records         |
| **QC Viewer** | Visualizes X-ray image with metrics |
| **Reports**   | Generates downloadable PDF report   |
| **Analytics** | Summary charts of QC statistics     |

---

## Common Issues

### 1. Cannot log in / `422 Unprocessable Content`

➡ Check that backend `/auth/login` expects form data or query params.
Frontend uses JSON POST (`username`, `password`).

### 2. CORS errors

➡ Ensure FastAPI includes:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. `.env` not working in Vite

➡ Ensure you restart `npm run dev` after creating `.env`.

---

## Build for Production

```bash
npm run build
```

Then deploy the built files from `dist/`.

---
