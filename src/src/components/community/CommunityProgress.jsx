import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Trophy, Crown, Star, Gift, Users, Target, Zap, Award, Calendar } from 'lucide-react';

const CommunityProgress = ({ user, toast }) => {
  const [communityProgress, setCommunityProgress] = useState(0);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [weeklyRewards, setWeeklyRewards] = useState([]);
  const [topParticipants, setTopParticipants] = useState([]);
  const [showRanking, setShowRanking] = useState(false);
  const [userStats, setUserStats] = useState({ posts: 0, likes: 0, comments: 0, logins: 0, checklist: 0, hydration: 0, diary: 0 });

  const progressImage = "https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/69f457481cefc33a9945ef2971e4dbf9.png";

  const weeklyRewardTypes = [
    { week: 1, type: 'pins', title: 'Selos Digitais', description: 'Coleção especial de pins exclusivos', icon: '🏅', color: 'from-yellow-400 to-yellow-600' },
    { week: 2, type: 'materials', title: 'Materiais Extras', description: 'PDFs, planners e conteúdos exclusivos', icon: '📄', color: 'from-blue-400 to-blue-600' },
    { week: 3, type: 'masterclass', title: 'Masterclass Ao Vivo', description: 'Acesso exclusivo à masterclass da nutri', icon: '🎥', color: 'from-purple-400 to-purple-600' },
    { week: 4, type: 'bonus', title: 'Bônus Surpresa', description: 'Uma surpresa especial preparada com carinho', icon: '🎁', color: 'from-pink-400 to-pink-600' }
  ];

  useEffect(() => {
    calculateCommunityProgress();
    calculateUserStats();
    loadWeeklyRewards();
    calculateTopParticipants();
  }, []);

  const calculateCommunityProgress = () => {
    // Get all community interactions
    const interactions = JSON.parse(localStorage.getItem('communityInteractions_PriNutriApp')) || [];
    
    // Calculate total interactions from all users
    const totalInteractions = interactions.length;
    
    // Target: 100 interactions per week to unlock rewards
    const weeklyTarget = 100;
    const progress = Math.min((totalInteractions % weeklyTarget) / weeklyTarget * 100, 100);
    const week = Math.floor(totalInteractions / weeklyTarget) + 1;
    
    setCommunityProgress(progress);
    setCurrentWeek(Math.min(week, 4));
  };

  const calculateUserStats = () => {
    const todayStr = new Date().toDateString();
    
    // Posts and interactions
    const posts = JSON.parse(localStorage.getItem('communityPosts_PriNutriApp')) || [];
    const userPosts = posts.filter(post => post.authorEmail === user.email);
    const userLikes = posts.reduce((total, post) => total + (post.likes.includes(user.email) ? 1 : 0), 0);
    const userComments = posts.reduce((total, post) => total + post.comments.filter(comment => comment.authorEmail === user.email).length, 0);
    
    // App interactions
    const logins = parseInt(localStorage.getItem(`loginCount_${user.email}_PriNutriApp`)) || 0;
    const checklistCompleted = localStorage.getItem(`dailyChecklistV3_${user.email}_${todayStr}_PriNutriApp`) ? 1 : 0;
    const hydrationMet = localStorage.getItem(`goalMet_${user.email}_${todayStr}_PriNutriApp`) === 'true' ? 1 : 0;
    const diaryFilled = JSON.parse(localStorage.getItem(`mealsV2_${user.email}_${todayStr}_PriNutriApp`) || '[]').length > 0 ? 1 : 0;
    
    setUserStats({
      posts: userPosts.length,
      likes: userLikes,
      comments: userComments,
      logins,
      checklist: checklistCompleted,
      hydration: hydrationMet,
      diary: diaryFilled
    });
  };

  const calculateTopParticipants = () => {
    const interactions = JSON.parse(localStorage.getItem('communityInteractions_PriNutriApp')) || [];
    const userCounts = {};
    
    interactions.forEach(interaction => {
      if (!userCounts[interaction.user]) {
        userCounts[interaction.user] = 0;
      }
      userCounts[interaction.user]++;
    });
    
    const sorted = Object.entries(userCounts)
      .map(([email, count]) => ({ email, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    setTopParticipants(sorted);
  };

  const loadWeeklyRewards = () => {
    const rewards = JSON.parse(localStorage.getItem('weeklyRewards_PriNutriApp')) || [];
    setWeeklyRewards(rewards);
  };

  const getUserPosition = () => {
    const userInteractions = JSON.parse(localStorage.getItem('communityInteractions_PriNutriApp')) || [];
    const userCount = userInteractions.filter(interaction => interaction.user === user.email).length;
    const position = topParticipants.findIndex(participant => participant.email === user.email) + 1;
    return { position: position || 'N/A', count: userCount };
  };

  const userPosition = getUserPosition();

  return (
    <div className="space-y-6">
      {/* Community Progress Bar */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center">
                <Target className="w-8 h-8 mr-3" />
                Progresso da Comunidade
              </CardTitle>
              <CardDescription className="text-yellow-100">
                Semana {currentWeek} - Trabalhando juntas pela Meta da Leveza
              </CardDescription>
            </div>
            <img src={progressImage} alt="Community Progress" className="w-20 h-20 object-contain" />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Progresso Coletivo</span>
              <span className="text-2xl font-bold text-primary">{Math.round(communityProgress)}%</span>
            </div>
            <Progress value={communityProgress} className="h-4" />
            <p className="text-center text-muted-foreground">
              Cada check seu ajuda toda a comunidade a bater a meta! Bora juntas! 💪
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Rewards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-primary">
            <Gift className="w-6 h-6 mr-2" />
            Recompensas Semanais
          </CardTitle>
          <CardDescription>Desbloqueie recompensas incríveis a cada semana!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weeklyRewardTypes.map((reward, index) => {
              const isUnlocked = currentWeek > reward.week;
              const isCurrent = currentWeek === reward.week;
              
              return (
                <motion.div
                  key={reward.week}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border-2 ${
                    isUnlocked ? 'border-green-400 bg-green-50' :
                    isCurrent ? 'border-yellow-400 bg-yellow-50' :
                    'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${reward.color} flex items-center justify-center text-2xl`}>
                      {reward.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{reward.title}</h3>
                      <p className="text-sm text-muted-foreground">Semana {reward.week}</p>
                    </div>
                    {isUnlocked && <Badge className="ml-auto bg-green-500">Desbloqueado!</Badge>}
                    {isCurrent && <Badge className="ml-auto bg-yellow-500">Em Progresso</Badge>}
                  </div>
                  <p className="text-sm">{reward.description}</p>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* User Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-primary">
            <Star className="w-6 h-6 mr-2" />
            Suas Contribuições
          </CardTitle>
          <CardDescription>Veja como você está contribuindo para a comunidade</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{userStats.posts}</div>
              <div className="text-sm text-muted-foreground">Posts</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{userStats.likes}</div>
              <div className="text-sm text-muted-foreground">Curtidas</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{userStats.comments}</div>
              <div className="text-sm text-muted-foreground">Comentários</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{userPosition.position}</div>
              <div className="text-sm text-muted-foreground">Posição</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ranking */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center text-primary">
                <Trophy className="w-6 h-6 mr-2" />
                Ranking de Participação
              </CardTitle>
              <CardDescription>As participantes mais ativas da comunidade</CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowRanking(!showRanking)}
            >
              {showRanking ? 'Ocultar' : 'Ver quem tá no topo'}
            </Button>
          </div>
        </CardHeader>
        {showRanking && (
          <CardContent>
            <div className="space-y-3">
              {topParticipants.slice(0, 5).map((participant, index) => (
                <div key={participant.email} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-400 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-orange-400 text-white' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">
                      {participant.email === user.email ? 'Você' : `Participante ${index + 1}`}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {participant.count} interações
                    </div>
                  </div>
                  {index === 0 && <Crown className="w-5 h-5 text-yellow-500" />}
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default CommunityProgress;