
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import Lottie from 'lottie-react';
import { Activity, Award, Crown, DollarSign, Eye, Gamepad2, Gift, Lock, Medal, Rocket, Shield, Star, Swords, Target, Timer, Trophy, User, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const GameHub = () => {
  const [currentLevel, setCurrentLevel] = useState(12);
  const [currentXP, setCurrentXP] = useState(8750);
  const [nextLevelXP, setNextLevelXP] = useState(10000);
  const [lottieData, setLottieData] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 42, seconds: 18 });
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showTournamentModal, setShowTournamentModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [missionProgress, setMissionProgress] = useState({});

  // Initialize mission progress
  useEffect(() => {
    setMissionProgress({
      0: { progress: 7, total: 10 },
      1: { progress: 5000, total: 5000 },
      2: { progress: 18, total: 20 }
    });
  }, []);

  // Load Lottie animation
  useEffect(() => {
    fetch('/Dance cat.json')
      .then(response => response.json())
      .then(data => setLottieData(data))
      .catch(error => console.log('Lottie file not found:', error));
  }, []);

  // Countdown timer for daily reset
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const achievements = [
    {
      icon: Shield,
      title: 'Shadow Trader',
      description: 'Execute 500 stealth trades using zero-knowledge proofs',
      progress: 92,
      reward: '2,500 XP + Legendary NFT',
      rarity: 'legendary',
      unlocked: true
    },
    {
      icon: Crown,
      title: 'Profit Sovereign',
      description: 'Generate $100K profit through private trading',
      progress: 78,
      reward: '5,000 XP + Crown Badge',
      rarity: 'mythic',
      unlocked: true
    },
    {
      icon: Rocket,
      title: 'Velocity Master',
      description: 'Complete 1000 trades in under 1 second each',
      progress: 34,
      reward: '1,500 XP + Speed Boost',
      rarity: 'epic',
      unlocked: true
    },
    {
      icon: Lock,
      title: 'Privacy Guardian',
      description: 'Maintain 100% privacy score for 30 days',
      progress: 15,
      reward: '10,000 XP + Mystery Reward',
      rarity: 'mythic',
      unlocked: false
    }
  ];

  const dailyMissions = [
    {
      icon: Zap,
      title: 'Lightning Trades',
      description: 'Execute 10 trades in stealth mode',
      reward: '500 XP',
      progress: missionProgress[0]?.progress || 7,
      total: missionProgress[0]?.total || 10,
      completed: missionProgress[0]?.progress >= missionProgress[0]?.total
    },
    {
      icon: Eye,
      title: 'Invisible Profits',
      description: 'Generate $5K profit without revealing identity',
      reward: '750 XP',
      progress: missionProgress[1]?.progress || 5000,
      total: missionProgress[1]?.total || 5000,
      completed: missionProgress[1]?.progress >= missionProgress[1]?.total
    },
    {
      icon: Target,
      title: 'Precision Strike',
      description: 'Achieve 95% accuracy on 20 trades',
      reward: '1,000 XP',
      progress: missionProgress[2]?.progress || 18,
      total: missionProgress[2]?.total || 20,
      completed: missionProgress[2]?.progress >= missionProgress[2]?.total
    }
  ];

  const leaderboard = [
    { rank: 1, name: 'GhostTrader', level: 47, xp: 2847000, avatar: '👤', badge: 'legendary', earnings: '$2.8M' },
    { rank: 2, name: 'ShadowWhale', level: 44, xp: 2156000, avatar: '🐋', badge: 'mythic', earnings: '$2.1M' },
    { rank: 3, name: 'StealthNinja', level: 42, xp: 1893000, avatar: '🥷', badge: 'epic', earnings: '$1.9M' },
    { rank: 4, name: 'You', level: currentLevel, xp: currentXP, avatar: '⚡', badge: 'rare', earnings: '$156K' },
    { rank: 5, name: 'DarkPool', level: 38, xp: 987000, avatar: '🌑', badge: 'rare', earnings: '$987K' },
  ];

  const tournamentRewards = [
    { place: '1st', reward: '50,000 XP + $10K Prize', icon: '🥇' },
    { place: '2nd', reward: '25,000 XP + $5K Prize', icon: '🥈' },
    { place: '3rd', reward: '15,000 XP + $2.5K Prize', icon: '🥉' },
    { place: 'Top 10', reward: '5,000 XP + Exclusive NFT', icon: '🏆' },
  ];

  const playerStats = [
    { label: 'Total Trades', value: '2,847', icon: Activity, color: 'text-neon-blue' },
    { label: 'Privacy Score', value: '98.5%', icon: Shield, color: 'text-neon-green' },
    { label: 'Win Rate', value: '94.2%', icon: Target, color: 'text-profit' },
    { label: 'Total Earnings', value: '$156K', icon: DollarSign, color: 'text-neon-orange' },
  ];

  // Handler functions
  const handleMissionClaim = (missionIndex) => {
    const mission = dailyMissions[missionIndex];
    if (mission.completed) {
      setCurrentXP(prev => prev + parseInt(mission.reward.split(' ')[0]));
      toast.success(`Claimed ${mission.reward}!`, {
        description: `Mission "${mission.title}" completed successfully.`
      });
    }
  };

  const handleJoinTournament = () => {
    setShowTournamentModal(true);
    toast.info('Tournament registration opening...', {
      description: 'Prepare for the ultimate shadow trading competition!'
    });
  };

  const handleChallengeElite = () => {
    toast.info('Challenge initiated!', {
      description: 'Searching for elite opponents in your tier...'
    });
  };

  const handleViewStats = () => {
    setShowStatsModal(true);
  };

  const handleViewAllRankings = () => {
    setShowLeaderboardModal(true);
  };

  const handleUnlockAchievement = (achievementIndex) => {
    const achievement = achievements[achievementIndex];
    if (achievement.unlocked) {
      toast.success('Achievement unlocked!', {
        description: `You've earned: ${achievement.reward}`
      });
    } else {
      toast.info('Achievement locked', {
        description: 'Complete the requirements to unlock this achievement.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-space-gradient p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header with Lottie Animation */}
        <div className="relative text-center mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-neon-purple/20 via-neon-blue/20 to-black rounded-2xl blur-xl"></div>
          <div className="relative bg-gradient-to-br from-black via-space-800/80 to-black backdrop-blur-xl p-8 rounded-2xl border border-neon-purple/30 shadow-2xl">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="text-left lg:flex-1">
                <h1 className="text-5xl font-bold gradient-text mb-4">Private Trading Hub</h1>
                <p className="text-xl text-muted-foreground mb-4">Elite zero-knowledge trading arena for shadow masters</p>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-profit rounded-full animate-pulse"></div>
                    <span className="text-profit">Live Tournament Active</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Timer className="w-4 h-4 text-neon-orange" />
                    <span className="text-neon-orange font-mono">
                      {String(timeLeft.hours).padStart(2, '0')}:
                      {String(timeLeft.minutes).padStart(2, '0')}:
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Lottie Animation */}
              {lottieData && (
                <div className="lg:w-64 lg:h-64 w-48 h-48 mt-6 lg:mt-0">
                  <Lottie 
                    animationData={lottieData} 
                    loop={true}
                    className="w-full h-full opacity-80 hover:opacity-100 transition-opacity duration-300"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Player Profile & Stats */}
          <div className="lg:col-span-4 space-y-6">
            {/* Enhanced Player Profile */}
            <Card className="bg-gradient-to-br from-black via-space-800/60 to-black backdrop-blur-xl border-2 border-neon-purple/30 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Crown className="w-5 h-5 mr-2 text-neon-orange animate-pulse" />
                  Shadow Trader Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 text-4xl animate-glow border-4 border-neon-purple/30">
                      ⚡
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-neon-orange rounded-full flex items-center justify-center text-xs font-bold">
                      {currentLevel}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold gradient-text">Elite Phantom</h3>
                  <p className="text-muted-foreground mb-2">DarkPool Sovereign</p>
                  <div className="flex justify-center space-x-2 mb-4">
                    <div className="px-3 py-1 bg-neon-purple/20 rounded-full text-xs text-neon-purple border border-neon-purple/30">
                      Legendary Tier
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="card-trading bg-gradient-to-br from-black via-space-700/60 to-black border border-neon-blue/30">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="flex items-center">
                        <Zap className="w-4 h-4 mr-1 text-neon-blue" />
                        XP Progress
                      </span>
                      <span className="font-mono">{currentXP.toLocaleString()}/{nextLevelXP.toLocaleString()}</span>
                    </div>
                    <Progress value={(currentXP / nextLevelXP) * 100} className="h-3 bg-black/60">
                      <div className="h-full bg-gradient-to-r from-black via-neon-blue to-neon-purple rounded-full transition-all duration-500"></div>
                    </Progress>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {playerStats.map((stat, index) => (
                      <div 
                        key={index} 
                        className="bg-gradient-to-br from-black via-space-700/60 to-black border border-neon-purple/20 rounded-lg p-3 text-center hover-lift transition-all duration-300 cursor-pointer"
                        onClick={handleViewStats}
                      >
                        <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
                        <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-xs text-muted-foreground">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Daily Missions */}
            <Card className="bg-gradient-to-br from-black via-space-800/60 to-black backdrop-blur-xl border border-neon-orange/30 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center justify-between">
                  <div className="flex items-center">
                    <Target className="w-5 h-5 mr-2 text-neon-orange" />
                    Shadow Missions
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Resets in {String(timeLeft.hours).padStart(2, '0')}h
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dailyMissions.map((mission, index) => (
                  <div key={index} className={`bg-gradient-to-br from-black via-space-700/60 to-black backdrop-blur-xl rounded-lg p-4 border transition-all duration-300 hover-lift cursor-pointer ${
                    mission.completed ? 'border-profit/60 bg-gradient-to-br from-black via-profit/10 to-black shadow-lg shadow-profit/20' : 'border-neon-purple/30'
                  }`}
                  onClick={() => setSelectedMission(mission)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        mission.completed ? 'bg-profit/20 text-profit' : 'bg-neon-purple/20 text-neon-purple'
                      }`}>
                        <mission.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{mission.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{mission.description}</p>
                        
                        {!mission.completed && (
                          <div className="mb-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Progress</span>
                              <span>{mission.progress}/{mission.total}</span>
                            </div>
                            <Progress value={(mission.progress / mission.total) * 100} className="h-1" />
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-neon-green font-medium">{mission.reward}</span>
                          {mission.completed ? (
                            <Button 
                              size="sm" 
                              className="bg-profit/20 hover:bg-profit/30 text-profit border-profit/40"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMissionClaim(index);
                              }}
                            >
                              <Gift className="w-3 h-3 mr-1" />
                              Claim
                            </Button>
                          ) : (
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-neon-orange rounded-full animate-pulse"></div>
                              <span className="text-xs text-neon-orange">In Progress</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-6">
            {/* Tournament Banner */}
            <Card className="bg-gradient-to-br from-black via-space-800/60 to-black backdrop-blur-xl border-2 border-neon-orange/40 shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-black via-neon-purple/30 via-neon-blue/30 to-black p-6 border-b border-neon-orange/20">
                <div className="flex flex-col lg:flex-row items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold gradient-text mb-2 flex items-center">
                      <Swords className="w-6 h-6 mr-2 text-neon-orange" />
                      Shadow Tournament - Finals Week
                    </h3>
                    <p className="text-muted-foreground mb-4">Compete in the ultimate private trading championship</p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {tournamentRewards.map((reward, index) => (
                        <div key={index} className="text-center bg-gradient-to-br from-black via-space-700/40 to-black rounded-lg p-3 border border-neon-green/20">
                          <div className="text-2xl mb-1">{reward.icon}</div>
                          <div className="text-xs text-muted-foreground">{reward.place}</div>
                          <div className="text-xs text-neon-green font-medium">{reward.reward}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button 
                    className="bg-gradient-to-r from-black via-neon-orange to-black border border-neon-orange/50 hover:from-neon-orange/20 hover:to-black transition-all duration-300 mt-4 lg:mt-0"
                    onClick={handleJoinTournament}
                  >
                    <Medal className="w-4 h-4 mr-2" />
                    Enter Tournament
                  </Button>
                </div>
              </div>
            </Card>

            {/* Achievements Grid */}
            <Card className="bg-gradient-to-br from-black via-space-800/60 to-black backdrop-blur-xl border border-neon-purple/30 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Award className="w-5 h-5 mr-2 text-neon-purple" />
                  Shadow Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {achievements.map((achievement, index) => (
                  <div 
                    key={index} 
                    className={`bg-gradient-to-br from-black via-space-700/60 to-black backdrop-blur-xl rounded-lg p-4 border transition-all duration-300 hover-lift shadow-lg cursor-pointer ${
                      !achievement.unlocked ? 'opacity-60 border-space-600/30' : 'border-neon-purple/30 hover:shadow-neon-purple/20'
                    }`}
                    onClick={() => handleUnlockAchievement(index)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`relative p-3 rounded-xl ${
                        achievement.rarity === 'mythic' ? 'bg-gradient-to-br from-neon-purple to-neon-orange animate-pulse' :
                        achievement.rarity === 'legendary' ? 'bg-gradient-to-br from-neon-orange to-neon-green' :
                        achievement.rarity === 'epic' ? 'bg-gradient-primary' :
                        'bg-neon-purple/20'
                      } ${achievement.unlocked ? 'animate-glow' : ''}`}>
                        <achievement.icon className="w-6 h-6 text-white" />
                        {!achievement.unlocked && (
                          <Lock className="absolute -top-1 -right-1 w-4 h-4 text-space-300" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{achievement.title}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            achievement.rarity === 'mythic' ? 'bg-gradient-to-r from-neon-purple to-neon-orange text-white border-neon-purple' :
                            achievement.rarity === 'legendary' ? 'bg-gradient-to-r from-neon-orange to-neon-green text-white border-neon-orange' :
                            achievement.rarity === 'epic' ? 'bg-gradient-primary text-white border-neon-blue' :
                            'bg-neon-purple/20 text-neon-purple border-neon-purple/30'
                          }`}>
                            {achievement.rarity.toUpperCase()}
                          </span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {achievement.description}
                        </p>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span className="font-mono">{achievement.progress}%</span>
                          </div>
                          <Progress value={achievement.progress} className="h-2 bg-black/60">
                            <div className={`h-full rounded-full transition-all duration-500 ${
                              achievement.rarity === 'mythic' ? 'bg-gradient-to-r from-black via-neon-purple to-neon-orange' :
                              achievement.rarity === 'legendary' ? 'bg-gradient-to-r from-black via-neon-orange to-neon-green' :
                              'bg-gradient-to-r from-black via-neon-blue to-neon-purple'
                            }`} style={{ width: `${achievement.progress}%` }}></div>
                          </Progress>
                          <div className="text-right text-xs text-neon-green font-medium">
                            {achievement.reward}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Elite Leaderboard */}
            <Card className="bg-gradient-to-br from-black via-space-800/60 to-black backdrop-blur-xl border border-neon-orange/30 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center justify-between">
                  <div className="flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-neon-orange" />
                    Shadow Elite Leaderboard
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs bg-gradient-to-r from-black to-space-700 border-neon-purple/30"
                    onClick={handleViewAllRankings}
                  >
                    View All Rankings
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.map((player, index) => (
                    <div key={player.rank} className={`bg-gradient-to-br from-black via-space-700/60 to-black backdrop-blur-xl rounded-lg p-4 border transition-all duration-300 hover-lift ${
                      player.name === 'You' ? 'border-neon-purple/80 bg-gradient-to-br from-black via-neon-purple/20 to-black scale-105 shadow-lg shadow-neon-purple/30' : 'border-space-600/30'
                    }`}>
                      <div className="flex items-center space-x-4">
                        <div className={`relative w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                          player.rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black' :
                          player.rank === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-black' :
                          player.rank === 3 ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white' :
                          'bg-space-700 text-muted-foreground'
                        }`}>
                          {player.rank}
                          {player.rank <= 3 && (
                            <div className="absolute -top-1 -right-1 text-lg">
                              {player.rank === 1 ? '👑' : player.rank === 2 ? '🥈' : '🥉'}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-2xl">{player.avatar}</div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold truncate">{player.name}</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              player.badge === 'legendary' ? 'bg-gradient-to-r from-neon-orange to-neon-green text-white' :
                              player.badge === 'mythic' ? 'bg-gradient-to-r from-neon-purple to-neon-orange text-white' :
                              player.badge === 'epic' ? 'bg-gradient-primary text-white' :
                              'bg-neon-purple/20 text-neon-purple'
                            }`}>
                              {player.badge}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center space-x-4">
                            <span>Lv.{player.level}</span>
                            <span className="font-mono">{player.xp.toLocaleString()} XP</span>
                            <span className="text-profit">{player.earnings}</span>
                          </div>
                        </div>

                        {player.rank <= 3 && (
                          <Trophy className={`w-5 h-5 ${
                            player.rank === 1 ? 'text-yellow-500' :
                            player.rank === 2 ? 'text-gray-400' :
                            'text-orange-500'
                          }`} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button 
                    className="bg-gradient-to-r from-black via-neon-purple to-black border border-neon-purple/50 hover:from-neon-purple/20 hover:to-black transition-all duration-300"
                    onClick={handleChallengeElite}
                  >
                    <Gamepad2 className="w-4 h-4 mr-2" />
                    Challenge Elite
                  </Button>
                  <Button 
                    variant="outline" 
                    className="bg-gradient-to-r from-black to-space-700 border-neon-orange/30 hover:bg-gradient-to-r hover:from-neon-orange/10 hover:to-black"
                    onClick={handleViewStats}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    View My Stats
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      
      {/* Player Stats Modal */}
      <Dialog open={showStatsModal} onOpenChange={setShowStatsModal}>
        <DialogContent className="bg-gradient-to-br from-black via-space-800/90 to-black border border-neon-purple/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="gradient-text flex items-center">
              <User className="w-5 h-5 mr-2" />
              Elite Shadow Trader Profile
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {playerStats.map((stat, index) => (
                <div key={index} className="bg-gradient-to-br from-black via-space-700/60 to-black border border-neon-purple/20 rounded-lg p-4 text-center">
                  <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                  <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-br from-black via-space-700/40 to-black border border-neon-blue/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 text-neon-blue">Performance Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Monthly Profit Trend</div>
                  <div className="text-2xl font-bold text-profit">+24.7%</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Risk Score</div>
                  <div className="text-2xl font-bold text-neon-orange">Low (2.1)</div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tournament Modal */}
      <Dialog open={showTournamentModal} onOpenChange={setShowTournamentModal}>
        <DialogContent className="bg-gradient-to-br from-black via-space-800/90 to-black border border-neon-orange/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="gradient-text flex items-center">
              <Swords className="w-5 h-5 mr-2" />
              Shadow Tournament Registration
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-black via-neon-orange/10 to-black border border-neon-orange/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2 text-neon-orange">Tournament Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Entry Fee:</span>
                  <span className="ml-2 text-neon-green font-medium">1,000 XP</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="ml-2 text-white">7 Days</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Participants:</span>
                  <span className="ml-2 text-white">256 Elite Traders</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Prize Pool:</span>
                  <span className="ml-2 text-neon-orange font-medium">$100,000</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {tournamentRewards.map((reward, index) => (
                <div key={index} className="bg-gradient-to-br from-black via-space-700/40 to-black border border-neon-green/20 rounded-lg p-3 text-center">
                  <div className="text-2xl mb-2">{reward.icon}</div>
                  <div className="text-sm text-muted-foreground">{reward.place}</div>
                  <div className="text-xs text-neon-green font-medium">{reward.reward}</div>
                </div>
              ))}
            </div>
            <div className="flex space-x-4">
              <Button 
                className="flex-1 bg-gradient-to-r from-black via-neon-orange to-black border border-neon-orange/50"
                onClick={() => {
                  setShowTournamentModal(false);
                  toast.success('Tournament registration successful!', {
                    description: 'You are now registered for the Shadow Tournament. Good luck!'
                  });
                }}
              >
                <Medal className="w-4 h-4 mr-2" />
                Register Now
              </Button>
              <Button variant="outline" onClick={() => setShowTournamentModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Leaderboard Modal */}
      <Dialog open={showLeaderboardModal} onOpenChange={setShowLeaderboardModal}>
        <DialogContent className="bg-gradient-to-br from-black via-space-800/90 to-black border border-neon-orange/30 max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="gradient-text flex items-center">
              <Trophy className="w-5 h-5 mr-2" />
              Complete Shadow Elite Rankings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {[...leaderboard, 
              { rank: 6, name: 'QuantumGhost', level: 34, xp: 654000, avatar: '⚛️', badge: 'rare', earnings: '$654K' },
              { rank: 7, name: 'VoidTrader', level: 32, xp: 543000, avatar: '🕳️', badge: 'rare', earnings: '$543K' },
              { rank: 8, name: 'CipherMaster', level: 31, xp: 432000, avatar: '🔐', badge: 'uncommon', earnings: '$432K' },
              { rank: 9, name: 'PhantomProfit', level: 29, xp: 321000, avatar: '👻', badge: 'uncommon', earnings: '$321K' },
              { rank: 10, name: 'SilentStrike', level: 27, xp: 210000, avatar: '⚡', badge: 'common', earnings: '$210K' }
            ].map((player, index) => (
              <div key={player.rank} className={`bg-gradient-to-br from-black via-space-700/60 to-black backdrop-blur-xl rounded-lg p-4 border transition-all duration-300 hover-lift ${
                player.name === 'You' ? 'border-neon-purple/80 bg-gradient-to-br from-black via-neon-purple/20 to-black scale-105 shadow-lg shadow-neon-purple/30' : 'border-space-600/30'
              }`}>
                <div className="flex items-center space-x-4">
                  <div className={`relative w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    player.rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black' :
                    player.rank === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-black' :
                    player.rank === 3 ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white' :
                    'bg-space-700 text-muted-foreground'
                  }`}>
                    {player.rank}
                  </div>
                  <div className="text-2xl">{player.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold truncate">{player.name}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        player.badge === 'legendary' ? 'bg-gradient-to-r from-neon-orange to-neon-green text-white' :
                        player.badge === 'mythic' ? 'bg-gradient-to-r from-neon-purple to-neon-orange text-white' :
                        player.badge === 'epic' ? 'bg-gradient-primary text-white' :
                        player.badge === 'rare' ? 'bg-neon-purple/20 text-neon-purple' :
                        player.badge === 'uncommon' ? 'bg-neon-blue/20 text-neon-blue' :
                        'bg-space-600/20 text-space-300'
                      }`}>
                        {player.badge}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center space-x-4">
                      <span>Lv.{player.level}</span>
                      <span className="font-mono">{player.xp.toLocaleString()} XP</span>
                      <span className="text-profit">{player.earnings}</span>
                    </div>
                  </div>
                  {player.rank <= 3 && (
                    <Trophy className={`w-5 h-5 ${
                      player.rank === 1 ? 'text-yellow-500' :
                      player.rank === 2 ? 'text-gray-400' :
                      'text-orange-500'
                    }`} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Mission Details Modal */}
      {selectedMission && (
        <Dialog open={!!selectedMission} onOpenChange={() => setSelectedMission(null)}>
          <DialogContent className="bg-gradient-to-br from-black via-space-800/90 to-black border border-neon-purple/30">
            <DialogHeader>
              <DialogTitle className="gradient-text flex items-center">
                <selectedMission.icon className="w-5 h-5 mr-2" />
                {selectedMission.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-black via-space-700/40 to-black border border-neon-purple/20 rounded-lg p-4">
                <p className="text-muted-foreground mb-4">{selectedMission.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-mono">{selectedMission.progress}/{selectedMission.total}</span>
                  </div>
                  <Progress value={(selectedMission.progress / selectedMission.total) * 100} className="h-2" />
                  <div className="text-right text-sm text-neon-green font-medium">
                    Reward: {selectedMission.reward}
                  </div>
                </div>
              </div>
              {selectedMission.completed && (
                <Button 
                  className="w-full bg-gradient-to-r from-black via-profit/20 to-black border border-profit/50"
                  onClick={() => {
                    handleMissionClaim(dailyMissions.indexOf(selectedMission));
                    setSelectedMission(null);
                  }}
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Claim Reward
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default GameHub;
