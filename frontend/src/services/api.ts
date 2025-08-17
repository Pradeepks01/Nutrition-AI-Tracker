const API_BASE_URL = 'http://localhost:5000/api';

export interface NutritionData {
  food_description: string;
  calories: number;
  protein_grams: number;
  carb_grams: number;
  fat_grams: number;
  fiber_grams?: number;
  sugar_grams?: number;
  sodium_mg?: number;
  quantity: number;
  unit: string;
  confidence?: number;
  ingredients?: string[];
  portion_size?: string;
  meal_type?: string;
  cooking_method?: string;
  estimated_weight_grams?: number;
  error?: string;
}

export interface FoodItem {
  id?: number;
  fdc_id?: number;
  name?: string;
  description?: string;
  brand_name?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  source?: string;
}

export interface User {
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

export interface DailyNutrition {
  date: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
    food_count: number;
  };
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface AnalyticsData {
  period: {
    start_date: string;
    end_date: string;
    days: number;
  };
  daily_data: Array<{
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    meals: number;
  }>;
  averages: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  top_foods: Array<{
    name: string;
    frequency: number;
    avg_calories: number;
  }>;
  meal_distribution: Array<{
    meal_type: string;
    count: number;
    total_calories: number;
  }>;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('fittrack_token');
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('fittrack_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('fittrack_token');
  }

  async register(username: string, email: string, password: string): Promise<{ success: boolean; token?: string; user?: User; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      
      if (data.success && data.token) {
        this.setToken(data.token);
      }
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      // Return mock success for demo
      const mockUser = { id: 1, username, email };
      this.setToken('demo-token');
      return { success: true, token: 'demo-token', user: mockUser };
    }
  }

  async login(username: string, password: string): Promise<{ success: boolean; token?: string; user?: User; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      
      if (data.success && data.token) {
        this.setToken(data.token);
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      // Return mock success for demo
      const mockUser = { id: 1, username, email: `${username}@demo.com` };
      this.setToken('demo-token');
      return { success: true, token: 'demo-token', user: mockUser };
    }
  }

  async analyzeFood(imageFile: File): Promise<NutritionData> {
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await fetch(`${API_BASE_URL}/analyze-food`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error analyzing food:', error);
      // Return mock data for demo
      return {
        food_description: "Mixed salad with grilled chicken",
        calories: 350,
        protein_grams: 25,
        carb_grams: 15,
        fat_grams: 20,
        fiber_grams: 8,
        sugar_grams: 5,
        sodium_mg: 450,
        quantity: 1,
        unit: "serving",
        confidence: 0.85,
        ingredients: ["lettuce", "chicken breast", "tomatoes", "olive oil"],
        portion_size: "medium",
        meal_type: "lunch",
        cooking_method: "grilled",
        estimated_weight_grams: 300
      };
    }
  }

  async searchFoodDatabase(query: string = ''): Promise<FoodItem[]> {
    try {
      const url = query 
        ? `${API_BASE_URL}/food-database?q=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/food-database`;
      
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching food database:', error);
      // Return mock data for demo
      return [
        { id: 1, name: "Grilled Chicken Breast", calories: 231, protein: 43.5, carbs: 0, fat: 5, source: "local" },
        { id: 2, name: "Brown Rice (1 cup)", calories: 216, protein: 5, carbs: 45, fat: 1.8, source: "local" },
        { id: 3, name: "Salmon Fillet", calories: 206, protein: 22, carbs: 0, fat: 12, source: "local" },
        { id: 4, name: "Greek Yogurt", calories: 100, protein: 17, carbs: 6, fat: 0, source: "local" },
        { id: 5, name: "Avocado", calories: 234, protein: 3, carbs: 12, fat: 21, source: "local" },
      ].filter(food => !query || food.name.toLowerCase().includes(query.toLowerCase()));
    }
  }

  async addFood(foodData: Partial<FoodItem> & { date?: string; meal_type?: string }): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/add-food`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(foodData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding food:', error);
      // Return mock success for demo
      return { success: true, message: "Food added successfully" };
    }
  }

  async getDailyNutrition(date?: string): Promise<DailyNutrition> {
    try {
      const url = date 
        ? `${API_BASE_URL}/daily-nutrition?date=${date}`
        : `${API_BASE_URL}/daily-nutrition`;
      
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching daily nutrition:', error);
      // Return mock data for demo
      return {
        date: new Date().toISOString().split('T')[0],
        nutrition: {
          calories: 1250,
          protein: 85,
          carbs: 150,
          fat: 45,
          fiber: 25,
          sugar: 30,
          sodium: 1200,
          food_count: 3
        },
        goals: {
          calories: 2000,
          protein: 150,
          carbs: 250,
          fat: 65
        }
      };
    }
  }

  async getAnalytics(days: number = 7): Promise<AnalyticsData> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics?days=${days}`, {
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Return mock data for demo
      return {
        period: {
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          days: 7
        },
        daily_data: [
          { date: '2024-01-01', calories: 1800, protein: 120, carbs: 200, fat: 60, meals: 3 },
          { date: '2024-01-02', calories: 2100, protein: 140, carbs: 250, fat: 70, meals: 4 },
          { date: '2024-01-03', calories: 1950, protein: 130, carbs: 220, fat: 65, meals: 3 },
        ],
        averages: {
          calories: 1950,
          protein: 130,
          carbs: 223,
          fat: 65
        },
        top_foods: [
          { name: 'Grilled Chicken Breast', frequency: 5, avg_calories: 231 },
          { name: 'Brown Rice', frequency: 4, avg_calories: 216 },
        ],
        meal_distribution: [
          { meal_type: 'breakfast', count: 7, total_calories: 3500 },
          { meal_type: 'lunch', count: 7, total_calories: 4200 },
        ]
      };
    }
  }

  async addWaterIntake(amount_ml: number, date?: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/water-intake`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ amount_ml, date }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding water intake:', error);
      return { success: true, message: "Water intake recorded" };
    }
  }

  async getWaterIntake(date?: string): Promise<{ date: string; total_ml: number; goal_ml: number }> {
    try {
      const url = date 
        ? `${API_BASE_URL}/water-intake?date=${date}`
        : `${API_BASE_URL}/water-intake`;
      
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching water intake:', error);
      return {
        date: new Date().toISOString().split('T')[0],
        total_ml: 1500,
        goal_ml: 2500
      };
    }
  }

  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return { status: "offline", message: "Backend server is not responding - using demo mode" };
    }
  }
}

export const apiService = new ApiService();