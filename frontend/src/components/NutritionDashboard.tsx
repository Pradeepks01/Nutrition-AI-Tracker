import React from 'react';
import { Target } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';

const NutritionDashboard: React.FC = () => {
  const nutritionData = {
    calories: { current: 350, goal: 2829 },
    protein: { current: 20, goal: 150 },
    carbs: { current: 40, goal: 350 },
    fat: { current: 10, goal: 94 }
  };

  const getPercentage = (current: number, goal: number) => {
    return Math.round((current / goal) * 100);
  };

  const CircularProgress: React.FC<{ value: number; max: number; color: string; label: string }> = ({ value, max, color, label }) => {
    const percentage = (value / max) * 100;
    const circumference = 2 * Math.PI * 45;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="hsl(var(--muted))"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className={color}
              style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold">{Math.round(percentage)}%</span>
          </div>
        </div>
        <div className="text-center mt-2">
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="font-semibold">{value}<span className="text-muted-foreground">/{max}</span></div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Daily Nutrition Overview */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6 text-blue-400" />
          <h3 className="text-lg font-semibold">Daily Nutrition</h3>
        </div>
        <div className="text-sm text-muted-foreground">
          Calorie goal: {nutritionData.calories.goal.toLocaleString()} kcal
        </div>
      </div>

      {/* Main Calories Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary">
                  {getPercentage(nutritionData.calories.current, nutritionData.calories.goal)}%
                </span>
                <span className="text-muted-foreground">of goal</span>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Remaining: {(nutritionData.calories.goal - nutritionData.calories.current).toLocaleString()} kcal
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {nutritionData.calories.current.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                / {nutritionData.calories.goal.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Calories</div>
            </div>
          </div>

          {/* Progress Bar */}
          <Progress 
            value={getPercentage(nutritionData.calories.current, nutritionData.calories.goal)} 
            className="h-3"
          />
        </CardContent>
      </Card>

      {/* Macro Distribution */}
      <div>
        <h4 className="text-lg font-semibold mb-4">Macro Distribution</h4>
        <Badge variant="default" className="w-full justify-center py-2 mb-4 bg-orange-500 hover:bg-orange-600">
          ✨ Great job keeping up your streak!
        </Badge>
        
        <div className="grid grid-cols-3 gap-6">
          <CircularProgress 
            value={nutritionData.protein.current} 
            max={nutritionData.protein.goal} 
            color="text-green-500" 
            label="Protein"
          />
          <CircularProgress 
            value={nutritionData.carbs.current} 
            max={nutritionData.carbs.goal} 
            color="text-yellow-500" 
            label="Carbs"
          />
          <CircularProgress 
            value={nutritionData.fat.current} 
            max={nutritionData.fat.goal} 
            color="text-purple-500" 
            label="Fat"
          />
        </div>
      </div>
    </div>
  );
};

export default NutritionDashboard;