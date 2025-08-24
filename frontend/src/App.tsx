import React, { useState, useEffect } from 'react';
import { User, LogOut, Target } from 'lucide-react';
import { Button } from './components/ui/button';
import DailyNutrition from './components/DailyNutrition';
import DailyFoodLog from './components/DailyFoodLog';
import MacroChart from './components/MacroChart';
import WaterIntake from './components/WaterIntake';
import NutritionAI from './components/NutritionAI';
import NutritionTip from './components/NutritionTip';
import AuthModal from './components/AuthModal';

interface User {
  id: number;
  username: string;
  email: string;
  goals?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface FoodEntry {
  food_description: string;
  calories: number;
  protein_grams: number;
  carb_grams: number;
  fat_grams: number;
  quantity: number;
  unit: string;
  timestamp: string;
}

interface NutritionData {
  food_description: string;
  calories: number;
  protein_grams: number;
  carb_grams: number;
  fat_grams: number;
  quantity: number;
  unit: string;
  confidence: number;
  nutrition_tip?: string;
}

function App() {
  const [user, setUser] = useState<User | null>({
    id: 1,
    username: 'Demo User',
    email: 'demo@fittrack.ai',
    goals: { calories: 2829, protein: 150, carbs: 250, fat: 65 }
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Nutrition tracking state
  const [dailyNutrition, setDailyNutrition] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [nutritionTip, setNutritionTip] = useState("Upload a food photo or describe your meal to get personalized nutrition insights and tips!");

  // Load daily nutrition data
  const loadDailyNutrition = async (date: Date) => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const response = await fetch(`http://localhost:5000/api/daily-nutrition?date=${dateStr}`);
      
      if (response.ok) {
        const data = await response.json();
        setDailyNutrition(data.nutrition);
        setFoodEntries(data.food_entries || []);
      } else {
        // Fallback to demo data if backend is not available
        setDailyNutrition({ calories: 0, protein: 0, carbs: 0, fat: 0 });
        setFoodEntries([]);
      }
    } catch (error) {
      console.error('Error loading daily nutrition:', error);
      // Use demo data as fallback
      setDailyNutrition({ calories: 0, protein: 0, carbs: 0, fat: 0 });
      setFoodEntries([]);
    }
  };

  // Load data when date changes
  useEffect(() => {
    loadDailyNutrition(selectedDate);
  }, [selectedDate]);

  // Handle food addition from AI analysis
  const handleFoodAdded = async (nutritionData: NutritionData) => {
    try {
      // Add to backend
      const response = await fetch('http://localhost:5000/api/add-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nutritionData),
      });

      if (response.ok) {
        // Update local state immediately for better UX
        setDailyNutrition(prev => ({
          calories: prev.calories + nutritionData.calories,
          protein: prev.protein + nutritionData.protein_grams,
          carbs: prev.carbs + nutritionData.carb_grams,
          fat: prev.fat + nutritionData.fat_grams
        }));

        // Add to food entries
        const newEntry: FoodEntry = {
          food_description: nutritionData.food_description,
          calories: nutritionData.calories,
          protein_grams: nutritionData.protein_grams,
          carb_grams: nutritionData.carb_grams,
          fat_grams: nutritionData.fat_grams,
          quantity: nutritionData.quantity,
          unit: nutritionData.unit,
          timestamp: "Just now"
        };
        setFoodEntries(prev => [newEntry, ...prev]);

        // Update nutrition tip if provided
        if (nutritionData.nutrition_tip) {
          setNutritionTip(nutritionData.nutrition_tip);
        }
      }
    } catch (error) {
      console.error('Error adding food:', error);
      // Still update UI for demo purposes
      setDailyNutrition(prev => ({
        calories: prev.calories + nutritionData.calories,
        protein: prev.protein + nutritionData.protein_grams,
        carbs: prev.carbs + nutritionData.carb_grams,
        fat: prev.fat + nutritionData.fat_grams
      }));

      const newEntry: FoodEntry = {
        food_description: nutritionData.food_description,
        calories: nutritionData.calories,
        protein_grams: nutritionData.protein_grams,
        carb_grams: nutritionData.carb_grams,
        fat_grams: nutritionData.fat_grams,
        quantity: nutritionData.quantity,
        unit: nutritionData.unit,
        timestamp: "Just now"
      };
      setFoodEntries(prev => [newEntry, ...prev]);

      if (nutritionData.nutrition_tip) {
        setNutritionTip(nutritionData.nutrition_tip);
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Target className="h-12 w-12 text-primary mr-3" />
              <h1 className="text-4xl font-bold text-foreground">FitTrack AI</h1>
            </div>
            <p className="text-xl text-muted-foreground mb-8">
              AI-Powered Nutrition Tracking & Analytics Platform
            </p>
            <Button 
              onClick={() => setShowAuthModal(true)}
              size="lg"
              className="bg-primary hover:bg-primary/90"
            >
              Get Started
            </Button>
          </div>
        </div>

        <AuthModal 
          open={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={setUser}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-primary mr-3" />
            <h1 className="text-3xl font-bold text-foreground">FitTrack AI</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-muted-foreground">
              <User className="h-5 w-5 mr-2" />
              <span>Welcome, {user.username}!</span>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Main Dashboard */}
          <div className="lg:col-span-3 space-y-6">
            {/* Daily Nutrition Overview */}
            <DailyNutrition 
              nutrition={dailyNutrition}
              goals={user.goals || { calories: 2829, protein: 150, carbs: 250, fat: 65 }}
            />

            {/* Daily Food Log */}
            <DailyFoodLog 
              foodEntries={foodEntries}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />

            {/* Macro Chart and Water Intake */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MacroChart 
                protein={dailyNutrition.protein}
                carbs={dailyNutrition.carbs}
                fat={dailyNutrition.fat}
              />
              <WaterIntake />
            </div>

            {/* Nutrition Tip */}
            <NutritionTip tip={nutritionTip} />
          </div>

          {/* Right Column - Nutrition AI */}
          <div className="lg:col-span-1">
            <NutritionAI onFoodAdded={handleFoodAdded} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;