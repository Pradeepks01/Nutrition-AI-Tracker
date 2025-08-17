import React, { useState } from 'react';
import { Droplets, Plus, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

const WaterIntake: React.FC = () => {
  const [currentIntake, setCurrentIntake] = useState(750);
  const goal = 2500;
  const percentage = Math.round((currentIntake / goal) * 100);

  const addWater = (amount: number) => {
    setCurrentIntake(prev => Math.max(0, Math.min(goal, prev + amount)));
  };

  const WaterBottle: React.FC<{ fillPercentage: number }> = ({ fillPercentage }) => {
    const clampedPercentage = Math.max(0, Math.min(100, fillPercentage));
    
    return (
      <div className="relative mx-auto" style={{ width: '120px', height: '200px' }}>
        {/* Bottle SVG */}
        <svg
          width="120"
          height="200"
          viewBox="0 0 120 200"
          className="absolute inset-0"
        >
          {/* Bottle Outline */}
          <defs>
            <linearGradient id="waterGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#0891b2" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#67e8f9" />
            </linearGradient>
            <linearGradient id="bottleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.05)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
            </linearGradient>
          </defs>
          
          {/* Bottle Body */}
          <path
            d="M35 40 L35 170 Q35 180 45 180 L75 180 Q85 180 85 170 L85 40 Q85 35 80 35 L40 35 Q35 35 35 40 Z"
            fill="rgba(255,255,255,0.1)"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
          />
          
          {/* Bottle Neck */}
          <rect
            x="50"
            y="20"
            width="20"
            height="20"
            rx="2"
            fill="rgba(255,255,255,0.1)"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
          />
          
          {/* Bottle Cap */}
          <rect
            x="48"
            y="15"
            width="24"
            height="8"
            rx="4"
            fill="rgba(255,255,255,0.2)"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1"
          />
          
          {/* Water Fill */}
          <path
            d={`M37 ${180 - (140 * clampedPercentage / 100)} L37 170 Q37 178 45 178 L75 178 Q83 178 83 170 L83 ${180 - (140 * clampedPercentage / 100)} Z`}
            fill="url(#waterGradient)"
            opacity="0.8"
            style={{
              transition: 'all 0.5s ease-in-out'
            }}
          />
          
          {/* Water Surface Animation */}
          {clampedPercentage > 0 && (
            <ellipse
              cx="60"
              cy={180 - (140 * clampedPercentage / 100)}
              rx="23"
              ry="3"
              fill="#67e8f9"
              opacity="0.6"
              style={{
                transition: 'all 0.5s ease-in-out'
              }}
            >
              <animate
                attributeName="ry"
                values="3;4;3"
                dur="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.6;0.8;0.6"
                dur="2s"
                repeatCount="indefinite"
              />
            </ellipse>
          )}
          
          {/* Bottle Highlights */}
          <path
            d="M40 40 L40 170 Q40 175 45 175"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1"
            opacity="0.6"
          />
          
          {/* Water Level Markers */}
          {[25, 50, 75].map((level) => (
            <g key={level}>
              <line
                x1="30"
                y1={180 - (140 * level / 100)}
                x2="35"
                y2={180 - (140 * level / 100)}
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1"
              />
              <text
                x="25"
                y={185 - (140 * level / 100)}
                fill="rgba(255,255,255,0.6)"
                fontSize="8"
                textAnchor="end"
              >
                {level}%
              </text>
            </g>
          ))}
        </svg>
        
        {/* Bubbles Animation */}
        {clampedPercentage > 10 && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-cyan-300 rounded-full opacity-60"
                style={{
                  left: `${45 + i * 10}%`,
                  bottom: `${20 + (clampedPercentage * 0.7)}%`,
                  animation: `bubble 3s infinite ${i * 0.5}s`
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Droplets className="w-6 h-6 text-cyan-500" />
          <CardTitle className="text-lg">Water Intake</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Water Bottle Visualization */}
          <div className="flex flex-col items-center">
            <WaterBottle fillPercentage={percentage} />
            
            {/* Stats Display */}
            <div className="text-center mt-4">
              <div className="text-3xl font-bold text-cyan-500 mb-1">
                {percentage}%
              </div>
              <div className="text-sm text-muted-foreground">
                {currentIntake}ml / {goal}ml
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {goal - currentIntake}ml remaining
              </div>
            </div>
          </div>

          {/* Water Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => addWater(-250)}
              disabled={currentIntake === 0}
              className="hover:bg-cyan-500/10 hover:border-cyan-500"
            >
              <Minus className="w-5 h-5" />
            </Button>
            <div className="text-lg font-semibold min-w-[80px] text-center">
              {currentIntake}ml
            </div>
            <Button
              size="icon"
              onClick={() => addWater(250)}
              disabled={currentIntake >= goal}
              className="bg-cyan-500 hover:bg-cyan-600"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          {/* Quick Add Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {[250, 500, 1000].map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => addWater(amount)}
                disabled={currentIntake >= goal}
                className="hover:bg-cyan-500/10 hover:border-cyan-500 hover:text-cyan-400"
              >
                +{amount}ml
              </Button>
            ))}
          </div>

          {/* Hydration Tips */}
          <div className="text-center">
            {percentage < 25 && (
              <div className="text-xs text-orange-400 bg-orange-500/10 rounded-lg p-2">
                💧 Stay hydrated! Drink more water throughout the day.
              </div>
            )}
            {percentage >= 25 && percentage < 75 && (
              <div className="text-xs text-cyan-400 bg-cyan-500/10 rounded-lg p-2">
                🌊 Good progress! Keep up the hydration.
              </div>
            )}
            {percentage >= 75 && percentage < 100 && (
              <div className="text-xs text-green-400 bg-green-500/10 rounded-lg p-2">
                ✨ Almost there! You're doing great.
              </div>
            )}
            {percentage >= 100 && (
              <div className="text-xs text-green-400 bg-green-500/10 rounded-lg p-2">
                🎉 Hydration goal achieved! Excellent work!
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <style jsx>{`
        @keyframes bubble {
          0% {
            transform: translateY(0) scale(0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(-30px) scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </Card>
  );
};

export default WaterIntake;