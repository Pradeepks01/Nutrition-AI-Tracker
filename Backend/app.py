from flask import Flask, request, jsonify, session
from flask_cors import CORS
import os
import base64
import google.generativeai as genai
from dotenv import load_dotenv
import json
import re
from werkzeug.utils import secure_filename
import sqlite3
from datetime import datetime, timedelta
from PIL import Image
import cv2
import numpy as np

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = os.getenv("SECRET_KEY", "your-secret-key-change-this")

UPLOAD_FOLDER = 'static/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("⚠️  Warning: GEMINI_API_KEY not found")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def encode_image(image_path):
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

def generate_nutrition_tip(calories, protein, carbs, fat):
    """Generate smart nutrition tips based on macros"""
    total_macros = protein * 4 + carbs * 4 + fat * 9
    
    if total_macros == 0:
        return "Add more variety to your meals for better nutrition balance."
    
    protein_pct = (protein * 4 / total_macros) * 100
    carbs_pct = (carbs * 4 / total_macros) * 100
    fat_pct = (fat * 9 / total_macros) * 100
    
    # High carb, low fat
    if carbs > 100 and fat < 10:
        return "High in carbohydrates and low in fats. Great for pre-workout energy, but consider pairing with a protein or fat source for better macronutrient balance."
    
    # High protein
    elif protein > 30:
        return "Rich in protein — excellent for muscle recovery and satiety! This will help keep you full longer."
    
    # High fat
    elif fat > 25:
        return "High fat content — great for sustained energy, but keep portions moderate if managing calories."
    
    # Balanced meal
    elif 20 <= protein_pct <= 35 and 45 <= carbs_pct <= 65 and 20 <= fat_pct <= 35:
        return "Well-balanced macronutrient profile! This combination supports steady energy and satiety."
    
    # Low protein
    elif protein < 10:
        return "Consider adding more protein to this meal for better muscle support and satiety."
    
    # High calorie
    elif calories > 600:
        return "High-calorie meal — great for active days or post-workout recovery. Balance with lighter meals if needed."
    
    # Low calorie
    elif calories < 200:
        return "Light meal option — perfect for snacking or if you're managing portion sizes."
    
    else:
        return "Good nutritional choice! Try to include a variety of colorful foods for optimal micronutrient intake."

def get_nutrition_info_vlm(image_path=None, text_description=None):
    """Advanced VLM nutrition analysis with clean JSON output"""
    if not GEMINI_API_KEY:
        return create_fallback_response(text_description or "Image analysis")
    
    model = genai.GenerativeModel("gemini-1.5-flash")
    
    # Enhanced prompt for clean, accurate nutrition estimation
    vlm_prompt = """
    You are FitTrack AI, an expert nutrition analyst. Analyze the food and provide accurate nutritional estimates.

    CRITICAL INSTRUCTIONS:
    1. Generate realistic nutritional estimates based on visual analysis
    2. Consider portion sizes, cooking methods, and ingredients carefully
    3. Output MUST be valid JSON in this EXACT format (no extra fields):

    {
        "food_description": "Detailed description of the food item(s)",
        "calories": 350,
        "protein_grams": 20,
        "carb_grams": 40,
        "fat_grams": 10,
        "quantity": 1,
        "unit": "serving",
        "confidence": 0.85
    }

    ESTIMATION GUIDELINES:
    - Be conservative but realistic with portions
    - Account for cooking oils, sauces, and hidden ingredients
    - Consider typical serving sizes for the food type
    - Confidence should reflect your certainty (0.6-0.95 range)

    EXAMPLE ESTIMATES:
    - Banana (medium): ~105 calories, 1g protein, 27g carbs, 0.3g fat
    - Grilled chicken breast (6oz): ~280 calories, 52g protein, 0g carbs, 6g fat
    - Rice bowl (1 cup cooked): ~200 calories, 4g protein, 45g carbs, 0.5g fat

    Analyze the input and provide accurate custom estimates:
    """

    try:
        if image_path:
            encoded_image = encode_image(image_path)
            response = model.generate_content([
                {
                    "parts": [
                        {"text": vlm_prompt},
                        {
                            "inline_data": {
                                "mime_type": "image/jpeg",
                                "data": encoded_image
                            }
                        }
                    ]
                }
            ])
        else:
            text_prompt = vlm_prompt + f"\n\nFood Description: {text_description}"
            response = model.generate_content(text_prompt)
        
        response_text = response.text.strip()
        
        # Extract JSON from response
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            json_str = json_match.group()
            try:
                nutrition_data = json.loads(json_str)
                
                # Validate and clean required fields
                required_fields = ['food_description', 'calories', 'protein_grams', 'carb_grams', 'fat_grams', 'quantity', 'unit', 'confidence']
                for field in required_fields:
                    if field not in nutrition_data:
                        if field == 'food_description':
                            nutrition_data[field] = text_description or "Unknown food"
                        elif field == 'unit':
                            nutrition_data[field] = "serving"
                        elif field == 'confidence':
                            nutrition_data[field] = 0.75
                        else:
                            nutrition_data[field] = 0
                
                # Ensure numeric values
                for field in ['calories', 'protein_grams', 'carb_grams', 'fat_grams', 'quantity', 'confidence']:
                    if field in nutrition_data:
                        try:
                            nutrition_data[field] = float(nutrition_data[field])
                        except (ValueError, TypeError):
                            nutrition_data[field] = 0 if field != 'confidence' else 0.75
                
                return nutrition_data
                
            except json.JSONDecodeError as e:
                print(f"JSON parsing error: {e}")
                return create_fallback_response(text_description or "Image analysis")
        
        return create_fallback_response(text_description or "Image analysis")
        
    except Exception as e:
        print(f"VLM Analysis Error: {e}")
        return create_fallback_response(text_description or "Image analysis")

def create_fallback_response(description):
    """Create fallback response with realistic estimates"""
    return {
        "food_description": description,
        "calories": 300,
        "protein_grams": 15,
        "carb_grams": 35,
        "fat_grams": 12,
        "quantity": 1,
        "unit": "serving",
        "confidence": 0.6
    }

# Database initialization
def init_db():
    conn = sqlite3.connect('fittrack.db')
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Daily nutrition table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS daily_nutrition (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            date DATE NOT NULL,
            total_calories REAL DEFAULT 0,
            total_protein REAL DEFAULT 0,
            total_carbs REAL DEFAULT 0,
            total_fat REAL DEFAULT 0,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Food entries table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS food_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            date DATE NOT NULL,
            food_description TEXT NOT NULL,
            calories REAL NOT NULL,
            protein_grams REAL NOT NULL,
            carb_grams REAL NOT NULL,
            fat_grams REAL NOT NULL,
            quantity REAL NOT NULL,
            unit TEXT NOT NULL,
            confidence REAL,
            image_filename TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    conn.commit()
    conn.close()

# Initialize database
init_db()

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy", 
        "message": "FitTrack AI Backend is running",
        "version": "4.0.0",
        "gemini_configured": bool(GEMINI_API_KEY),
        "features": ["Clean JSON Output", "Auto Nutrition Tips", "Daily Totals Update"]
    })

@app.route('/api/analyze-food', methods=['POST'])
def analyze_food():
    """Analyze food via photo upload or text description"""
    try:
        # Check if it's a photo upload
        if 'image' in request.files:
            file = request.files['image']
            if file.filename == '':
                return jsonify({"error": "No file selected"}), 400
            
            if not allowed_file(file.filename):
                return jsonify({"error": "Invalid file type. Please upload an image."}), 400
            
            # Save uploaded image
            filename = secure_filename(file.filename)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{timestamp}_{filename}"
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # Analyze with VLM
            nutrition_data = get_nutrition_info_vlm(image_path=filepath)
            
            # Generate nutrition tip
            tip = generate_nutrition_tip(
                nutrition_data['calories'],
                nutrition_data['protein_grams'],
                nutrition_data['carb_grams'],
                nutrition_data['fat_grams']
            )
            
            # Add tip to response
            nutrition_data['nutrition_tip'] = tip
            
        # Check if it's text description
        elif request.json and 'description' in request.json:
            description = request.json['description']
            if not description.strip():
                return jsonify({"error": "Description cannot be empty"}), 400
            
            # Analyze with VLM
            nutrition_data = get_nutrition_info_vlm(text_description=description)
            
            # Generate nutrition tip
            tip = generate_nutrition_tip(
                nutrition_data['calories'],
                nutrition_data['protein_grams'],
                nutrition_data['carb_grams'],
                nutrition_data['fat_grams']
            )
            
            nutrition_data['nutrition_tip'] = tip
            
        else:
            return jsonify({"error": "Please provide either an image or text description"}), 400
        
        return jsonify(nutrition_data)
        
    except Exception as e:
        print(f"Error in analyze_food: {e}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/api/add-food', methods=['POST'])
def add_food():
    """Add food entry and update daily totals"""
    try:
        data = request.get_json()
        user_id = 1  # Demo user
        today = datetime.now().date()
        
        conn = sqlite3.connect('fittrack.db')
        cursor = conn.cursor()
        
        # Add food entry
        cursor.execute('''
            INSERT INTO food_entries 
            (user_id, date, food_description, calories, protein_grams, carb_grams, fat_grams, quantity, unit, confidence)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_id, today, data['food_description'], data['calories'],
            data['protein_grams'], data['carb_grams'], data['fat_grams'],
            data['quantity'], data['unit'], data.get('confidence', 0.75)
        ))
        
        # Update daily totals
        cursor.execute('''
            INSERT OR REPLACE INTO daily_nutrition 
            (user_id, date, total_calories, total_protein, total_carbs, total_fat)
            VALUES (?, ?, 
                COALESCE((SELECT total_calories FROM daily_nutrition WHERE user_id = ? AND date = ?), 0) + ?,
                COALESCE((SELECT total_protein FROM daily_nutrition WHERE user_id = ? AND date = ?), 0) + ?,
                COALESCE((SELECT total_carbs FROM daily_nutrition WHERE user_id = ? AND date = ?), 0) + ?,
                COALESCE((SELECT total_fat FROM daily_nutrition WHERE user_id = ? AND date = ?), 0) + ?
            )
        ''', (
            user_id, today, user_id, today, data['calories'],
            user_id, today, data['protein_grams'],
            user_id, today, data['carb_grams'],
            user_id, today, data['fat_grams']
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            "success": True,
            "message": "Food added successfully and daily totals updated"
        })
        
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/api/daily-nutrition', methods=['GET'])
def get_daily_nutrition():
    """Get daily nutrition totals"""
    try:
        user_id = 1  # Demo user
        date = request.args.get('date', datetime.now().date().isoformat())
        
        conn = sqlite3.connect('fittrack.db')
        cursor = conn.cursor()
        
        # Get daily totals
        cursor.execute('''
            SELECT total_calories, total_protein, total_carbs, total_fat
            FROM daily_nutrition 
            WHERE user_id = ? AND date = ?
        ''', (user_id, date))
        
        result = cursor.fetchone()
        
        if result:
            nutrition = {
                "calories": result[0] or 0,
                "protein": result[1] or 0,
                "carbs": result[2] or 0,
                "fat": result[3] or 0
            }
        else:
            nutrition = {"calories": 0, "protein": 0, "carbs": 0, "fat": 0}
        
        # Get food entries for the day
        cursor.execute('''
            SELECT food_description, calories, protein_grams, carb_grams, fat_grams, quantity, unit, created_at
            FROM food_entries 
            WHERE user_id = ? AND date = ?
            ORDER BY created_at DESC
        ''', (user_id, date))
        
        entries = cursor.fetchall()
        food_entries = []
        for entry in entries:
            food_entries.append({
                "food_description": entry[0],
                "calories": entry[1],
                "protein_grams": entry[2],
                "carb_grams": entry[3],
                "fat_grams": entry[4],
                "quantity": entry[5],
                "unit": entry[6],
                "timestamp": entry[7]
            })
        
        conn.close()
        
        return jsonify({
            "date": date,
            "nutrition": nutrition,
            "food_entries": food_entries,
            "goals": {
                "calories": 2829,
                "protein": 150,
                "carbs": 250,
                "fat": 65
            }
        })
        
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

if __name__ == "__main__":
    print("🚀 Starting FitTrack AI Backend...")
    print(f"🔑 Gemini API Key: {'✅ Configured' if GEMINI_API_KEY else '❌ Missing'}")
    print("🎯 Features: Clean JSON, Auto Tips, Daily Updates")
    app.run(debug=True, host='0.0.0.0', port=5000)