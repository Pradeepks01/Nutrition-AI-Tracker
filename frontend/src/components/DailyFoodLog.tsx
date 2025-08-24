import React, { useState } from 'react';
import { Calendar, Brain, Camera, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

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

interface DailyFoodLogProps {
  foodEntries: FoodEntry[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const DailyFoodLog: React.FC<DailyFoodLogProps> = ({ foodEntries, selectedDate, onDateChange }) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timestamp: string) => {
    if (timestamp === "Just now") return timestamp;
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return timestamp;
    }
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    onDateChange(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-blue-500" />
            <CardTitle>Daily Food Log</CardTitle>
            <Badge variant="secondary">{foodEntries.length} item{foodEntries.length !== 1 ? 's' : ''}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => changeDate(-1)}
              className="p-2"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="text-center min-w-[200px]">
              <div className="text-sm font-medium">
                {formatDate(selectedDate)}
              </div>
              {isToday(selectedDate) && (
                <Badge variant="outline" className="text-xs mt-1">Today</Badge>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => changeDate(1)}
              disabled={isToday(selectedDate)}
              className="p-2"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {foodEntries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No food entries for this day</p>
            <p className="text-sm">Upload a photo or add food manually</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-5 h-5 text-purple-500" />
              <span className="font-medium">Uncategorized</span>
              <Badge variant="outline" className="text-purple-500 border-purple-500/20">
                AI Analyzed
              </Badge>
            </div>
            
            {foodEntries.map((entry, index) => (
              <Card key={index} className="hover:bg-accent/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Camera className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <h4 className="font-medium">{entry.food_description}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm">
                          <Badge variant="outline" className="text-green-500 border-green-500/20">
                            P{Math.round(entry.protein_grams)}g
                          </Badge>
                          <Badge variant="outline" className="text-yellow-500 border-yellow-500/20">
                            C{Math.round(entry.carb_grams)}g
                          </Badge>
                          <Badge variant="outline" className="text-purple-500 border-purple-500/20">
                            F{Math.round(entry.fat_grams)}g
                          </Badge>
                          <span>{entry.quantity} {entry.unit}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(entry.timestamp)}</span>
                          <span>•</span>
                          <Brain className="w-3 h-3" />
                          <span>AI Analyzed</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-primary">
                        {Math.round(entry.calories)} kcal
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyFoodLog;