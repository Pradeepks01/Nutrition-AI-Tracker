import React from 'react';
import { BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const WeeklyStats: React.FC = () => {
  const weeklyData = {
    avgCalories: 1250,
    avgProtein: 60.3,
    avgCarbs: 150.1,
    avgFat: 37.6
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-purple-500" />
          <CardTitle className="text-lg">Weekly Stats</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-500">
                {weeklyData.avgCalories.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Avg Calories</div>
              <div className="text-xs text-muted-foreground">kcal</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500">
                {weeklyData.avgProtein}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Avg Protein</div>
              <div className="text-xs text-muted-foreground">g</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-500">
                {weeklyData.avgCarbs}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Avg Carbs</div>
              <div className="text-xs text-muted-foreground">g</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-500">
                {weeklyData.avgFat}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Avg Fat</div>
              <div className="text-xs text-muted-foreground">g</div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyStats;