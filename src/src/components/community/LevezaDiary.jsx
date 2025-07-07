import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Heart, Share, Save, Sparkles, Calendar, Smile, Star } from 'lucide-react';

const LevezaDiary = ({ user, toast }) => {
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [newEntry, setNewEntry] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [showShareOption, setShowShareOption] = useState(false);

  const emojis = ['😊', '💪', '🌟', '✨', '🦋', '🌸', '💖', '🌈', '🎯', '🏆', '🙌', '💫'];
  const prompts = [
    "Como me senti hoje em relação ao meu autocuidado?",
    "Qual foi minha maior vitória hoje?",
    "O que me trouxe leveza hoje?",
    "Como posso ser mais gentil comigo mesma amanhã?",
    "Que hábito saudável quero cultivar?",
    "O que aprendi sobre mim hoje?",
    "Como posso celebrar meu progresso?",
    "Que gratidão quero expressar hoje?"
  ];

  useEffect(() => {
    loadDiaryEntries();
  }, []);

  const loadDiaryEntries = () => {
    const savedEntries = localStorage.getItem(`levezaDiary_${user.email}_PriNutriApp`);
    if (savedEntries) {
      try {
        setDiaryEntries(JSON.parse(savedEntries));
      } catch (e) {
        setDiaryEntries([]);
      }
    }
  };

  const saveDiaryEntries = (entries) => {
    localStorage.setItem(`levezaDiary_${user.email}_PriNutriApp`, JSON.stringify(entries));
    setDiaryEntries(entries);
  };

  const handleSaveEntry = (shareWithCommunity = false) => {
    if (!newEntry.trim()) {
      toast({
        title: "Ops! 📝",
        description: "Escreva algo antes de salvar!",
        variant: "destructive"
      });
      return;
    }

    const entry = {
      id: Date.now(),
      content: newEntry,
      emoji: selectedEmoji,
      timestamp: new Date().toISOString(),
      shared: shareWithCommunity
    };

    const updatedEntries = [entry, ...diaryEntries];
    saveDiaryEntries(updatedEntries);

    if (shareWithCommunity) {
      // Add to community posts
      const communityPosts = JSON.parse(localStorage.getItem('communityPosts_PriNutriApp')) || [];
      const communityPost = {
        id: Date.now() + 1,
        author: user.name,
        authorEmail: user.email,
        content: `💭 Do meu Diário da Leveza:\n\n${newEntry} ${selectedEmoji}`,
        category: 'desabafos',
        timestamp: new Date().toISOString(),
        likes: [],
        comments: []
      };
      
      communityPosts.unshift(communityPost);
      localStorage.setItem('communityPosts_PriNutriApp', JSON.stringify(communityPosts));

      // Add to community interactions
      const interactions = JSON.parse(localStorage.getItem('communityInteractions_PriNutriApp')) || [];
      interactions.push({
        type: 'diary_share',
        user: user.email,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('communityInteractions_PriNutriApp', JSON.stringify(interactions));

      toast({
        title: "Reflexão Compartilhada! ✨",
        description: "Sua reflexão foi salva e compartilhada com a comunidade!",
        className: "bg-purple-500 text-white"
      });
    } else {
      toast({
        title: "Reflexão Salva! 💖",
        description: "Sua reflexão foi salva no seu diário pessoal!",
        className: "bg-pink-500 text-white"
      });
    }

    setNewEntry('');
    setSelectedEmoji('');
    setShowShareOption(false);
  };

  const getRandomPrompt = () => {
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    setNewEntry(randomPrompt + '\n\n');
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* New Entry */}
      <Card className="bg-gradient-to-br from-pink-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center text-primary">
            <BookOpen className="w-6 h-6 mr-2" />
            Diário da Leveza
          </CardTitle>
          <CardDescription>
            Um espaço para suas reflexões, sentimentos e jornada de autocuidado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Nova Reflexão</h3>
            <Button variant="outline" size="sm" onClick={getRandomPrompt}>
              <Sparkles className="w-4 h-4 mr-2" />
              Inspiração
            </Button>
          </div>
          
          <Textarea
            placeholder="Como você se sente hoje? O que trouxe leveza para sua vida? Compartilhe seus pensamentos..."
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            rows={6}
            className="resize-none"
          />
          
          <div>
            <p className="text-sm font-medium mb-2">Como você está se sentindo?</p>
            <div className="flex flex-wrap gap-2">
              {emojis.map(emoji => (
                <Button
                  key={emoji}
                  variant={selectedEmoji === emoji ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedEmoji(emoji)}
                  className="text-lg"
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => handleSaveEntry(false)}
              className="flex-1 bg-pink-500 hover:bg-pink-600"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Reflexão
            </Button>
            <Button 
              onClick={() => setShowShareOption(!showShareOption)}
              variant="outline"
              className="border-purple-400 text-purple-600 hover:bg-purple-50"
            >
              <Share className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
          </div>
          
          <AnimatePresence>
            {showShareOption && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-purple-100 rounded-lg"
              >
                <p className="text-sm text-purple-800 mb-3">
                  Compartilhar sua reflexão pode inspirar outras pessoas da comunidade! 
                  Sua experiência pode ajudar alguém que está passando por algo similar.
                </p>
                <Button 
                  onClick={() => handleSaveEntry(true)}
                  className="w-full bg-purple-500 hover:bg-purple-600"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Compartilhar no Mural
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Diary Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-primary">
            <Calendar className="w-6 h-6 mr-2" />
            Suas Reflexões
          </CardTitle>
          <CardDescription>
            Releia suas jornadas e veja seu crescimento ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {diaryEntries.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Seu diário está esperando por você!</p>
              <p className="text-sm">Comece escrevendo sua primeira reflexão acima.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {diaryEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border rounded-lg bg-gradient-to-r from-pink-50 to-purple-50"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{entry.emoji}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(entry.timestamp)}
                      </span>
                    </div>
                    {entry.shared && (
                      <div className="flex items-center gap-1 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                        <Share className="w-3 h-3" />
                        Compartilhado
                      </div>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap text-foreground">{entry.content}</p>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LevezaDiary;