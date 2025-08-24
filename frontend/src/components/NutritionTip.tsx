import React from 'react';
import { Target, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface NutritionTipProps {
  tip: string;
}

const NutritionTip: React.FC<NutritionTipProps> = ({ tip }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-orange-500" />
            <CardTitle>Nutrition Tip</CardTitle>
          </div>
          <Badge variant="outline" className="text-orange-500 border-orange-500/20">
            <Lightbulb className="w-3 h-3 mr-1" />
            AI Insight
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground leading-relaxed mb-4">{tip}</p>
        <Button variant="link" className="p-0 h-auto text-primary">
          Learn more →
        </Button>
      </CardContent>
    </Card>
  );
};

export default NutritionTip;