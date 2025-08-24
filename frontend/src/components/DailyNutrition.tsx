import React from 'react';
import { Brain, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';

interface DailyNutritionProps {
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

const DailyNutrition: React.FC<DailyNutritionProps> = ({ nutrition, goals }) => {
  const caloriePercentage = Math.round((nutrition.calories / goals.calories) * 100);
  const proteinPercentage = Math.round((nutrition.protein / goals.protein) * 100);
  const carbPercentage = Math.round((nutrition.carbs / goals.carbs) * 100);
  const fatPercentage = Math.round((nutrition.fat / goals.fat) * 100);

  const CircularProgress: React.FC<{ value: number; max: number; color: string; label: string }> = ({ value, max, color, label }) => {
    const percentage = Math.min((value / max) * 100, 100);
    const circumference = 2 * Math.PI * 40;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-2">
          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke="hsl(var(--muted))" strokeWidth="8" fill="transparent" />
            <circle 
              cx="50" cy="50" r="40" 
              stroke="currentColor" 
              strokeWidth="8" 
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className={`${color} transition-all duration-500`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold">{Math.round(percentage)}%</span>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="font-semibold">{Math.round(value)}g<span className="text-muted-foreground">/{max}g</span></div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-primary" />
            <CardTitle>Daily Nutrition</CardTitle>
            <Badge variant="outline" className="text-green-500 border-green-500/20">
              AI-Powered
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Calorie goal: {goals.calories.toLocaleString()} kcal
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Calories Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-3xl font-bold text-primary">{caloriePercentage}%</span>
              <span className="text-muted-foreground ml-2">of goal</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{Math.round(nutrition.calories)}</div>
              <div className="text-sm text-muted-foreground">/ {goals.calories}</div>
              <div className="text-xs text-muted-foreground">
                Remaining: {Math.max(0, goals.calories - nutrition.calories)} kcal
              </div>
            </div>
          </div>
          <Progress value={caloriePercentage} className="h-3" />
        </div>

        {/* Macro Distribution */}
        <div>
          <h4 className="font-semibold mb-4">Macro Distribution</h4>
          <div className="grid grid-cols-3 gap-6">
            <CircularProgress 
              value={nutrition.protein} 
              max={goals.protein} 
              color="text-green-500" 
              label="Protein"
            />
            <CircularProgress 
              value={nutrition.carbs} 
              max={goals.carbs} 
              color="text-yellow-500" 
              label="Carbs"
            />
            <CircularProgress 
              value={nutrition.fat} 
              max={goals.fat} 
              color="text-purple-500" 
              label="Fat"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyNutrition;