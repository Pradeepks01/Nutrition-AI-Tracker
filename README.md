# 🥗 FitTrack AI – Nutrition-AI-Tracker

**FitTrack AI** is a fully responsive, AI-powered nutrition tracking platform that automates meal logging via image analysis. It provides daily food logging, macro distribution, nutrition tips, and structured JSON output for easy integration.

---

## 🚀 Live Demo

🔗 [nutrition-ai-tracker.vercel.app](https://nutrition-ai-tracker.vercel.app)

---

## 🎨 Frontend Features

- 🌑 **Dark Theme UI** – Clean, modern interface with responsive layout  
- 🔐 **User Authentication** – Login and register with JWT token handling  
- 🍽️ **Daily Food Log** – Add meals manually or via AI food scanner  
- 🥗 **Macro Distribution** – Visual breakdown of protein, carbs, fats, and calories  
- 💡 **Nutrition Tips** – Daily personalized nutrition recommendations  
- 🤖 **Nutrition AI Analyzer** – AI-powered food image analysis via **Vision-Language Model (VLM)**  
- 📤 **JSON Output** – Structured output for easy frontend integration  

---

## 🧠 Backend Features

- ⚙️ **Flask Server** – Handles AI food recognition and meal logging  
- 🧠 **VLM & Gemini AI Integration** – Advanced food image analysis, portion estimation, and nutritional breakdown  
- 🛡️ **JWT Authentication** – Secure login system with password hashing  
- 💾 **SQLite Database** – Persistent storage for all user data  
- 📤 **Structured JSON Output** – Consistent data format for frontend consumption  

---

## 📸 Screenshots

https://github.com/Pradeepks01/Nutrition-AI-Tracker/tree/d7913de3119fc840e3d960159a5206445123eec5/frontend/assets 

---

## 🔧 Getting Started

### 🖥️ Frontend (React + Vite + TailwindCSS)

```bash
cd frontend
npm install
npm run dev
```
---

### 🔁 Backend (Flask + VLM + Gemini AI + SQLite)

Only needed if you want real AI food scanning and persistence.

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your API keys:
# GEMINI_API_KEY=<your-google-gemini-api-key>
python app.py
```
---

### 🌍 Environment Variables (`.env` for backend)

```env
# Google Gemini API Configuration
GEMINI_API_KEY=your-gemini-key

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your-very-secret-key

# Database Configuration
DATABASE_URL=sqlite:///fittrack.db

```
