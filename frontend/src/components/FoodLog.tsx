import React from 'react';
import { Utensils } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

const FoodLog: React.FC = () => {
  const foodItems = [
    {
      id: 1,
      name: "Shrimp, Rice Noodles, and Pork Belly",
      protein: "20g",
      carbs: "40g",
      fat: "10g",
      servings: 1,
      calories: 350,
      category: "Uncategorized"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Utensils className="w-6 h-6 text-primary" />
          <CardTitle className="text-lg">Uncategorized</CardTitle>
        </div>
        <Badge variant="secondary" className="w-fit">
          {foodItems.length} item{foodItems.length !== 1 ? 's' : ''}
        </Badge>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {foodItems.map((item) => (
            <Card key={item.id} className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <div className="flex items-center gap-4 mt-1 text-sm">
                        <Badge variant="outline" className="text-green-500 border-green-500/20">P{item.protein}</Badge>
                        <Badge variant="outline" className="text-yellow-500 border-yellow-500/20">C{item.carbs}</Badge>
                        <Badge variant="outline" className="text-purple-500 border-purple-500/20">F{item.fat}</Badge>
                        <span>{item.servings} serving</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-primary">
                      {item.calories} kcal
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FoodLog;