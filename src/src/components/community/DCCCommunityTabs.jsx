import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Target, BookOpen, Send, Heart, MessageCircle, 
  Trophy, Star, Gift, Play, FileText, Medal, Award, Save, Edit3, X
} from 'lucide-react';
import CommunityFeed from '@/components/community/CommunityFeed';

export const CommunityTab = ({ 
  communityProgress, 
  user, 
  userPhoto,
  nutriPhoto,
  toast,
  isAdmin = false
}) => (
  <div className="space-y-6">
    <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-white">
              <img 
                src="https://storage.googleapis.com/hostinger-horizons-assets-prod/b9d04e3e-a936-445c-b4df-9d7bf5f8a549/8bb6ae5c5fe86a050a08629e7e8f34cf.png" 
                alt="DCC Mascot" 
                className="w-12 h-12 mr-3"
              />
              Meta da Leveza Coletiva
            </CardTitle>
            <CardDescription className="text-purple-100">
              Cada check seu ajuda toda a comunidade a bater a meta! Bora juntas!
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{Math.round(communityProgress)}%</div>
            <div className="text-sm opacity-90">Progresso Semanal</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Progress value={communityProgress} className="h-4 bg-purple-300" />
        <div className="flex justify-between mt-2 text-sm">
          <span>Juntas somos mais fortes! 💪</span>
          <span>{Math.round(communityProgress)}/100</span>
        </div>
      </CardContent>
    </Card>

    <CommunityFeed 
      user={user} 
      userPhoto={userPhoto} 
      nutriPhoto={nutriPhoto} 
      toast={toast} 
      isAdmin={isAdmin}
    />
  </div>
);

export const MetaTab = ({ communityProgress, weeklyRewards, ranking }) => (
  <div className="space-y-6">
    <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="w-6 h-6 mr-2" />
          Progresso da Comunidade
        </CardTitle>
        <CardDescription className="text-yellow-100">
          Quanto já atingimos juntas: {Math.round(communityProgress)}%
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Progress value={communityProgress} className="h-6 bg-yellow-300" />
      </CardContent>
    </Card>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {weeklyRewards.map((reward, index) => (
        <Card key={reward.week} className={`${reward.unlocked ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                {reward.type === 'pins' && <Medal className="w-5 h-5 mr-2 text-yellow-500" />}
                {reward.type === 'materials' && <FileText className="w-5 h-5 mr-2 text-blue-500" />}
                {reward.type === 'masterclass' && <Play className="w-5 h-5 mr-2 text-red-500" />}
                {reward.type === 'bonus' && <Gift className="w-5 h-5 mr-2 text-purple-500" />}
                Semana {reward.week}
              </span>
              {reward.unlocked && <Badge className="bg-green-500">Desbloqueado!</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold mb-2">{reward.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{reward.description}</p>
            {reward.unlocked && reward.type === 'masterclass' && reward.link && (
              <Button size="sm" className="w-full">
                <Play className="w-4 h-4 mr-2" />
                Assistir Masterclass
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
          Ranking de Participação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {ranking.slice(0, 5).map((user, index) => (
            <div key={user.email} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                }`}>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="font-medium">{user.name}</span>
              </div>
              <Badge variant="outline">{user.totalInteractions} interações</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export const DiaryTab = ({ 
  diaryEntry, 
  setDiaryEntry, 
  handleSaveDiaryEntry, 
  handleShareDiaryEntry, 
  user 
}) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BookOpen className="w-6 h-6 mr-2" />
          Diário da Leveza
        </CardTitle>
        <CardDescription>
          Espaço para suas reflexões pessoais sobre a jornada
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Como você está se sentindo hoje? Quais foram seus aprendizados? Compartilhe suas reflexões..."
          value={diaryEntry}
          onChange={(e) => setDiaryEntry(e.target.value)}
          className="min-h-[150px]"
        />
        <div className="flex gap-2">
          <Button onClick={handleSaveDiaryEntry} variant="outline" className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Salvar Reflexão
          </Button>
          <Button onClick={handleShareDiaryEntry} className="flex-1">
            <Send className="w-4 h-4 mr-2" />
            Compartilhar no Mural
          </Button>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Suas Reflexões Anteriores</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {JSON.parse(localStorage.getItem(`dccDiaryEntries_${user.email}_PriNutriApp`) || '[]').slice(0, 5).map(entry => (
            <div key={entry.id} className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm mb-2">{entry.content}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(entry.timestamp).toLocaleDateString('pt-BR')}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);