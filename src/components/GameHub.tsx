
import React, { useState } from 'react';
import { Trophy, Target, Star, Gamepad2, Award, Zap, Users, TrendingUp, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const GameHub = () => {
  const [currentLevel, setCurrentLevel] = useState(7);
  const [currentXP, setCurrentXP] = useState(2450);
  const [nextLevelXP, setNextLevelXP] = useState(3000);

  const achievements = [
    {
      icon: Shield,
      title: 'Stealth Master',
      description: 'Complete 100 trades in privacy mode',
      progress: 87,
      reward: '500 XP',
      rarity: 'rare'
    },
    {
      icon: Target,
      title: 'Precision Trader',
      description: 'Achieve 80% win rate over 50 trades',
      progress: 64,
      reward: '1000 XP + NFT',
      rarity: 'epic'
    },
    {
      icon: TrendingUp,
      title: 'Profit Hunter',
      description: 'Make $10k profit in a single month',
      progress: 45,
      reward: '750 XP',
      rarity: 'rare'
    }
  ];

  const dailyMissions = [
    {
      icon: Zap,
      title: 'Speed Trader',
      description: 'Complete 5 trades within 10 minutes',
      reward: '100 XP',
      completed: true
    },
    {
      icon: Users,
      title: 'Social Trading',
      description: 'Follow 3 top traders',
      reward: '50 XP',
      completed: false
    },
    {
      icon: Trophy,
      title: 'Volume Master',
      description: 'Trade $50K volume today',
      reward: '200 XP',
      completed: false
    }
  ];

  const leaderboard = [
    { rank: 1, name: 'CryptoNinja', level: 42, xp: 125400, avatar: '🥷' },
    { rank: 2, name: 'DeFiWizard', level: 38, xp: 98200, avatar: '🧙‍♂️' },
    { rank: 3, name: 'TradeGhost', level: 35, xp: 87600, avatar: '👻' },
    { rank: 4, name: 'You', level: currentLevel, xp: currentXP, avatar: '⚡' },
    { rank: 5, name: 'MoonHunter', level: 29, xp: 72100, avatar: '🌙' },
  ];

  return (
    <div className="min-h-screen bg-space-gradient p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-4">Game Hub</h1>
          <p className="text-xl text-muted-foreground">Level up your trading with gamified experiences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player Stats */}
          <div className="space-y-6">
            <Card className="card-game">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Star className="w-5 h-5 mr-2 text-neon-green" />
                  Player Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 text-3xl animate-glow">
                    ⚡
                  </div>
                  <h3 className="text-xl font-bold gradient-text">Level {currentLevel} Trader</h3>
                  <p className="text-muted-foreground">Elite DarkPool Navigator</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>XP Progress</span>
                      <span>{currentXP}/{nextLevelXP}</span>
                    </div>
                    <Progress value={(currentXP / nextLevelXP) * 100} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="card-trading text-center">
                      <div className="text-2xl font-bold text-profit">87%</div>
                      <div className="text-xs text-muted-foreground">Win Rate</div>
                    </div>
                    <div className="card-trading text-center">
                      <div className="text-2xl font-bold text-neon-blue">156</div>
                      <div className="text-xs text-muted-foreground">Stealth Trades</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Daily Missions */}
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Target className="w-5 h-5 mr-2 text-neon-orange" />
                  Daily Missions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dailyMissions.map((mission, index) => (
                  <div key={index} className={`card-trading ${mission.completed ? 'border-profit/40' : ''}`}>
                    <div className="flex items-start space-x-3">
                      <mission.icon className={`w-5 h-5 mt-0.5 ${
                        mission.completed ? 'text-profit' : 'text-muted-foreground'
                      }`} />
                      <div className="flex-1">
                        <h4 className="font-medium">{mission.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{mission.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-neon-green">{mission.reward}</span>
                          {mission.completed && (
                            <span className="text-xs text-profit font-medium">Completed ✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Achievements */}
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Award className="w-5 h-5 mr-2 text-neon-purple" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className="card-trading hover-lift">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${
                        achievement.rarity === 'epic' 
                          ? 'bg-gradient-primary' 
                          : 'bg-neon-purple/20'
                      } animate-glow`}>
                        <achievement.icon className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{achievement.title}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            achievement.rarity === 'epic' 
                              ? 'bg-gradient-primary text-white' 
                              : 'bg-neon-purple/20 text-neon-purple'
                          }`}>
                            {achievement.rarity}
                          </span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {achievement.description}
                        </p>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{achievement.progress}%</span>
                          </div>
                          <Progress value={achievement.progress} className="h-2" />
                          <div className="text-right text-xs text-neon-green">
                            Reward: {achievement.reward}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-neon-orange" />
                  Global Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.map((player) => (
                    <div key={player.rank} className={`card-trading ${
                      player.name === 'You' ? 'border-neon-purple/40 bg-neon-purple/5' : ''
                    }`}>
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          player.rank <= 3 
                            ? 'bg-gradient-primary text-white' 
                            : 'bg-space-700 text-muted-foreground'
                        }`}>
                          {player.rank <= 3 ? player.rank : player.rank}
                        </div>
                        
                        <div className="text-2xl">{player.avatar}</div>
                        
                        <div className="flex-1">
                          <div className="font-semibold">{player.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Level {player.level} • {player.xp.toLocaleString()} XP
                          </div>
                        </div>

                        {player.rank <= 3 && (
                          <Trophy className={`w-5 h-5 ${
                            player.rank === 1 ? 'text-neon-orange' :
                            player.rank === 2 ? 'text-neutral' :
                            'text-neon-green'
                          }`} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Button className="w-full mt-6 btn-hero">
                  <Gamepad2 className="w-4 h-4 mr-2" />
                  Join Tournament
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameHub;
