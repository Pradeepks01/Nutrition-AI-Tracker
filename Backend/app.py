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
import bcrypt
import jwt
from datetime import datetime, timedelta
import requests
from functools import wraps

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True , origins=["http://localhost:5173"])  # Enable CORS with credentials
app.secret_key = os.getenv("SECRET_KEY", "your-secret-key-change-this")

UPLOAD_FOLDER = 'static/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Set your Google API key from environment variable
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# USDA API Configuration
USDA_API_KEY = os.getenv("USDA_API_KEY")
USDA_BASE_URL = "https://api.nal.usda.gov/fdc/v1"

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            daily_calorie_goal INTEGER DEFAULT 2000,
            daily_protein_goal INTEGER DEFAULT 150,
            daily_carb_goal INTEGER DEFAULT 250,
            daily_fat_goal INTEGER DEFAULT 65
        )
    ''')
    
    # Food entries table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS food_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            food_name TEXT NOT NULL,
            calories REAL NOT NULL,
            protein REAL NOT NULL,
            carbs REAL NOT NULL,
            fat REAL NOT NULL,
            fiber REAL DEFAULT 0,
            sugar REAL DEFAULT 0,
            sodium REAL DEFAULT 0,
            serving_size TEXT DEFAULT '1 serving',
            meal_type TEXT DEFAULT 'other',
            date_logged DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            confidence_score REAL DEFAULT 0.8,
            source TEXT DEFAULT 'manual',
            usda_fdc_id INTEGER,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Water intake table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS water_intake (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            amount_ml INTEGER NOT NULL,
            date_logged DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # User sessions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            session_token TEXT UNIQUE NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Food database cache (USDA foods)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS food_database (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fdc_id INTEGER UNIQUE NOT NULL,
            description TEXT NOT NULL,
            brand_name TEXT,
            calories_per_100g REAL,
            protein_per_100g REAL,
            carbs_per_100g REAL,
            fat_per_100g REAL,
            fiber_per_100g REAL,
            sugar_per_100g REAL,
            sodium_per_100g REAL,
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

# Authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, app.secret_key, algorithms=['HS256'])
            current_user_id = data['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token is invalid'}), 401
        
        return f(current_user_id, *args, **kwargs)
    return decorated

# Encode image to base64
def encode_image(image_path):
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

def get_nutrition_info_advanced(image_path):
    """Advanced AI nutrition analysis with fine-tuned prompts"""
    model = genai.GenerativeModel("gemini-1.5-flash")
    encoded_image = encode_image(image_path)

    prompt = """
    You are a professional nutritionist and food recognition expert. Analyze this food image with high precision and provide detailed nutritional information.
    
    Instructions:
    1. Identify ALL food items visible in the image
    2. Estimate portion sizes accurately (use common serving sizes as reference)
    3. Calculate nutritional values per serving
    4. Provide confidence score based on image clarity and food recognition certainty
    5. Include micronutrients when possible
    
    Return ONLY valid JSON in this exact format:
    {
        "food_description": "Detailed description of all food items",
        "calories": 0,
        "protein_grams": 0.0,
        "carb_grams": 0.0,
        "fat_grams": 0.0,
        "fiber_grams": 0.0,
        "sugar_grams": 0.0,
        "sodium_mg": 0.0,
        "quantity": 1.0,
        "unit": "serving",
        "confidence": 0.85,
        "ingredients": ["ingredient1", "ingredient2"],
        "portion_size": "medium",
        "meal_type": "breakfast/lunch/dinner/snack",
        "cooking_method": "grilled/fried/baked/raw",
        "estimated_weight_grams": 0
    }
    
    Be as accurate as possible. If multiple items, provide combined totals.
    """

    try:
        response = model.generate_content([
            {
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": "image/jpeg",
                            "data": encoded_image
                        }
                    }
                ]
            }
        ])
        
        # Extract JSON from response
        response_text = response.text.strip()
        
        # Try to find JSON in the response
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            json_str = json_match.group()
            try:
                nutrition_data = json.loads(json_str)
                return nutrition_data
            except json.JSONDecodeError:
                pass
        
        # If JSON parsing fails, return a structured error
        return {
            "error": "Failed to parse nutrition data",
            "raw_response": response_text,
            "food_description": "Unknown food item",
            "calories": 0,
            "protein_grams": 0.0,
            "carb_grams": 0.0,
            "fat_grams": 0.0,
            "fiber_grams": 0.0,
            "sugar_grams": 0.0,
            "sodium_mg": 0.0,
            "quantity": 1.0,
            "unit": "serving",
            "confidence": 0.0
        }
        
    except Exception as e:
        return {
            "error": str(e),
            "food_description": "Error analyzing image",
            "calories": 0,
            "protein_grams": 0.0,
            "carb_grams": 0.0,
            "fat_grams": 0.0,
            "fiber_grams": 0.0,
            "sugar_grams": 0.0,
            "sodium_mg": 0.0,
            "quantity": 1.0,
            "unit": "serving",
            "confidence": 0.0
        }

def search_usda_foods(query, limit=20):
    """Search USDA Food Database"""
    if not USDA_API_KEY:
        return []
    
    try:
        url = f"{USDA_BASE_URL}/foods/search"
        params = {
            'query': query,
            'dataType': ['Foundation', 'SR Legacy'],
            'pageSize': limit,
            'api_key': USDA_API_KEY
        }
        
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            foods = []
            
            for food in data.get('foods', []):
                # Extract nutrients
                nutrients = {n['nutrientName']: n.get('value', 0) for n in food.get('foodNutrients', [])}
                
                food_item = {
                    'fdc_id': food.get('fdcId'),
                    'description': food.get('description', ''),
                    'brand_name': food.get('brandOwner', ''),
                    'calories': nutrients.get('Energy', 0),
                    'protein': nutrients.get('Protein', 0),
                    'carbs': nutrients.get('Carbohydrate, by difference', 0),
                    'fat': nutrients.get('Total lipid (fat)', 0),
                    'fiber': nutrients.get('Fiber, total dietary', 0),
                    'sugar': nutrients.get('Sugars, total including NLEA', 0),
                    'sodium': nutrients.get('Sodium, Na', 0)
                }
                foods.append(food_item)
            
            return foods
    except Exception as e:
        print(f"USDA API Error: {e}")
        return []

# API Routes

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "FitTrack AI Backend is running"})

# Authentication Routes
@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        if not all([username, email, password]):
            return jsonify({"error": "Missing required fields"}), 400
        
        # Hash password
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        conn = sqlite3.connect('fittrack.db')
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO users (username, email, password_hash)
                VALUES (?, ?, ?)
            ''', (username, email, password_hash))
            
            user_id = cursor.lastrowid
            conn.commit()
            
            # Generate JWT token
            token = jwt.encode({
                'user_id': user_id,
                'exp': datetime.utcnow() + timedelta(days=30)
            }, app.secret_key, algorithm='HS256')
            
            return jsonify({
                "success": True,
                "message": "User registered successfully",
                "token": token,
                "user": {
                    "id": user_id,
                    "username": username,
                    "email": email
                }
            })
            
        except sqlite3.IntegrityError:
            return jsonify({"error": "Username or email already exists"}), 400
        finally:
            conn.close()
            
    except Exception as e:
        return jsonify({"error": f"Registration failed: {str(e)}"}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not all([username, password]):
            return jsonify({"error": "Missing username or password"}), 400
        
        conn = sqlite3.connect('fittrack.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, username, email, password_hash, daily_calorie_goal, 
                   daily_protein_goal, daily_carb_goal, daily_fat_goal
            FROM users WHERE username = ? OR email = ?
        ''', (username, username))
        
        user = cursor.fetchone()
        conn.close()
        
        if user and bcrypt.checkpw(password.encode('utf-8'), user[3].encode('utf-8')):
            # Generate JWT token
            token = jwt.encode({
                'user_id': user[0],
                'exp': datetime.utcnow() + timedelta(days=30)
            }, app.secret_key, algorithm='HS256')
            
            return jsonify({
                "success": True,
                "token": token,
                "user": {
                    "id": user[0],
                    "username": user[1],
                    "email": user[2],
                    "goals": {
                        "calories": user[4],
                        "protein": user[5],
                        "carbs": user[6],
                        "fat": user[7]
                    }
                }
            })
        else:
            return jsonify({"error": "Invalid credentials"}), 401
            
    except Exception as e:
        return jsonify({"error": f"Login failed: {str(e)}"}), 500

@app.route('/api/analyze-food', methods=['POST'])
@token_required
def analyze_food(current_user_id):
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        if not allowed_file(file.filename):
            return jsonify({"error": "Invalid file type. Please upload an image."}), 400
        
        # Secure filename and save
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Analyze the image with advanced AI
        nutrition_data = get_nutrition_info_advanced(filepath)
        
        # Clean up uploaded file
        try:
            os.remove(filepath)
        except:
            pass
        
        return jsonify(nutrition_data)
        
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/api/food-database', methods=['GET'])
@token_required
def search_food_database(current_user_id):
    """Enhanced food database search with USDA integration"""
    query = request.args.get('q', '')
    
    # Search USDA database first
    usda_foods = search_usda_foods(query, limit=10)
    
    # Mock local foods (you can expand this)
    local_foods = [
        {"id": 1, "name": "Grilled Chicken Breast", "calories": 231, "protein": 43.5, "carbs": 0, "fat": 5, "source": "local"},
        {"id": 2, "name": "Brown Rice (1 cup)", "calories": 216, "protein": 5, "carbs": 45, "fat": 1.8, "source": "local"},
        {"id": 3, "name": "Salmon Fillet", "calories": 206, "protein": 22, "carbs": 0, "fat": 12, "source": "local"},
        {"id": 4, "name": "Greek Yogurt", "calories": 100, "protein": 17, "carbs": 6, "fat": 0, "source": "local"},
        {"id": 5, "name": "Avocado", "calories": 234, "protein": 3, "carbs": 12, "fat": 21, "source": "local"},
        {"id": 6, "name": "Sweet Potato", "calories": 112, "protein": 2, "carbs": 26, "fat": 0.1, "source": "local"},
    ]
    
    if query:
        filtered_local = [food for food in local_foods if query.lower() in food['name'].lower()]
        all_foods = usda_foods + filtered_local
    else:
        all_foods = usda_foods + local_foods
    
    return jsonify(all_foods[:20])  # Limit to 20 results

@app.route('/api/add-food', methods=['POST'])
@token_required
def add_food(current_user_id):
    """Add food to user's daily log"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'calories', 'protein', 'carbs', 'fat']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        conn = sqlite3.connect('fittrack.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO food_entries (
                user_id, food_name, calories, protein, carbs, fat,
                fiber, sugar, sodium, serving_size, meal_type, date_logged,
                confidence_score, source, usda_fdc_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            current_user_id,
            data['name'],
            data['calories'],
            data['protein'],
            data['carbs'],
            data['fat'],
            data.get('fiber', 0),
            data.get('sugar', 0),
            data.get('sodium', 0),
            data.get('serving_size', '1 serving'),
            data.get('meal_type', 'other'),
            data.get('date', datetime.now().date()),
            data.get('confidence', 0.8),
            data.get('source', 'manual'),
            data.get('fdc_id')
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            "success": True,
            "message": "Food added successfully",
            "food": data
        })
        
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/api/daily-nutrition', methods=['GET'])
@token_required
def get_daily_nutrition(current_user_id):
    """Get user's daily nutrition summary"""
    try:
        date = request.args.get('date', datetime.now().date())
        
        conn = sqlite3.connect('fittrack.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT 
                SUM(calories) as total_calories,
                SUM(protein) as total_protein,
                SUM(carbs) as total_carbs,
                SUM(fat) as total_fat,
                SUM(fiber) as total_fiber,
                SUM(sugar) as total_sugar,
                SUM(sodium) as total_sodium,
                COUNT(*) as food_count
            FROM food_entries 
            WHERE user_id = ? AND date_logged = ?
        ''', (current_user_id, date))
        
        nutrition = cursor.fetchone()
        
        # Get user goals
        cursor.execute('''
            SELECT daily_calorie_goal, daily_protein_goal, daily_carb_goal, daily_fat_goal
            FROM users WHERE id = ?
        ''', (current_user_id,))
        
        goals = cursor.fetchone()
        conn.close()
        
        return jsonify({
            "date": str(date),
            "nutrition": {
                "calories": nutrition[0] or 0,
                "protein": nutrition[1] or 0,
                "carbs": nutrition[2] or 0,
                "fat": nutrition[3] or 0,
                "fiber": nutrition[4] or 0,
                "sugar": nutrition[5] or 0,
                "sodium": nutrition[6] or 0,
                "food_count": nutrition[7] or 0
            },
            "goals": {
                "calories": goals[0] if goals else 2000,
                "protein": goals[1] if goals else 150,
                "carbs": goals[2] if goals else 250,
                "fat": goals[3] if goals else 65
            }
        })
        
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/api/analytics', methods=['GET'])
@token_required
def get_analytics(current_user_id):
    """Get detailed nutrition analytics and reports"""
    try:
        days = int(request.args.get('days', 7))  # Default to 7 days
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days-1)
        
        conn = sqlite3.connect('fittrack.db')
        cursor = conn.cursor()
        
        # Daily nutrition over time
        cursor.execute('''
            SELECT 
                date_logged,
                SUM(calories) as calories,
                SUM(protein) as protein,
                SUM(carbs) as carbs,
                SUM(fat) as fat,
                COUNT(*) as meals
            FROM food_entries 
            WHERE user_id = ? AND date_logged BETWEEN ? AND ?
            GROUP BY date_logged
            ORDER BY date_logged
        ''', (current_user_id, start_date, end_date))
        
        daily_data = cursor.fetchall()
        
        # Weekly averages
        cursor.execute('''
            SELECT 
                AVG(calories) as avg_calories,
                AVG(protein) as avg_protein,
                AVG(carbs) as avg_carbs,
                AVG(fat) as avg_fat
            FROM (
                SELECT 
                    date_logged,
                    SUM(calories) as calories,
                    SUM(protein) as protein,
                    SUM(carbs) as carbs,
                    SUM(fat) as fat
                FROM food_entries 
                WHERE user_id = ? AND date_logged BETWEEN ? AND ?
                GROUP BY date_logged
            )
        ''', (current_user_id, start_date, end_date))
        
        averages = cursor.fetchone()
        
        # Top foods
        cursor.execute('''
            SELECT food_name, COUNT(*) as frequency, AVG(calories) as avg_calories
            FROM food_entries 
            WHERE user_id = ? AND date_logged BETWEEN ? AND ?
            GROUP BY food_name
            ORDER BY frequency DESC
            LIMIT 10
        ''', (current_user_id, start_date, end_date))
        
        top_foods = cursor.fetchall()
        
        # Meal distribution
        cursor.execute('''
            SELECT meal_type, COUNT(*) as count, SUM(calories) as total_calories
            FROM food_entries 
            WHERE user_id = ? AND date_logged BETWEEN ? AND ?
            GROUP BY meal_type
        ''', (current_user_id, start_date, end_date))
        
        meal_distribution = cursor.fetchall()
        
        conn.close()
        
        return jsonify({
            "period": {
                "start_date": str(start_date),
                "end_date": str(end_date),
                "days": days
            },
            "daily_data": [
                {
                    "date": row[0],
                    "calories": row[1] or 0,
                    "protein": row[2] or 0,
                    "carbs": row[3] or 0,
                    "fat": row[4] or 0,
                    "meals": row[5] or 0
                } for row in daily_data
            ],
            "averages": {
                "calories": round(averages[0] or 0, 1),
                "protein": round(averages[1] or 0, 1),
                "carbs": round(averages[2] or 0, 1),
                "fat": round(averages[3] or 0, 1)
            },
            "top_foods": [
                {
                    "name": row[0],
                    "frequency": row[1],
                    "avg_calories": round(row[2] or 0, 1)
                } for row in top_foods
            ],
            "meal_distribution": [
                {
                    "meal_type": row[0],
                    "count": row[1],
                    "total_calories": row[2] or 0
                } for row in meal_distribution
            ]
        })
        
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/api/water-intake', methods=['GET', 'POST'])
@token_required
def water_intake(current_user_id):
    """Handle water intake tracking"""
    try:
        if request.method == 'POST':
            data = request.get_json()
            amount = data.get('amount_ml', 0)
            date = data.get('date', datetime.now().date())
            
            conn = sqlite3.connect('fittrack.db')
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO water_intake (user_id, amount_ml, date_logged)
                VALUES (?, ?, ?)
            ''', (current_user_id, amount, date))
            
            conn.commit()
            conn.close()
            
            return jsonify({"success": True, "message": "Water intake recorded"})
        
        else:  # GET
            date = request.args.get('date', datetime.now().date())
            
            conn = sqlite3.connect('fittrack.db')
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT SUM(amount_ml) FROM water_intake 
                WHERE user_id = ? AND date_logged = ?
            ''', (current_user_id, date))
            
            total = cursor.fetchone()[0] or 0
            conn.close()
            
            return jsonify({
                "date": str(date),
                "total_ml": total,
                "goal_ml": 2500  # Default goal
            })
            
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)