
  # Medical Dashboard Prototype

  This is a code bundle for Medical Dashboard Prototype. The original project is available at https://www.figma.com/design/WLFp2lNkhfrF8f7wsLjPBw/Medical-Dashboard-Prototype.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  
  # Medical Dashboard Prototype

  This is a code bundle for Medical Dashboard Prototype. The original project is available at https://www.figma.com/design/WLFp2lNkhfrF8f7wsLjPBw/Medical-Dashboard-Prototype.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  

  Here’s a **clean, professional `README.md`** you can include in your GitHub repository
(`cxr-qc-prototype/README.md`) — it clearly explains setup, backend connection, and usage.

---

```markdown
# 🩺 CXR Quality Control (Prototype)

A full-stack prototype for **automatic chest X-ray quality control**, combining a FastAPI backend with a React + Vite frontend.

This system allows authenticated users to:
- Upload and manage scan records
- Run quality-control (QC) analysis
- Generate and download detailed PDF reports
- View analytics dashboards

---

## 🚀 Tech Stack

| Component | Technology |
|------------|-------------|
| **Frontend** | React + TypeScript + Vite + TailwindCSS |
| **Backend** | FastAPI (Python 3.10+) |
| **Database** | SQLite (default) |
| **Auth** | JWT-based authentication |
| **Reports** | PDF generation via FastAPI |

---

## 🗂 Project Structure

```

cxr-qc-prototype/
│
├── src/
│   ├── components/
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── ImageViewerPage.tsx
│   │   ├── QCReportPage.tsx
│   │   └── AnalyticsPage.tsx
│   ├── styles/
│   ├── main.tsx
│   └── App.tsx
│
├── .env
├── package.json
├── vite.config.ts
└── README.md

```

Backend (separate project):
```

AutoQC-Chest-Xray-main/
├── backend/
│   ├── main.py
│   ├── auth.py
│   ├── db.py
│   ├── models.py
│   └── routers/
│       ├── reports.py
│       └── records.py

````

---

## ⚙️ Prerequisites

Before running this project, make sure you have:

- Node.js **v18+**
- Python **v3.10+**
- pip or pipenv/venv
- Git

---

## 🧩 Backend Setup (FastAPI)

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

✅ API will be available at:
[http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI)

---

## 💻 Frontend Setup (React + Vite)

1. Clone this repo:

```bash
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

✅ App will run on
[http://localhost:5174](http://localhost:5174)

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

## 🧠 Common Issues

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

## 📦 Build for Production

```bash
npm run build
```

Then deploy the built files from `dist/`.

---

## 🧑‍💻 Contributors

* **Alima Kassenkazy** — Frontend Integration & UI
* Backend reference: [AutoQC-Chest-Xray](https://github.com/KaminurOrynbek/AutoQC-Chest-Xray)

---

## 🏁 License

This project is released under the MIT License.

```

---

Would you like me to make a **shorter README (1-screen summary)** for GitHub’s main page too (e.g., with emojis and badges at the top)? It’s great for presentation.
```
