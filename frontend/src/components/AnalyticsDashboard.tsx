import React, { useState } from 'react';
import { BarChart3, TrendingUp, Calendar, Award, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

// Mock data for demonstration
const mockAnalyticsData = {
  period: {
    start_date: '2024-01-01',
    end_date: '2024-01-07',
    days: 7
  },
  daily_data: [
    { date: '2024-01-01', calories: 1800, protein: 120, carbs: 200, fat: 60, meals: 3 },
    { date: '2024-01-02', calories: 2100, protein: 140, carbs: 250, fat: 70, meals: 4 },
    { date: '2024-01-03', calories: 1950, protein: 130, carbs: 220, fat: 65, meals: 3 },
    { date: '2024-01-04', calories: 2200, protein: 150, carbs: 280, fat: 75, meals: 4 },
    { date: '2024-01-05', calories: 1750, protein: 110, carbs: 190, fat: 55, meals: 3 },
    { date: '2024-01-06', calories: 2000, protein: 135, carbs: 240, fat: 68, meals: 4 },
    { date: '2024-01-07', calories: 1900, protein: 125, carbs: 210, fat: 62, meals: 3 }
  ],
  averages: {
    calories: 1957,
    protein: 130,
    carbs: 227,
    fat: 65
  },
  top_foods: [
    { name: 'Grilled Chicken Breast', frequency: 5, avg_calories: 231 },
    { name: 'Brown Rice', frequency: 4, avg_calories: 216 },
    { name: 'Greek Yogurt', frequency: 3, avg_calories: 100 },
    { name: 'Salmon Fillet', frequency: 2, avg_calories: 206 },
    { name: 'Avocado', frequency: 2, avg_calories: 234 }
  ],
  meal_distribution: [
    { meal_type: 'breakfast', count: 7, total_calories: 3500 },
    { meal_type: 'lunch', count: 7, total_calories: 4200 },
    { meal_type: 'dinner', count: 7, total_calories: 4900 },
    { meal_type: 'snack', count: 3, total_calories: 1100 }
  ]
};

const AnalyticsDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState(7);
  const analyticsData = mockAnalyticsData;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Nutrition Analytics</h2>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30].map((days) => (
            <Button
              key={days}
              variant={selectedPeriod === days ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(days)}
            >
              {days} days
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-blue-500">
                  {Math.round(analyticsData.averages.calories)}
                </div>
                <div className="text-sm text-muted-foreground">Avg Calories</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-green-500">
                  {Math.round(analyticsData.averages.protein)}g
                </div>
                <div className="text-sm text-muted-foreground">Avg Protein</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold text-yellow-500">
                  {analyticsData.daily_data.length}
                </div>
                <div className="text-sm text-muted-foreground">Active Days</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold text-purple-500">
                  {analyticsData.daily_data.reduce((sum, day) => sum + day.meals, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Meals</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="macros">Macros</TabsTrigger>
          <TabsTrigger value="foods">Top Foods</TabsTrigger>
          <TabsTrigger value="meals">Meals</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Nutrition Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Interactive charts will be available when Recharts is properly configured</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="macros" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Average Macro Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span>Protein</span>
                    </div>
                    <span className="font-semibold">{analyticsData.averages.protein}g</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                      <span>Carbs</span>
                    </div>
                    <span className="font-semibold">{analyticsData.averages.carbs}g</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-orange-500 rounded"></div>
                      <span>Fat</span>
                    </div>
                    <span className="font-semibold">{analyticsData.averages.fat}g</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.daily_data.slice(0, 5).map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="text-sm">{day.date}</span>
                      <div className="flex gap-2 text-xs">
                        <Badge variant="outline" className="text-green-500">P{day.protein}g</Badge>
                        <Badge variant="outline" className="text-yellow-500">C{day.carbs}g</Badge>
                        <Badge variant="outline" className="text-orange-500">F{day.fat}g</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="foods" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Most Frequently Eaten Foods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.top_foods.map((food, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <div className="font-medium">{food.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {Math.round(food.avg_calories)} avg calories
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {food.frequency} times
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meals" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Meal Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.meal_distribution.map((meal, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="capitalize font-medium">{meal.meal_type}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{meal.count} meals</div>
                        <div className="text-sm text-muted-foreground">{meal.total_calories} kcal</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Calories by Meal Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.meal_distribution.map((meal, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div>
                          <div className="font-medium capitalize">{meal.meal_type}</div>
                          <div className="text-sm text-muted-foreground">
                            {meal.count} meals
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{Math.round(meal.total_calories)} kcal</div>
                        <div className="text-sm text-muted-foreground">
                          {Math.round(meal.total_calories / meal.count)} avg
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;