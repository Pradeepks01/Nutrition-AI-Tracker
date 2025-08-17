# 🥗 Nutrition-AI-Tracker

**Nutrition-AI-Tracker** is a beautiful, fully responsive nutrition tracking platform with AI-powered food analysis, water tracking, streak building, and detailed analytics – designed for modern users and ready for production.

---

## 🚀 Live Demo

🔗 [nutrition-ai-tracker.vercel.app](https://nutrition-ai-tracker.vercel.app)

---

## 🎨 Frontend Features

- 🌑 **Dark Theme UI** – Clean, modern interface with responsive layout  
- 🔐 **User Authentication** – Login and register with JWT token handling  
- 📊 **Dashboard** – Visual summary of daily calories, macros, and water  
- 🤖 **AI Food Scanner** – Upload food images and analyze (backend ready)  
- 📈 **Analytics Dashboard** – Track nutrition trends and top foods  
- 💧 **Water Intake Tracker** – Animated bottle with daily goals  
- 🔥 **Streak Tracking** – Build healthy habits with gamification  
- 📱 **Fully Responsive** – Works seamlessly on mobile, tablet, and desktop  

---

## 🧠 Backend Ready (Optional)

Run Flask backend for full AI food recognition and real-time database logging.

- ⚙️ **Flask Server** – Google Gemini AI integration for food image analysis  
- 🧠 **Gemini & USDA API** – Advanced food recognition and nutritional data  
- 🛡️ **JWT Auth** – Secure login system with password hashing  
- 💾 **SQLite Database** – Persistent storage for all user data  
- 📤 **Structured Output** – Consistent, clean JSON for frontend integration  

---

## ✅ Key Features Working

- ✅ User Auth – Register, login, secure session handling  
- ✅ Nutrition Dashboard – View daily intake and      macronutrients  
- ✅ Food Logging – Add meals manually or with AI  
- ✅ Water Tracker – Visual progress with interactive bottle  
- ✅ Analytics – Weekly, monthly insights and trends  
- ✅ Streaks – Track your consistency and build habits  
- ✅ Responsive UI – Optimized for all screen sizes  

---

## 🔧 Getting Started

### 🖥️ Frontend (React + Vite + TailwindCSS)

```bash
cd frontend
npm install
npm run dev
```

🌐 **Deployed to Vercel**: [nutrition-ai-tracker.vercel.app](https://nutrition-ai-tracker.vercel.app)

---

### 🔁 Backend (Flask + Gemini AI + SQLite)

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

# USDA Food Database API Key (optional but recommended)
USDA_API_KEY=your-usda-api-key

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your-very-secret-key

# Database Configuration (SQLite used by default)
DATABASE_URL=sqlite:///fittrack.db
```

---

## 📽️ Demo Video

Watch a quick demo of **Nutrition-AI-Tracker** in action:

➡️ [Click to watch the video](https://github.com/Pradeepks01/Nutrition-AI-Tracker/blob/main/frontend/assets/Screencast%20from%202025-08-17%2014-29-08.webm)

> (Right-click and select **"Open in new tab"** or **"Save video as..."** if it doesn't play directly)

