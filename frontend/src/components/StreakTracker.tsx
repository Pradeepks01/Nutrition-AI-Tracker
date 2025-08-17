import React from 'react';
import { Flame, Calendar, Trophy, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

const StreakTracker: React.FC = () => {
  const streakData = {
    currentStreak: 13,
    longestStreak: 28,
    totalDays: 45,
    weeklyGoal: 7,
    completedThisWeek: 5
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekProgress = [true, true, true, true, true, false, false]; // Example: completed first 5 days

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-purple-500';
    if (streak >= 14) return 'text-orange-500';
    if (streak >= 7) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStreakBadge = (streak: number) => {
    if (streak >= 30) return { text: 'Legend', color: 'bg-purple-500' };
    if (streak >= 14) return { text: 'Champion', color: 'bg-orange-500' };
    if (streak >= 7) return { text: 'Warrior', color: 'bg-yellow-500' };
    return { text: 'Beginner', color: 'bg-green-500' };
  };

  const badge = getStreakBadge(streakData.currentStreak);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flame className="w-6 h-6 text-orange-500" />
            <CardTitle className="text-lg">Streak Tracker</CardTitle>
          </div>
          <Badge className={`${badge.color} text-white`}>
            {badge.text}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Streak Display */}
        <div className="text-center">
          <div className="relative inline-block">
            <div className={`text-6xl font-bold ${getStreakColor(streakData.currentStreak)} mb-2`}>
              {streakData.currentStreak}
            </div>
            <div className="absolute -top-2 -right-2">
              <Flame className="w-8 h-8 text-orange-500 animate-pulse" />
            </div>
          </div>
          <div className="text-lg font-semibold text-foreground mb-1">
            Day Streak
          </div>
          <div className="text-sm text-muted-foreground">
            Keep it up! You're on fire! 🔥
          </div>
        </div>

        {/* Weekly Progress */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              This Week
            </h4>
            <span className="text-sm text-muted-foreground">
              {streakData.completedThisWeek}/{streakData.weeklyGoal} days
            </span>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => (
              <div key={day} className="text-center">
                <div className="text-xs text-muted-foreground mb-1">{day}</div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                    weekProgress[index]
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-muted text-muted-foreground border-2 border-dashed border-muted-foreground/30'
                  }`}
                >
                  {weekProgress[index] ? '✓' : index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-500">
                {streakData.longestStreak}
              </div>
              <div className="text-sm text-muted-foreground">Best Streak</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Target className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-500">
                {streakData.totalDays}
              </div>
              <div className="text-sm text-muted-foreground">Total Days</div>
            </CardContent>
          </Card>
        </div>

        {/* Motivational Message */}
        <div className="text-center p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20">
          <div className="text-sm font-medium text-orange-400 mb-1">
            🎯 Streak Goal
          </div>
          <div className="text-xs text-muted-foreground">
            {streakData.currentStreak < 7 
              ? "Reach 7 days to unlock Warrior status!"
              : streakData.currentStreak < 14
              ? "Reach 14 days to become a Champion!"
              : streakData.currentStreak < 30
              ? "Reach 30 days to achieve Legend status!"
              : "You're a Legend! Keep maintaining your streak!"
            }
          </div>
        </div>

        {/* Streak Milestones */}
        <div>
          <h4 className="font-semibold mb-3 text-sm">Streak Milestones</h4>
          <div className="space-y-2">
            {[
              { days: 7, title: 'Warrior', icon: '⚔️', achieved: streakData.longestStreak >= 7 },
              { days: 14, title: 'Champion', icon: '🏆', achieved: streakData.longestStreak >= 14 },
              { days: 30, title: 'Legend', icon: '👑', achieved: streakData.longestStreak >= 30 },
              { days: 100, title: 'Master', icon: '🎖️', achieved: streakData.longestStreak >= 100 }
            ].map((milestone) => (
              <div
                key={milestone.days}
                className={`flex items-center justify-between p-2 rounded-lg transition-all ${
                  milestone.achieved
                    ? 'bg-green-500/10 border border-green-500/20'
                    : 'bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{milestone.icon}</span>
                  <div>
                    <div className={`font-medium text-sm ${
                      milestone.achieved ? 'text-green-400' : 'text-muted-foreground'
                    }`}>
                      {milestone.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {milestone.days} days
                    </div>
                  </div>
                </div>
                {milestone.achieved && (
                  <Badge variant="outline" className="text-green-500 border-green-500/20">
                    ✓ Achieved
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakTracker;