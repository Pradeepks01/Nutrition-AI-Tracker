import React, { useState, useEffect } from 'react';
import { User, Calendar, TrendingUp, Droplets, Target, BarChart3, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import NutritionDashboard from './components/NutritionDashboard';
import FoodLog from './components/FoodLog';
import WaterIntake from './components/WaterIntake';
import WeeklyStats from './components/WeeklyStats';
import StreakTracker from './components/StreakTracker';
import NutritionAI from './components/NutritionAI';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import AuthModal from './components/AuthModal';
import { apiService } from './services/api';

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

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if user has a stored token
      const token = localStorage.getItem('fittrack_token');
      if (token) {
        // For now, we'll assume the token is valid
        // In a real app, you'd verify with the backend
        setUser({
          id: 1,
          username: 'Demo User',
          email: 'demo@fittrack.ai'
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('fittrack_token');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = (userData: User) => {
    setUser(userData);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('fittrack_token');
    apiService.clearToken();
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading FitTrack AI...</p>
        </div>
      </div>
    );
  }

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

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-primary mb-2" />
                <CardTitle>AI Food Recognition</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Snap a photo of your meal and get instant nutritional analysis powered by advanced AI.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-green-500 mb-2" />
                <CardTitle>Smart Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Track your progress with detailed charts and insights to optimize your nutrition.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Droplets className="h-8 w-8 text-blue-500 mb-2" />
                <CardTitle>Comprehensive Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Monitor calories, macros, water intake, and build healthy habits with streak tracking.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <AuthModal 
          open={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
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

        {/* Main Content */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="ai-scan" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">AI Scan</span>
            </TabsTrigger>
            <TabsTrigger value="food-log" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Food Log</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="water" className="flex items-center gap-2">
              <Droplets className="h-4 w-4" />
              <span className="hidden sm:inline">Water</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <NutritionDashboard />
                <FoodLog />
              </div>
              <div className="space-y-6">
                <StreakTracker />
                <WeeklyStats />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai-scan">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Food Scanner</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Upload a photo of your food to get instant nutritional analysis powered by AI.
                    </p>
                    <div className="text-center p-8 border-2 border-dashed border-muted rounded-lg">
                      <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        AI Scanner will be available when backend is connected
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div>
                <NutritionAI />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="food-log">
            <div className="space-y-6">
              <FoodLog />
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="water">
            <div className="grid gap-6 lg:grid-cols-2">
              <WaterIntake />
              <Card>
                <CardHeader>
                  <CardTitle>Hydration Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium">Start your day with water</h4>
                        <p className="text-sm text-muted-foreground">Drink a glass of water when you wake up to kickstart hydration.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium">Set regular reminders</h4>
                        <p className="text-sm text-muted-foreground">Use phone alerts to remind yourself to drink water throughout the day.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium">Monitor urine color</h4>
                        <p className="text-sm text-muted-foreground">Pale yellow indicates good hydration levels.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;