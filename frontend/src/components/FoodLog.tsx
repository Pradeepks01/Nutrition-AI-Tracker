import React from 'react';
import { Utensils, Brain, Camera, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

const FoodLog: React.FC = () => {
  const foodItems = [
    {
      id: 1,
      name: "Grilled Chicken Caesar Salad",
      protein: "35g",
      carbs: "12g",
      fat: "18g",
      servings: 1,
      calories: 320,
      category: "Uncategorized",
      source: "AI_VLM",
      confidence: 0.94,
      timeLogged: "2 min ago",
      aiAnalyzed: true
    },
    {
      id: 2,
      name: "Greek Yogurt with Berries",
      protein: "15g",
      carbs: "22g",
      fat: "8g",
      servings: 1,
      calories: 180,
      category: "Uncategorized",
      source: "AI_VLM",
      confidence: 0.89,
      timeLogged: "1 hour ago",
      aiAnalyzed: true
    },
    {
      id: 3,
      name: "Avocado Toast with Egg",
      protein: "12g",
      carbs: "28g",
      fat: "16g",
      servings: 1,
      calories: 285,
      category: "Uncategorized",
      source: "AI_VLM",
      confidence: 0.91,
      timeLogged: "3 hours ago",
      aiAnalyzed: true
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-primary" />
          <CardTitle className="text-lg">Uncategorized</CardTitle>
          <Badge variant="outline" className="text-purple-500 border-purple-500/20">
            AI Analyzed
          </Badge>
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
                    <div className="relative">
                      {item.aiAnalyzed ? (
                        <Camera className="w-5 h-5 text-purple-500" />
                      ) : (
                        <Utensils className="w-5 h-5 text-orange-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{item.name}</h4>
                        {item.aiAnalyzed && (
                          <Badge variant="outline" className="text-xs text-purple-500 border-purple-500/20">
                            {Math.round(item.confidence * 100)}% confident
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm">
                        <Badge variant="outline" className="text-green-500 border-green-500/20">P{item.protein}</Badge>
                        <Badge variant="outline" className="text-yellow-500 border-yellow-500/20">C{item.carbs}</Badge>
                        <Badge variant="outline" className="text-purple-500 border-purple-500/20">F{item.fat}</Badge>
                        <span>{item.servings} serving</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{item.timeLogged}</span>
                        {item.aiAnalyzed && (
                          <>
                            <span>•</span>
                            <Brain className="w-3 h-3" />
                            <span>AI Analyzed</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-primary">
                      {item.calories} kcal
                    </div>
                    {item.aiAnalyzed && (
                      <div className="text-xs text-purple-500 mt-1">
                        VLM Analyzed
                      </div>
                    )}
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