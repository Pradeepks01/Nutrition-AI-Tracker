import React from 'react';
import { PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface MacroChartProps {
  protein: number;
  carbs: number;
  fat: number;
}

const MacroChart: React.FC<MacroChartProps> = ({ protein, carbs, fat }) => {
  // Calculate calories from macros (protein: 4 cal/g, carbs: 4 cal/g, fat: 9 cal/g)
  const proteinCals = protein * 4;
  const carbsCals = carbs * 4;
  const fatCals = fat * 9;
  const totalCals = proteinCals + carbsCals + fatCals;

  // Calculate percentages
  const proteinPct = totalCals > 0 ? (proteinCals / totalCals) * 100 : 0;
  const carbsPct = totalCals > 0 ? (carbsCals / totalCals) * 100 : 0;
  const fatPct = totalCals > 0 ? (fatCals / totalCals) * 100 : 0;

  // SVG pie chart calculations
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  
  const proteinOffset = 0;
  const carbsOffset = (proteinPct / 100) * circumference;
  const fatOffset = ((proteinPct + carbsPct) / 100) * circumference;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <PieChart className="w-6 h-6 text-primary" />
          <CardTitle>Macro Distribution</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {totalCals === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <PieChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No macro data available</p>
            <p className="text-sm">Add food entries to see distribution</p>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <div className="relative">
              {/* SVG Pie Chart */}
              <svg width="200" height="200" className="transform -rotate-90">
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="transparent"
                  stroke="hsl(var(--muted))"
                  strokeWidth="20"
                />
                
                {/* Protein segment */}
                {proteinPct > 0 && (
                  <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="transparent"
                    stroke="rgb(34, 197, 94)"
                    strokeWidth="20"
                    strokeDasharray={`${(proteinPct / 100) * circumference} ${circumference}`}
                    strokeDashoffset={-proteinOffset}
                    className="transition-all duration-500"
                  />
                )}
                
                {/* Carbs segment */}
                {carbsPct > 0 && (
                  <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="transparent"
                    stroke="rgb(234, 179, 8)"
                    strokeWidth="20"
                    strokeDasharray={`${(carbsPct / 100) * circumference} ${circumference}`}
                    strokeDashoffset={-carbsOffset}
                    className="transition-all duration-500"
                  />
                )}
                
                {/* Fat segment */}
                {fatPct > 0 && (
                  <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="transparent"
                    stroke="rgb(168, 85, 247)"
                    strokeWidth="20"
                    strokeDasharray={`${(fatPct / 100) * circumference} ${circumference}`}
                    strokeDashoffset={-fatOffset}
                    className="transition-all duration-500"
                  />
                )}
              </svg>
              
              {/* Center text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold">{Math.round(totalCals)}</div>
                  <div className="text-sm text-muted-foreground">calories</div>
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="ml-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <div>
                  <div className="font-medium">Protein</div>
                  <div className="text-sm text-muted-foreground">
                    {Math.round(proteinPct)}% • {Math.round(protein)}g
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <div>
                  <div className="font-medium">Carbs</div>
                  <div className="text-sm text-muted-foreground">
                    {Math.round(carbsPct)}% • {Math.round(carbs)}g
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                <div>
                  <div className="font-medium">Fat</div>
                  <div className="text-sm text-muted-foreground">
                    {Math.round(fatPct)}% • {Math.round(fat)}g
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MacroChart;